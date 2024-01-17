
export class Rally extends EventTarget {
  constructor(api) {
    super();
    this.api = api;
    this.incomings = {};
  }

  watchIncoming(dap=null) {
    if (!this.incomings[dap]) {
      this.incomings[dap] = new RallyIncoming(this.api, dap);
    }
    return this.incomings[dap];
  }

  createCrew(crewId, options={}) {
    const dest = {
      ship: our,
      crewId,
    };
    return new RallyCrew(this.api, dest, options);
  }

  joinCrew(dest, options={}) {
    if (typeof dest === 'string') dest = stringToDest(dest);
    const dap = getDap(dest.crewId);
    if (this.incomings[dap]) this.incomings[dap].removeDest(dest);
    return new RallyCrew(this.api, dest, options);
  }
}

export class RallyIncoming extends EventTarget {
  constructor(api, dap=null, options={}) {
    super();
    this.api = api;
    this.dap = dap;
    this.dests = new Set();
    this.path = '/incoming/0' + (dap ? '/' + dap : '');
    if (!options.waitToInit) {
      this.init();
    }
  }

  get incoming() {
    return Array.from(this.dests).map(stringToDest);
  }

  init() {
    this.promise = this.api.subscribe({
      app: 'rally',
      path: this.path,
      event: (incoming) => {
        this.update(incoming);
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

  update(incoming) {
    updateIncomingDests(this.dests, incoming);
    this.dispatchEvent(new IncomingEvent(incoming));
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

export class RallyCrew extends EventTarget {
  constructor(api, dest, options={}) {
    super();
    this.api = api;
    this.dest = dest;
    this.crewId = dest.crewId;
    this.clientId = null;
    this.crew = {
      id: dest.crewId,
      new: true,
      ...defaultCrew(),
    };
    this.path = '/update/0/' + dest.ship + dest.crewId;

    if (options.clientId) {
      this.clientId = options.clientId;
      this.enter();
    }
    if (!options.waitToInit) {
      this.init();
    }
  }

  init() {
    this.promise = this.api.subscribe({
      app: 'rally',
      path: this.path,
      event: (update) => {
        if (update.kind === 'you-are') {
          console.log('client update', update);
          if (!this.clientId) {
            this.clientId = update.uuid;
            this.enter();
          }
          this.dispatchEvent(new ClientUpdateEvent(update));
        } else {
          console.log('crew update', update);
          if (update.kind === 'quit') {
            console.log('it is over, bros');
          } else { // waves
            updateCrew(this.crew, update.waves);
          }
          this.dispatchEvent(new CrewUpdateEvent(update));
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

  delete() {
    return this.api.poke({
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
  }

  enter() {
    if (!this.clientId) throw new Error('Cannot enter without a clientId');
    return this.api.poke({
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
      return this.api.poke({
        app: 'rally',
        mark: 'leave',
        json: {
          dest: this.dest,
        },
        onError: (e) => {
          console.error('RallyCrew failed to fully leave crew at ' + this.path, e);
        },
      });
    }
    if (!this.clientId) throw new Error('Cannot leave without a clientId');
    return this.sendAction([{ leave: null }]);
  }

  invite(ship) {
    return this.sendAction([{ wave: { 'add-peer': { ship, uuids: [] } }}]);
  }

  sendAction(stirs) {
    this.api.poke({
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

export class IncomingEvent extends Event {
  constructor(incoming) {
    super('incoming');
    this.kind = incoming.kind;
    this.incoming = incoming;
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
// Helpers
//

export function updateIncomingDests(dests, incoming) {
  if (incoming.kind === 'cries') {
    incoming.dests.forEach((dest) => dests.add(destToString(dest)));
  } else {
    const str = destToString(incoming.dest);
    if (incoming.kind === 'cry') {
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
    case 'set-crew':
      Object.assign(crew, wave.crew);
      break;
    case 'add-peer': {
      const { ship, uuids } = wave;
      const oldUuids = crew.peers[ship] || [];
      const newUuids = Array.from(new Set([...oldUuids, ...uuids]));
      crew.peers[ship] = newUuids;
      break;
    }
    case 'del-peer':
      delete crew.peers[wave.ship];
      break;
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
    case 'del-noob':
      delete crew.noobs[wave.ship];
      break;
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
    case 'set-access-list': {
      crew.access.list = wave.list;
    }
    case 'set-access-filter': {
      crew.access.filter = wave.filter;
    }
    case 'grant-access': {
      const shipSet = new Set(crew.access.list.ships);
      if (crew.access.list.kind === 'white') {
        shipSet.add(wave.ship);
      } else {
        shipSet.delete(wav.ship);
      }
      crew.access.list.ships = Array.from(shipSet);
    }
    case 'revoke-access': {
      const shipSet = new Set(crew.access.list.ships);
      if (crew.access.list.kind === 'white') {
        shipSet.delete(wav.ship);
      } else {
        shipSet.add(wave.ship);
      }
      crew.access.list.ships = Array.from(shipSet);
    }
    case 'add-admin': {
      crew.admins = Array.from(new Set([...crew.admins, ...wave.ships]));
    }
    case 'del-admin': {
      const shipSet = new Set(crew.admins);
      wave.ships.forEach(ship => shipSet.delete(ship));
      crew.admins = Array.from(shipSet);
    }
    case 'set-visibility': {
      crew.visibility = wave.visibility;
    }
    case 'set-persistent': {
      crew.persistent = wave.persistent;
    }
    case 'set-confirm': {
      crew.confirm = wave.confirm;
    }
    default:
      console.log('wash crew not implemented for wave of kind', wave.kind);
      break;
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