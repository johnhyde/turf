import { hex2patp, patp2hex, patp2dec, patp } from 'urbit-ob';
import { UrbitRTCApp, UrbitRTCPeerConnection } from 'lib/switchboard';
import { RallyIncoming, RallyPublics, RallyCrew, stringToDest, destToString, getDap } from 'lib/rally';
import { DestsUpdateEvent, CrewUpdateEvent, CrewQuitEvent } from 'lib/rally';
// import { patp2dec } from 'urbit-ob/src/internal/co';

export class Horn extends EventTarget {
  constructor(urbit, rtc, dap, options = {}) {
    super();
    this.urbit = urbit;
    this.rtc = rtc;
    if (!this.rtc) {
      this.rtc = new UrbitRTCApp(this.dap, options.rtcOptions || {}, urbit);
      this.rtc.initialize();
    }
    this.api = { urbit, rtc };
    this.dap = dap || urbit.desk
    this.incomings = {};
    this.rallies = {};
    this.crews = {};
    this.app = options.app || 'rally';
    this.aptions = { app: this.app };
  }

  watchIncoming(dap=null) {
    dap = dap || this.dap
    if (!this.incomings[dap]) {
      this.incomings[dap] = new RallyIncoming(this.urbit, dap, this.aptions);
    }
    return this.incomings[dap];
  }

  watchPublics(host, dap=null, options={}) {
    dap = dap || this.dap;
    return new RallyPublics(this.urbit, host, dap, {
      ...this.aptions,
      ...options,
    });
  }

  createRally(path=null, options={}) {
    path = path || '/' + genCrewId();
    if (path[0] !== '/') path = '/' + path;
    const crewId = `/${this.dap}${path}`
    const dest = {
      ship: '~' + this.urbit.ship,
      crewId,
    };
    return this.joinRally(dest, options);
  }

  joinRally(dest, options={}) {
    if (typeof dest === 'string') dest = stringToDest(dest);
    const destStr = destToString(dest);
    let rally = this.rallies[destStr];
    if (rally) {
      if (!(['new', 'ejected'].includes(rally.status))) {
        return rally;
      } else {
        rally.shutDown();
      }
    }
    const dap = getDap(dest.crewId);
    if (this.incomings[dap]) this.incomings[dap].removeDest(dest);
    rally = new Rally(this.api, dest, {
      ...this.aptions,
      ...options,
    });
    this.rallies[destStr] = rally;
    const controller = new AbortController();
    rally.addEventListener('crew-status', (e) => {
      if (e.status === 'ejected') {
        delete this.rallies[destStr];
        controller.abort();
      }
    }, { signal: controller.signal });
    return rally;
  }

  watchCrew(dest, options={}) {
    options = {
      dontEnter: true,
      ...this.aptions,
      ...options,
    };
    return new RallyCrew(this.urbit, dest, options);
  }

  getRally(destStr) {
    if (typeof destStr !== 'string') destStr = destToString(destStr);
    return this.rallies[destStr];
  }

  get incoming() {
    return this.incomings[this.dap]?.incoming || [];
  }
}

export class Rally extends RallyCrew {
  constructor(api, dest, options={}) {
    super(api.urbit, dest, options);
    this.api = api;
    this.urbit = api.urbit;
    this.rtc = api.rtc || new UrbitRTCApp(this.dap, { iceServers: [] }, this.urbit);
    this.dest = dest;
    this.dap = getDap(dest.crewId);
    this.calls = {};
    this.rings = [];
    this.toAnswer = new Set();
    this.controller = new AbortController();
    this.setupCrew();
    this.setupRtc();
  }

  setupCrew() {
    this.addEventListener('client-update', (e) => {
      this.updateCalls();
    }, { signal: this.controller.signal });
    this.addEventListener('crew-update', (e) => {
      this.updateCalls();
    }, { signal: this.controller.signal });
  }

  setupRtc() {
    rtc.addEventListener('incomingcall', (ring) => {
      const { crewId, callerId: clientId, calleeId: us } = parseCallId(ring.uuid);
      if (!(crewId && clientId && us)) return;
      if (this.crewId !== crewId) return;
      ring.clientId = clientId;
      ring.us = us;
      const client = {
        ship: '~' + ring.peer,
        clientId: clientId,
      };
      ring.clientStr = clientToString(client);
      if (!this.clientId) {
        console.log('call in, waiting', ring);
        this.rings.push(ring);
      } else {
        console.log('call in', ring);
        if (this.clientId !== us) return;
        if (this.toAnswer.has(ring.clientStr)) {
          this.answerRing(ring);
        } else {
          this.rings.push(ring); // maybe we need to wait for info
        }
      }
    }, { signal: this.controller.signal });
  }

  shutDown() {
    super.shutDown();
    this.controller.abort();
  }

  async updateCalls() {
    if (!this.clientId) return;
    const us = this.client;
    const clients = this.active ? this.clients : [];
    const toCall = [], toAnswer = new Set();
    clients.forEach((client) => {
      if (shouldCall(us, client)) {
        toCall.push(client);
      } else {
        const str = clientToString(client);
        toAnswer.add(str);
      }
    });
    this.toAnswer = toAnswer;
    const unanswered = Array.from(toAnswer);
    this.rings = this.rings.filter((ring) => {
      if (ring.us !== this.clientId) return false;
      // if not recognized, keep it around in case it turns out to be valid later
      if (!this.toAnswer.has(ring.clientStr)) return true;
      this.answerRing(ring);
    });
    const existingCalls = new Set(Object.keys(this.calls));
    unanswered.forEach((str) => {
      const client = stringToClient(str);
      if (this.calls[str]) {
        existingCalls.delete(str);
        return;
      }
    });
    toCall.forEach((client) => {
      const str = clientToString(client);
      if (this.calls[str]) {
        existingCalls.delete(str);
        return;
      }
      const callId = makeCallId(this.crewId, us.clientId, client.clientId);
      const call = new UrbitRTCPeerConnection(client.ship.substring(1), this.dap, callId, this.urbit, this.rtc.app, this.rtc.configuration);
      this.calls[str] = call;
      this.listenToCall(call, str);
      this.addDataChannel(call);
      // call.dispatchUrbitState('dialing');
      call.urbitState = 'dialing';
      call.ring(callId);
      this.dispatchEvent(new CallsUpdateEvent('add', str, call));
    });
    // now, any remaining existingCalls are ones that are no longer valid (removed from crew)
    Array.from(existingCalls).forEach((clientStr) => {

      const call = this.calls[clientStr];
      if (call.connectionState !== 'closed') call.close();
      this.deleteCall(clientStr);
    });
  }

  deleteCall(clientStr) {
    delete this.calls[clientStr];
    this.dispatchEvent(new CallsUpdateEvent('del', clientStr));
  }

  get client() {
    return {
      ship: this.our,
      clientId: this.clientId,
    };
  }

  get clients() {
    let clients = [];
    Object.entries(this.crew.peers).forEach(([ship, clientIds]) => {
      const newClients = clientIds.filter(id => id !== this.clientId)
                           .map(clientId => ({ ship, clientId }));
      clients = clients.concat(newClients);
    });
    return clients;
  }

  answerRing(ring) {
    const call = ring.answer();
    this.listenToCall(call, ring.clientStr);
    this.calls[ring.clientStr] = call;
    this.dispatchEvent(new CallsUpdateEvent('add', ring.clientStr, call));
    call.initialize();
  }

  listenToCall(call, clientStr) {
    call.addEventListener('hungupcall', (e) => {
      console.log('call hung up', call.uuid);
      this.deleteCall(clientStr);
    });
    call.addEventListener('statechanged', ({ uuid, urbitState }) => {
      console.log(`state change for ${uuid}: ${urbitState}`);
    });
    call.remoteStreams = new Set();
    call.addEventListener('track', (event) => {
      event.streams.forEach(s => call.remoteStreams.add(s));
    });
    call.ondatachannel = (event) => {
      call.channel = event.channel;
      this.handleDataChannel(call.channel);
    };
  }

  addDataChannel(call) {
    call.channel = call.createDataChannel(this.dap + '-text');
    this.handleDataChannel(call.channel);
  }

  handleDataChannel(channel) {
    channel.addEventListener('message', this.handleIncomingMessage);
    channel.addEventListener('open', this.handleChannelOpen);
    channel.addEventListener('close', this.handleChannelClose);
    window.chan = channel;
  }

  handleIncomingMessage(e) {
    console.log('IncomingMessage', e);
  }
  handleChannelOpen(e) {
    console.log('ChannelOpen', e);
  }
  handleChannelClose(e) {
    console.log('ChannelClose', e);
  }
}

// example client: { ship: '~zod', clientId: '0v7eg.gfs4l.ute9f'}
export function shouldCall(clientA, clientB) {
  if (clientA.ship !== clientB.ship) {
    return shipLessThan(clientA.ship, clientB.ship);
  } else {
    return clientIdLessThan(clientA.clientId, clientB.clientId);
  }
}
export function clientIdLessThan(clientIdA, clientIdB) {
  return clientIdA < clientIdB; // todo?: be better than this??
}
export function shipLessThan(shipA, shipB) {
  const numA = patp2dec(shipA), numB = patp2dec(shipB);
  return numLessThan(numA, numB);

}
export function numLessThan(numA, numB) {
  if (numA === numB) return false;
  if (numA.length < numB.length) return true;
  if (numA.length > numB.length) return false;
  if (numA.length <= 16) {
    return Number(numA) < Number(numB);
  }
  const frontA = numA.substring(0, 15), frontB = numB.substring(0, 15);
  const backA = numA.substring(15), backB = numB.substring(15);
  if (frontA === frontB && backA.length && backB.length) {
    return numLessThan(backA, backB);
  }
  return numLessThan(frontA, frontB);
}
// console.log('should say true', shipLessThan('~midlev-mindyr-midlev-mindyr--midlev-mindyr-midlev-mindyr', '~midlev-mindyr-midlev-mindyr--midlev-mindyr-midlev-minnup'));

export function clientToString(client) {
  return client.ship + ':' + client.clientId;
}

export function stringToClient(str) {
  const [ship, clientId] = str.split(':');
  return { ship, clientId };
}

export function makeCallId(crewId, callerId, calleeId) {
  return `._${crewId}_${callerId}_${calleeId}`
    .replaceAll('_', '___')
    .replaceAll('-', '_--')
    .replaceAll('/', '_-_');
}

export function parseCallId(callId) {
  let [_, crewId, callerId, calleeId] = callId
    .replaceAll('_-_', '/')
    .replaceAll('_--', '-')
    .split('___');
  crewId
  return { crewId: crewId, callerId, calleeId };
}

export function genCrewId() {
  return uuidv4().replaceAll('-', '.');
}
export function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

export class CallsUpdateEvent extends Event {
  constructor(kind, str, call) {
    super('calls-update');
    this.kind = kind;
    this.clientString = str;
    if (call) this.call = call;
  }
}