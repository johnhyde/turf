import { createMemo, createSignal } from 'solid-js';
import { produce, reconcile } from 'solid-js/store';
import cloneDeep from 'lodash/cloneDeep';
import * as api from 'lib/api.js';
import {
  clampToTurf,
  delPortal,
  delShade,
  delShadeFromSpace,
  fillEmptySpace,
  generateHusk,
  getCollision,
  getEffectsByShade,
  getEffectsByThing,
  getForm,
  getShade,
  getShadeWithForm,
  getThingsAtPos,
  getThingsAtPosByFormId,
  getTileId,
  isInTurf,
  isSpaceFormType,
  jabBySpaces,
} from 'lib/turf.js';
import { jClone, turfIdToPath, vec2, vecToStr } from 'lib/utils.js';
import { getPool } from 'lib/pool.js';

function getTurfGrid(turf) {
  const grid = [];
  for (let i = turf.offset.x; i < turf.offset.x + turf.size.x; i++) {
    const col = [];
    grid.push(col);
    for (let j = turf.offset.y; j < turf.offset.y + turf.size.y; j++) {
      const space = turf.spaces[[i, j].join(',')];
      if (space) {
        col.push(jClone(space));
      } else {
        col.push({
          tile: undefined,
          shades: [],
        });
      }
    }
  }
  return grid;
}

export class Pond { // we use a class so we can put it inside a store without getting proxied
  constructor(id, options = {}) {
    this.id = id;
    [this.isNew, this.$isNew] = createSignal(false);
    [this.error, this.$error] = createSignal();
    options = {
      ...options,
      onErr: () => window.dispatchEvent(new PondEvent('err', null, id)),
      onNew: () => this.$isNew(true),
      onNewGrits: (grits) => {
        grits.forEach((grit) => {
          console.log('dispatching pond grit event', grit);
          window.dispatchEvent(new PondEvent('grit', grit, id));
        });
      },
      onNewFakeGrits: (grits) => {
        grits.forEach((grit) =>
          window.dispatchEvent(new PondEvent('fakeGrit', grit, id))
        );
      },
      onNewRoars: (roars) => {
        roars.forEach((roar) =>
          window.dispatchEvent(new PondEvent('roar', roar, id))
        );
      },
      onFuture: () => {
        this.$error('future');
      },
      onUnavailable: () => {
        this.$error('unavailable');
      },
      preFilters,
      filters,
    };
    const wash = (update, grits, ...args) => {
      update((turf) => {
        if (!turf?.id) return { ...turf, id };
        return turf;
      });
      washTurf(update, grits, ...args);
    };
    const hydrate = (rock) => {
      if (rock) rock.id = id;
      return js.turf(rock);
    };
    const apiSendWave = (...args) => {
      return api.sendPondWave(id, ...args);
    };
    this._ = getPool(wash, hydrate, apiSendWave, options);
    this.$ = this._.$;

    this._grid = createMemo(() => {
      if (!this.ether) return null;
      if (!this.ether.offset) return null;
      return getTurfGrid(this.ether);
    });
    this.sub = null;
    this.subscribe();
  }

  get turf() {
    return this._.real;
  }

  get ether() {
    return this._.fake;
  }

  get grid() {
    return this._grid();
  }

  get new() {
    return this.isNew();
  }

  get future() {
    return this.error() === 'future';
  }

  get unavailable() {
    return this.error() === 'unavailable';
  }

  markNotNew() {
    this.$isNew(false);
  }

  // returns true/false whether we attempted to send the wave or not
  // returns false if stir was judged to be unworthy (e.g. placing a duplicate item)
  sendWave(type, arg, batch = true) {
    return this._.sendWave(type, arg, batch);
  }

  // this one gets weird because of the awaits
  // the idea is for it to be idempotent
  async subscribe() {
    if (this.sub === null) {
      const onPondErr = () => {};
      const onPondQuit = () => {};
      this.sub = api.subscribeToPool(
        this.id,
        this._.onRes.bind(this._),
        onPondErr,
        onPondQuit,
      );
      return this.sub;
    } else {
      const oldSub = await this.sub;
      if (this.sub && !api.api.outstandingSubscriptions.has(oldSub)) {
        this.sub = null;
        return this.subscribe();
      }
    }
  }

  async unsubscribe() {
    const sub = await this.sub;
    if (sub !== null) {
      api.api.unsubscribe(sub);
      this.sub = null;
    }
  }

  destroy() {
    return this.unsubscribe();
  }
}

const pondGrits = {
  'set-name': (turf, arg) => {
    turf.name = arg.name;
  },
  'set-back': (turf, arg) => {
    turf.back = arg;
  },
  'size-turf': (turf, arg) => {
    turf.offset = arg.offset;
    turf.size = arg.size;
    Object.values(turf.players).forEach((player) => {
      const newPos = clampToTurf(turf, player.pos);
      player.pos.x = newPos.x;
      player.pos.y = newPos.y;
    });
    fillEmptySpace(turf, '/grass');
  },
  'add-form': (turf, arg) => {
    const { formId, form } = arg;
    turf.skye[formId] = form;
  },
  'del-form': (turf, arg) => {
    const { formId } = arg;
    const form = getForm(turf, formId);
    Object.entries(turf.cave).forEach(([shadeId, shade]) => {
      if (shade.formId === formId) delShade(turf, Number(shadeId));
    });
    if (!form || form.type === 'tile') {
      Object.entries(turf.spaces).forEach(([pos, space]) => {
        if (space.tile && space.tile.formId === formId) {
          space.tile = null;
        }
      });
    }
    delete turf.skye[formId];
  },
  'add-shade': (turf, arg) => {
    const { pos, formId, variation } = arg;
    // commented out quitting on out-of-bounds because theoretically this could happen
    // and the backend allows it, so this would give us invalid state
    // if (pos.x < turf.offset.x || pos.y < turf.offset.y) return;
    // if (
    //   pos.x >= turf.offset.x + turf.size.x ||
    //   pos.y >= turf.offset.y + turf.size.y
    // ) return;
    const formType = getForm(turf, formId)?.type;
    const newHusk = generateHusk(formId, variation);
    if (formType === 'tile') {
      jabBySpaces(turf, pos, (space) => space.tile = turf.stuffCounter);
    } else if (formType == 'wall' || formType == 'item') {
      jabBySpaces(
        turf,
        pos,
        (space) => space.shades.unshift(turf.stuffCounter),
      );
    } else return;
    turf.cave[turf.stuffCounter] = {
      pos,
      ...newHusk,
    };
    turf.stuffCounter++;
  },
  'del-shade': (turf, arg) => {
    delShade(turf, arg.shadeId);
  },
  'move-shade': (turf, arg) => {
    const { shadeId, pos } = arg;
    const shade = getShade(turf, shadeId);
    if (shade) {
      const formType = getForm(turf, shade.formId)?.type;
      const oldPos = shade.pos;
      if (formType === 'tile') {
        jabBySpaces(turf, pos, (space) => space.tile = shadeId);
      } else if (formType == 'wall' || formType == 'item') {
        jabBySpaces(turf, pos, (space) => space.shades.unshift(shadeId));
      } else return;
      shade.pos = pos;
      delShadeFromSpace(turf, shadeId, oldPos);
    }
  },
  'cycle-shade': (turf, arg) => {
    const { shadeId, amount } = arg;
    const shade = getShade(turf, shadeId);
    if (shade) {
      const form = getForm(turf, shade.formId);
      if (form) {
        shade.variation = (shade.variation + amount) % form.variations.length;
      }
    }
  },
  'set-shade-var': (turf, arg) => {
    const { shadeId, variation } = arg;
    const shade = getShade(turf, shadeId);
    if (shade) {
      const form = getForm(turf, shade.formId);
      if (form) {
        shade.variation = variation % form.variations.length;
      }
    }
  },
  'set-shade-effect': (turf, arg) => {
    const { shadeId, trigger, effect } = arg;
    const shade = getShade(turf, shadeId);
    if (shade) {
      shade.effects[trigger] = effect;
    }
  },
  'set-shade-collidable': (turf, arg) => {
    const { shadeId, collidable } = arg;
    const shade = getShade(turf, shadeId);
    if (shade) {
      shade.collidable = collidable;
    }
  },
  'set-lunk': (turf, arg) => {
    turf.lunk = arg;
  },
  'set-dink': (turf, arg) => {
    const { portalId, approved } = arg;
    turf.dinks[portalId] = approved;
  },
  'del-dink': (turf, arg) => {
    const { portalId } = arg;
    delete turf.dinks[portalId];
  },
  'add-portal': (turf, arg) => {
    turf.portals[turf.stuffCounter] = {
      shadeId: null,
      for: arg.for,
      at: arg.at,
    };
    turf.stuffCounter++;
  },
  'del-portal': (turf, arg) => {
    delPortal(turf, arg.from);
  },
  'add-shade-to-portal': (turf, arg) => {
    const portal = turf.portals[arg.from];
    if (portal) {
      portal.shadeId = arg.shadeId;
    }
  },
  'del-shade-from-portal': (turf, arg) => {
    const portal = turf.portals[arg.from];
    if (portal?.shadeId === arg.shadeId) {
      portal.shadeId = null;
    }
  },
  'del-portal-from-shade': (turf, arg) => {
    const { shadeId, portalId } = arg;
    const shade = getShade(turf, shadeId);
    if (shade) {
      const { fullFx } = getEffectsByShade(turf, shade);
      Object.entries(fullFx).forEach(([trigger, effect]) => {
        if (effect?.type === 'port' && effect?.arg === portalId) {
          shade.effects[trigger] = 'port';
        }
      });
    }
  },
  'portal-confirmed': (turf, arg) => {
    if (turf.portals[arg.from]) {
      turf.portals[arg.from].at = arg.at;
    }
  },
  'chat': (turf, arg) => {
    turf.chats.unshift(arg);
    turf.chats = turf.chats.slice(0, 20);
  },
  'move': (turf, arg) => {
    const player = turf.players[arg.ship];
    if (player) {
      player.pos.x = arg.pos.x;
      player.pos.y = arg.pos.y;
    }
  },
  'tele': (turf, arg) => {
    const player = turf.players[arg.ship];
    if (player) {
      player.pos.x = arg.pos.x;
      player.pos.y = arg.pos.y;
    }
  },
  'face': (turf, arg) => {
    const player = turf.players[arg.ship];
    if (player) {
      player.dir = arg.dir;
    }
  },
  'set-avatar': (turf, arg) => {
    const player = turf.players[arg.ship];
    if (player) {
      player.avatar = arg.avatar;
    }
  },
  'add-port-offer': (turf, arg) => {
    const { ship, from } = arg;
    turf.portOffers[ship] = from;
  },
  'del-port-offer': (turf, ship) => {
    delete turf.portOffers[ship];
  },
  'add-port-req': (turf, arg) => {
    const { ship, from, avatar } = arg;
    if (typeof from === 'number') {
      turf.portReqs[ship] = { from, avatar };
    }
  },
  'del-port-req': (turf, ship) => {
    delete turf.portReqs[ship];
  },
  'add-port-rec': (turf, arg) => {
    const { from, ship } = arg;
    if (!turf.portRecs[from]) {
      turf.portRecs[from] = [];
    }
    if (!turf.portRecs[from].includes(ship)) {
      turf.portRecs[from].push(ship);
    }
  },
  'del-port-rec': (turf, arg) => {
    const { from, ship } = arg;
    if (!turf.portRecs[from]) {
      return;
    }
    turf.portRecs[from] = turf.portRecs[from].filter((s) => s !== ship);
  },
  'del-port-recs': (turf, from) => {
    delete turf.portRecs[from];
  },
  'add-player': (turf, arg) => {
    turf.players[arg.ship] = arg.player;
  },
  'del-player': (turf, arg) => {
    delete turf.players[arg.ship];
  },
  'add-invite': (turf, arg) => {
    const { id, name, till } = arg;
    turf.invites[arg.id] = { name, till };
  },
  'del-invite': (turf, arg) => {
    delete turf.invites[arg.id];
  },
};

export function washTurf(update, grits, src, wen) {
  if (src && wen) {
    update(produce((turf) => {
      if (turf && turf.players[src]) {
        turf.players[src].wake = wen;
      }
    }));
  }
  grits.forEach((grit) => {
    update(_washTurf(grit));
  });
}

export function _washTurf(grit) {
  grit = cloneDeep(grit);
  // console.log('washing a turf with grit', JSON.stringify(grit, null, 2))
  switch (grit.type) {
    case 'noop':
    case 'wake':
      return produce((turf) => js.turf(turf));
    case 'del-turf':
      return null;
    case 'set-turf':
      return reconcile((turf) => {
        const newTurf = {
          id: turf?.id,
          ...grit.arg,
        };
        return js.turf(newTurf);
      });
    case 'ping-player':
      return produce((turf) => js.turf(turf));
    default:
      return produce((turf) => {
        if (pondGrits[grit.type]) {
          if (turf) {
            pondGrits[grit.type](turf, grit.arg);
            js.turf(turf);
          } else {
            console.warn(
              `Could not apply grit of type: ${grit.type} to ${turf} turf`,
            );
          }
        } else {
          console.warn(`Could not process grit of type: ${grit.type}`);
        }
      });
  }
}

export class PondEvent extends Event {
  constructor(name, event, id, options = {}) {
    super(`pond-${name}` + (event?.type ? '-' + event.type : ''), options);
    this[name] = event;
    this.turfId = id;
  }
}

// These pre-filter goals which the ship might allow
// but which we don't want to send
// returns false if goal is rejected
// otherwise, returns the goal (possibly modified)
const preFilters = {
  'add-shade': (turf, goal) => {
    const { pos, formId } = goal.arg;
    if (!isInTurf(turf, pos)) return false;
    const dupsOfForm = getThingsAtPosByFormId(turf, pos, formId);
    if (dupsOfForm.length === 0) {
      return goal;
    }
    return false;
  },
};

// These simulate the filters on the ship
// returns either
// Array<grit>
//   or
// {
//   roars: Array<roar>, // side-effects
//   grits: Array<grit>, // what grits does this translate to?
//   goals: Array<goal>, // what sub-goals does this trigger?
// }
const filters = {
  'add-shade': (turf, goal) => {
    const { pos, formId } = goal.arg;
    const formType = getForm(turf, formId)?.type;
    if (!isSpaceFormType(formType)) return [];
    goal.arg.pos = clampToTurf(turf, pos);
    if (formType === 'tile') {
      const tileId = getTileId(turf, goal.arg.pos);
      if (tileId != null) {
        return {
          roars: [],
          grits: [goal],
          goals: [{
            type: 'del-shade',
            arg: { shadeId: tileId },
          }],
        };
      }
    }
    return [goal];
  },
  'move-shade': (turf, goal) => {
    const { pos, shadeId } = goal.arg;
    const shade = getShade(turf, shadeId);
    const formType = getForm(turf, shade?.formId)?.type;
    if (!isSpaceFormType(formType)) return [];
    goal.arg.pos = clampToTurf(turf, pos);
    if (formType === 'tile') {
      const tileId = getTileId(turf, goal.arg.pos);
      if (tileId != null) {
        return {
          roars: [],
          grits: [goal],
          goals: [{
            type: 'del-shade',
            arg: { shadeId: tileId },
          }],
        };
      }
    }
    return [goal];
  },
  'create-bridge': (turf, goal) => {
    const { shade, trigger, portal } = goal.arg;
    const shadeExists = typeof shade !== 'object';
    const portalExists = typeof portal !== 'object';
    let shadeId, portalId;
    let goals = [];
    shadeId = Number(shadeExists ? shade : turf.stuffCounter);
    if (portalExists) {
      portalId = Number(portal);
    } else {
      portalId = Number(turf.stuffCounter);
      if (!shadeExists) portalId++;
    }
    if (!shadeExists) {
      goals.push({
        type: 'add-shade',
        arg: shade,
      });
    }
    if (!portalExists) {
      goals.push({
        type: 'add-portal',
        arg: {
          for: portal,
          at: null,
        },
      });
    }
    goals = [
      ...goals,
      {
        type: 'set-shade-effect',
        arg: {
          shadeId,
          trigger,
          effect: {
            type: 'port',
            arg: portalId,
          },
        },
      },
      { // TODO: don't add this here, but in a filter on 'set-shade-effect'
        type: 'add-shade-to-portal',
        arg: {
          from: portalId,
          shadeId,
        },
      },
    ];
    return {
      roars: [],
      grits: [],
      goals,
    };
  },
  'send-chat': (turf, goal) => {
    return [{
      type: 'chat',
      arg: {
        from: goal.arg.from,
        at: Date.now(),
        text: goal.arg.text,
      },
    }];
  },
  'move': (turf, goal) => {
    const { ship, pos } = goal.arg;
    const player = turf.players[ship];
    if (!player) return [];
    const newPos = clampToTurf(turf, pos);
    const playerColliding = getCollision(turf, player.pos);
    const willBeColliding = getCollision(turf, newPos);
    if (willBeColliding && !playerColliding) return [];
    if (newPos.equals(player.pos)) return [];
    goal.arg.pos = newPos;
    const leave = pullTriggerAtPos(turf, ship, 'leave', player.pos);
    const step = pullTriggerAtPos(turf, ship, 'step', newPos);
    return {
      roars: [...leave.roars, ...step.roars],
      grits: [goal],
      goals: [...leave.goals, ...step.goals],
    };
  },
  'tele': (turf, goal) => {
    const { ship, pos } = goal.arg;
    const player = turf.players[ship];
    if (!player) return [];
    const newPos = clampToTurf(turf, pos);
    if (newPos.equals(player.pos)) return [];
    goal.arg.pos = newPos;
    const leave = pullTriggerAtPos(turf, ship, 'leave', player.pos);
    const step = pullTriggerAtPos(turf, ship, 'step', newPos);
    return {
      roars: [...leave.roars, ...step.roars],
      grits: [goal],
      goals: [...leave.goals, ...step.goals],
    };
  },
  'add-port-offer': (turf, goal) => {
    const { ship, from } = goal.arg;
    const portal = turf.portals?.[from];
    if (!portal || !portal.at) return [];
    return {
      roars: [{
        type: 'port-offer',
        arg: {
          ship,
          from,
          for: turfIdToPath(portal.for),
          at: portal.at,
        },
      }],
      grits: [goal],
      goals: [],
    };
  },
  'click': (turf, goal) => {
    const click = pullTriggerOnShade(turf, our, 'click', goal.arg.shadeId);
    return {
      ...click,
      grits: [],
    };
  },
  'interact': (turf, goal) => {
    const interact = pullTriggerOnShade(
      turf,
      our,
      'interact',
      goal.arg.shadeId,
    );
    return {
      ...interact,
      grits: [],
    };
  },
};

function pullTriggerAtPos(turf, ship, trigger, pos) {
  const things = getThingsAtPos(turf, pos);
  const effectsMap = things.map((
    thing,
  ) => [thing.id || pos, getEffectsByThing(thing)]);
  let roars = [], goals = [];
  effectsMap.forEach(([shadeId, effects]) => {
    const effect = effects.fullFx[trigger];
    if (effect && effect.type) {
      const res = applyEffect(turf, ship, effect, shadeId);
      roars = [...roars, ...res.roars];
      goals = [...goals, ...res.goals];
    }
  });
  return {
    roars,
    goals,
  };
}

function pullTriggerOnShade(turf, ship, trigger, shadeId) {
  let roars = [], goals = [];
  const thing = getShadeWithForm(turf, shadeId);
  if (!thing) return { roars, goals };
  const effects = getEffectsByThing(thing);
  const effect = effects.fullFx[trigger];
  if (effect && effect.type) {
    const res = applyEffect(turf, ship, effect, shadeId);
    roars = [...roars, ...res.roars];
    goals = [...goals, ...res.goals];
  }
  return {
    roars,
    goals,
  };
}

function applyEffect(turf, ship, effect, shadeId) {
  switch (effect.type) {
    case 'port': {
      const portal = turf.portals[effect.arg];
      if (!portal || !portal.at) return { roars: [], goals: [] };
      return {
        roars: [],
        goals: [{
          type: 'add-port-offer',
          arg: { ship, from: effect.arg },
        }],
      };
    }
    case 'jump': {
      return {
        roars: [],
        goals: [{
          type: 'tele',
          arg: { ship, pos: effect.arg },
        }],
      };
    }
    default: {
      return {
        roars: [{
          type: 'effect-' + effect.type,
          arg: effect.arg,
          ship,
          shadeId,
        }],
        goals: [],
      };
    }
  }
}

// We mutate everything I guess!
const js = {
  turf(turf) {
    // this.deepVec2(turf)
    if (turf) {
      turf.chats.forEach(this.chat.bind(this));
      Object.values(turf.players).forEach(this.player.bind(this));
    }
    return turf;
  },
  chat(chat) {
    chat.at = new Date(chat.at);
  },
  player(player) {
    player.wake = player.wake ? new Date(player.wake) : null;
  },
  deepVec2(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        // Recursively iterate through nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          if (
            Object.keys(value).sort().join() == 'x,y' &&
            value.constructor.name == 'Object'
          ) {
            obj[key] = this.vec2(value);
          } else {
            this.deepVec2(value);
          }
        }
      }
    }
  },
  vec2(vec) {
    return vec2(vec.x, vec.y);
  },
};
