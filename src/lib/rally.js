export class RallyList extends EventTarget {
  constructor(urbit, path, dap=null, options={}) {
    super();
    this.urbit = urbit;
    this.dap = dap;
    this.dests = new Set();
    this.path = path;
    if (!options.waitToInit) {
      this.init();
    }
  }

  get destObjs() {
    return Array.from(this.dests).map(stringToDest);
  }

  init() {
    this.promise = this.urbit.subscribe({
      app: 'rally',
      path: this.path,
      event: (update) => {
        this.update(update);
      },
      err: (err) => {
        this.dispatchEvent(new SubscriptionErrorEvent(this.path, err));
      },
      quit: (data) => {
        this.dispatchEvent(new SubscriptionQuitEvent(this.path, data));
      }
    });
    return this.promise;
  }

  async cancel() {
    if (this.promise) {
      const sub = await this.promise;
      return this.urbit.unsubscribe(sub);
    }
  }

  update(update) {
    updateDestsList(this.dests, update);
    this.dispatchEvent(new DestsUpdateEvent(update, this.dap));
  }

  removeDest(dest) {
    this.update({
      kind: 'fade',
      dest,
    });
  }

  removeDestString(str) {
    this.update({
      kind: 'fade',
      dest: stringToDest(str),
    });
  }
}

export class RallyIncoming extends RallyList {
  constructor(urbit, dap=null, options={}) {
    const path = '/0/feet/incoming' + (dap ? '/' + dap : '');
    super(urbit, path, dap, options);
  }

  get incoming() {
    return this.destObjs;
  }

  reject(dest) {
    this.removeDest(dest);
    return leaveRally(this.urbit, dest);
  }
}

export class RallyPublics extends RallyList {
  constructor(urbit, host, dap, options={}) {
    const path = `/0/crews/${host}/${dap}`;
    super(urbit, path, dap, options);
    this.host = host;
    this.crews = {};
    this.options = options;
  }

  update(update) {
    updateDestsList(this.dests, update);
    if (this.options.watchDetails) {
      if (update.kind === 'fade') {
        const destStr = destToString(update.dest);
        this.crews[destStr]?.cancel();
        delete this.crews[destStr];
      } else {
        this.dests.forEach((dest) => {
          if (!this.crews[dest]) {
            this.crews[dest] = new RallyCrew(this.urbit, stringToDest(dest), { dontEnter: true });
          }
        });
      }
    }
    this.dispatchEvent(new DestsUpdateEvent(update, this.dap));
  }

  get publics() {
    return this.destObjs;
  }
}

const statuses = 'new | waiting | watching | active | ejected'.split(' | ');

export class RallyCrew extends EventTarget {
  constructor(urbit, dest, options={}) {
    super();
    this.urbit = urbit;
    this.dest = dest;
    this.host = dest.ship;
    this.crewId = dest.crewId;
    this.clientId = null;
    this.crew = {
      id: dest.crewId,
      new: true,
      ...defaultCrew(),
    };
    // new | waiting | watching | active | ejected
    this.status = 'new';
    this.path = '/0/crow/' + dest.ship + dest.crewId;
    this.options = options;
    if (options.clientId && !options.dontEnter) {
      this.clientId = options.clientId;
      this.enter();
    }
    if (!options.waitToInit) {
      this.init();
    }
  }

  setStatus(newStatus) {
    if (!statuses.includes(newStatus)) throw 'invalid crew status';
    this.status = newStatus;
    this.dispatchEvent(new CrewStatusEvent(this.status));
  }

  get id() {
    return destToString(this.dest);
  }

  get our() {
    return '~' + this.urbit.ship;
  }

  get active() {
    return  (this.crew.peers?.[our] || []).includes(this.clientId);
  }

  get new() { return this.statuts === 'new'; }
  get waiting() { return this.statuts === 'waiting'; }
  get watching() { return this.statuts === 'watching'; }

  get peers() {
    return Object.keys(this.crew.peers);
  }

  get activePeers() {
    return Object.entries(this.crew.peers).filter(p => p[1].length).map(p => p[0])
  }

  init() {
    this.setStatus('waiting');
    this.promise = this.urbit.subscribe({
      app: 'rally',
      path: this.path,
      event: (update) => {
        if (update.kind === 'you-are') {
          console.log('client update', update);
          if (!this.clientId && !this.options.dontEnter) {
            this.clientId = update.uuid;
            this.enter();
          }
          this.dispatchEvent(new ClientUpdateEvent(update));
        } else {
          console.log('crew update', update);
          if (this.status === 'waiting') {
            this.setStatus('watching');
          }
          if (update.kind === 'quit') {
            console.log('it is over, bros');
            this.shutDown();
            this.dispatchEvent(new CrewQuitEvent(update.host));
          } else { // waves
            updateCrew(this.crew, update.waves);
            if (this.clientId) {
              if (this.crew.peers[our]?.includes(this.clientId)) {
                this.setStatus('active');
              } else if (this.status === 'active') {
                this.shutDown();
              }
            }
            this.dispatchEvent(new CrewUpdateEvent(update));
          }
        }
      },
      err: (err) => {
        this.dispatchEvent(new SubscriptionErrorEvent(this.path, err));
      },
      quit: (data) => {
        this.dispatchEvent(new SubscriptionQuitEvent(this.path, data));
      }
    });
    return this.promise;
  }

  shutDown() {
    this.cancel();
    this.setStatus('ejected');
  }

  async cancel() {
    if (this.promise) {
      const sub = await this.promise;
      return this.urbit.unsubscribe(sub);
    }
  }

  async delete() {
    const result = await this.urbit.poke({
      app: 'rally',
      mark: 'delete',
      json: {
        crewId: this.crewId,
        host: null,
      },
      onError: (e) => {
        console.error('RallyCrew failed to delete crew at ' + this.path, e);
      },
    });
    this.shutDown();
    return result;
  }

  enter() {
    if (!this.clientId) throw new Error('Cannot enter without a clientId');
    return this.urbit.poke({
      app: 'rally',
      mark: 'enter',
      json: {
        dest: this.dest,
        uuid: this.clientId,
      },
      onError: (e) => {
        console.error('RallyCrew failed to enter crew at ' + this.path, e);
      },
    });
  }

  leave(allClients=false) {
    if (allClients) {
      return leaveRally(this.urbit, this.dest);
    }
    if (!this.clientId) throw new Error('Cannot leave without a clientId');
    return this.sendAction([{ leave: null }]);
  }

  invite(ships) {
    if (!Array.isArray(ships)) ships = [ships];
    return this.sendAction(
      ships.map((ship) => ({ wave: { 'add-peer': { ship, uuids: [] } }}))
    );
  }

  confirm(ship) {
    return this.sendAction([{ 'accept-noob': { ship } }]);
  }

  sendAction(stirs) {
    this.urbit.poke({
      app: 'rally',
      mark: 'action',
      json: {
        version: 0,
        dest: this.dest,
        stirs,
      },
      onError: (e) => {
        console.error('RallyCrew failed to send actions to crew at ' + this.path, stirs, e);
      },
    });
  }
}

//
// Events
//

export class DestsUpdateEvent extends Event {
  constructor(update, dap) {
    super('dests-update');
    this.kind = update.kind;
    this.update = update;
    this.dap = dap;
  }
}

export class ClientUpdateEvent extends Event {
  constructor(update) {
    super('client-update');
    this.kind = update.kind;
    this.update = update;
  }
}

export class CrewUpdateEvent extends Event {
  constructor(update) {
    super('crew-update');
    this.kind = update.kind;
    this.update = update;
  }
}

export class CrewQuitEvent extends Event {
  constructor(host) {
    super('crew-quit');
    this.host = host;
  }
}

export class CrewStatusEvent extends Event {
  constructor(status) {
    super('crew-status');
    this.status = status;
  }
}

export class SubscriptionErrorEvent extends Event {
  constructor(path, error) {
    super('subscription-error');
    this.path = path;
    this.error = error;
  }
}

export class SubscriptionQuitEvent extends Event {
  constructor(path, data) {
    super('subscription-quit');
    this.path = path;
    this.data = data;
  }
}

//
// API Calls
//

export function leaveRally(urbit, dest) {
  return urbit.poke({
    app: 'rally',
    mark: 'leave',
    json: { dest },
    onError: (e) => {
      console.error('RallyCrew failed to fully leave crew at ' + destToString(dest), e);
    },
  });
}
  
//
// Helpers
//

export function updateDestsList(dests, update) {
  if (update.kind === 'cries') {
    update.dests.forEach((dest) => dests.add(destToString(dest)));
  } else {
    const str = destToString(update.dest);
    if (update.kind === 'cry') {
      dests.add(str);
    } else {
      dests.delete(str);
    }
  }
}

export function updateCrew(crew, waves=[]) {
  waves.forEach((wave) => washCrew(crew, wave));
}

export function washCrew(crew, wave) {
  if (crew.new) crew.new = false;
  switch (wave.kind) {
    case 'set-crew': {
      Object.assign(crew, wave.crew);
      break;
    }
    case 'add-peer': {
      const { ship, uuids } = wave;
      const oldUuids = crew.peers[ship] || [];
      const newUuids = Array.from(new Set([...oldUuids, ...uuids]));
      crew.peers[ship] = newUuids;
      break;
    }
    case 'del-peer': {
      delete crew.peers[wave.ship];
      break;
    }
    case 'add-peer-client': {
      const { ship, uuid } = wave;
      const oldUuids = crew.peers[ship] || [];
      const newUuids = Array.from(new Set([...oldUuids, uuid]));
      crew.peers[ship] = newUuids;
      break;
    }
    case 'del-peer-client': {
      const { ship, uuid } = wave;
      if (!crew.peers[ship]) break;
      const set = new Set(crew.peers[ship]);
      set.delete(uuid);
      crew.peers[ship] = Array.from(set);
      break;
    }
    case 'add-noob': {
      const { ship, uuids } = wave;
      const oldUuids = crew.noobs[ship] || [];
      const newUuids = Array.from(new Set([...oldUuids, ...uuids]));
      crew.noobs[ship] = newUuids;
      break;
    }
    case 'del-noob': {
      delete crew.noobs[wave.ship];
      const set = new Set(crew.filtered);
      set.delete(wave.ship);
      crew.filtered = Array.from(set);
      break;
    }
    case 'add-noob-client': {
      const { ship, uuid } = wave;
      const oldUuids = crew.noobs[ship] || [];
      const newUuids = Array.from(new Set([...oldUuids, uuid]));
      crew.noobs[ship] = newUuids;
      break;
    }
    case 'del-noob-client': {
      const { ship, uuid } = wave;
      if (!crew.noobs[ship]) break;
      const set = new Set(crew.noobs[ship]);
      set.delete(uuid);
      crew.noobs[ship] = Array.from(set);
      break;
    }
    case 'set-filtered': {
      const set = new Set(crew.filtered);
      if (wave.filtered) {
        set.add(wave.ship);
      } else {
        set.delete(wave.ship);
      }
      crew.filtered = Array.from(set);
      break;
    }
    case 'set-access-list': {
      crew.access.list = wave.list;
      break;
    }
    case 'set-access-filter': {
      crew.access.filter = wave.filter;
      break;
    }
    case 'grant-access': {
      const shipSet = new Set(crew.access.list.ships);
      if (crew.access.list.kind === 'white') {
        shipSet.add(wave.ship);
      } else {
        shipSet.delete(wav.ship);
      }
      crew.access.list.ships = Array.from(shipSet);
      break;
    }
    case 'revoke-access': {
      const shipSet = new Set(crew.access.list.ships);
      if (crew.access.list.kind === 'white') {
        shipSet.delete(wav.ship);
      } else {
        shipSet.add(wave.ship);
      }
      crew.access.list.ships = Array.from(shipSet);
      break;
    }
    case 'add-admin': {
      crew.admins = Array.from(new Set([...crew.admins, ...wave.ships]));
      break;
    }
    case 'del-admin': {
      const shipSet = new Set(crew.admins);
      wave.ships.forEach(ship => shipSet.delete(ship));
      crew.admins = Array.from(shipSet);
      break;
    }
    case 'set-visibility': {
      crew.visibility = wave.visibility;
      break;
    }
    case 'set-persistent': {
      crew.persistent = wave.persistent;
      break;
    }
    case 'set-confirm': {
      crew.confirm = wave.confirm;
      break;
    }
    default: {
      console.log('wash crew not implemented for wave of kind', wave.kind);
      break;
    }
  }
}

export function destToString(dest) {
  return dest.ship + ':' + dest.crewId;
}

export function stringToDest(str) {
  const parts = str.split(':');
  return {
    ship: parts[0],
    crewId: parts[1],
  };
}

export function getDap(crewId) {
  return crewId.split('/')[1] || null;
}

export function defaultCrew() {
  return {
    version: 0,
    peers: {},
    noobs: {},
    admins: [],
    access: {
      list: {
        kind: 'white',
        ships: [],
      },
      filter: null,
    },
    visibility: 'private',
    persistent: false,
    confirm: false,
  };
}