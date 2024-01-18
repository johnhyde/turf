import { hex2patp, patp2hex, patp2dec, patp } from 'urbit-ob';
import { UrbitRTCApp, UrbitRTCPeerConnection } from 'rtcswitchboard';
import { RallyIncoming, RallyCrew, stringToDest, destToString, getDap } from 'lib/rally';
// import { patp2dec } from 'urbit-ob/src/internal/co';

export class Horn extends EventTarget {
  constructor(api, dap) {
    super();
    this.api = api;
    this.dap = dap || api.desk
    this.incomings = {};
    this.rallies = {};
  }

  watchIncoming(dap=null) {
    dap = dap || this.dap
    if (!this.incomings[dap]) {
      this.incomings[dap] = new RallyIncoming(this.api, dap);
    }
    return this.incomings[dap];
  }

  createRally(path=null, options={}) {
    path = path || '/' + uuidv4();
    if (path[0] !== '/') path = '/' + path;
    const crewId = `/${this.dap}${path}`
    const dest = {
      ship: '~' + this.api.ship,
      crewId,
    };
    return this.joinRally(dest, options);
  }

  joinRally(dest, options={}) {
    if (typeof dest === 'string') dest = stringToDest(dest);
    const destStr = destToString(dest);
    if (this.rallies[destStr]) return this.rallies[destStr]
    const dap = getDap(dest.crewId);
    if (this.incomings[dap]) this.incomings[dap].removeDest(dest);
    const rally = new Rally(this.api, dest, options);
    this.rallies[destStr] = rally;
    return rally;
  }

  getRally(destStr) {
    if (typeof destStr !== 'string') destStr = destToString(destStr);
    return this.rallies[destStr];
  }
}

export class Rally extends EventTarget {
  constructor(api, dest, options={}) {
    super();
    this.api = api;
    this.dest = dest;
    this.dap = getDap(dest.crewId);
    this.crewId = dest.crewId;
    this.rtc = new UrbitRTCApp(this.dap, { iceServers: [] }, api);
    this.calls = {};
    this.rings = [];
    this.toAnswer = new Set();
    this.setupCrew(options);
    this.setupRtc();
    // if (!options.waitToInit) {
    //   this.init();
    // }
  }

  init() {
    this.crew.init();
  }

  setupCrew(options={}) {
    this.crew = new RallyCrew(this.api, this.dest, options);
    this.crew.addEventListener('client-update', (e) => {
      this.updateCalls();
    });
    this.crew.addEventListener('crew-update', (e) => {
      this.updateCalls();
    });
  }

  setupRtc() {
    rtc.addEventListener("incomingcall", (ring) => {
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
    });
  
    rtc.addEventListener("hungupcall", ({ uuid }) => {
      _phone.delCallByUuid(uuid);
    });
    rtc.initialize();
  }

  async updateCalls() {
    if (!this.crew.clientId) return;
    const us = this.client;
    const clients = this.clients;
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
      const callId = makeCallId(this.crewId, client.clientId, us.clientId);
      const call = new UrbitRTCPeerConnection(client.ship.substring(1), this.dap, callId, this.api, this.rtc.configuration);
      this.calls[str] = call;
      this.listenToCall(call);
      call.resubscribe() // todo?: is this right????? can I????
        .catch(() => {});
    });
    toCall.forEach((client) => {
      const str = clientToString(client);
      if (this.calls[str]) {
        existingCalls.delete(str);
        return;
      }
      const callId = makeCallId(this.crewId, us.clientId, client.clientId);
      const call = new UrbitRTCPeerConnection(client.ship.substring(1), this.dap, callId, this.api, this.rtc.configuration);
      this.calls[str] = call;
      this.listenToCall(call);
      this.addDataChannel(call);
      call.dispatchUrbitState('dialing');
      call.ring(callId);
    });
    // now, any remaining existingCalls are ones that are no longer valid (removed from crew)
    Array.from(existingCalls).forEach((clientStr) => {
      this.calls[clientStr].close();
      delete this.calls[clientStr];
    });
  }

  get our() {
    return '~' + this.api.ship;
  }

  get client() {
    return {
      ship: this.our,
      clientId: this.clientId,
    };
  }

  get clientId() {
    return this.crew?.clientId;
  }

  get clients() {
    let clients = [];
    Object.entries(this.crew.crew.peers).forEach(([ship, clientIds]) => {
      const newClients = clientIds.filter(id => id !== this.clientId)
                           .map(clientId => ({ ship, clientId }));
      clients = clients.concat(newClients);
    });
    return clients;
  }

  answerRing(ring) {
    const call = ring.answer();
    this.listenToCall(call);
    this.calls[ring.clientStr] = call;
    call.initialize();
  }

  listenToCall(call) {
    call.addEventListener('hungupcall', (e) => {
      console.log('call hung up', call.uuid);
    });
    call.addEventListener('statechanged', ({ uuid, urbitState }) => {
      console.log(`state change for ${uuid}: ${urbitState}`);
    });
    call.ondatachannel = (event) => {
      call.channel = event.channel;
      call.channel.onmessage = this.handleIncomingMessage;
      call.channel.onopen = this.handleChannelOpen;
      call.channel.onclose = this.handleChannelClose;
    };
  }

  addDataChannel(call) {
    call.channel = call.createDataChannel(this.dap + '-text');
    call.channel.onmessage = this.handleIncomingMessage;
    call.channel.onopen = this.handleChannelOpen;
    call.channel.onclose = this.handleChannelClose;
  }

  invite(...args) {
    return this.crew.invite(...args);
  }

  close() {
    return this.crew.delete();
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

// client: { ship: '~zod', clientId: '0v7eg.gfs4l.ute9f'}
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
// window.hmm = patp2dec;
// window.hmn = patp2hex;

export function clientToString(client) {
  return client.ship + ':' + client.clientId;
}

export function stringToClient(str) {
  const [ship, clientId] = str.split(':');
  return { ship, clientId };
}

export function makeCallId(crewId, callerId, calleeId) {
  return `._${crewId}_${callerId}_${calleeId}`.replaceAll('/', '-');
}

export function parseCallId(callId) {
  const [_, crewId, callerId, calleeId] = callId.replaceAll('-', '/').split('_');
  return { crewId: crewId, callerId, calleeId };
}

export function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
