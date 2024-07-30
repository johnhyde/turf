import { createMemo, createSignal } from 'solid-js';
import { produce, reconcile } from 'solid-js/store';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import * as api from 'lib/api.js';
import {
  clampToTurf,
  delPortal,
  delShade,
  delShadeFromSpace,
  fillEmptySpace,
  generateHusk,
  getCollision,
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
import { applyEffect, getEffectsByComp, trig } from 'lib/effects.js';
import { filterGoal, getPool } from 'lib/pool.js';

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
      onUnpredictedGrits: (grits) => {
        grits.forEach((grit) => {
          window.dispatchEvent(new PondEvent('unpredictedGrit', grit, id));
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

    // this._grid = createMemo(() => {
    //   if (!this.ether) return null;
    //   if (!this.ether.offset) return null;
    //   return getTurfGrid(this.ether);
    // });
    this.sub = null;
    this.subscribe();
  }

  get turf() {
    return this._.real;
  }

  get ether() {
    return this._.fake;
  }

  // get grid() {
  //   return this._grid();
  // }

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
  'set-autoconfirm-dinks': (turf, arg) => {
    turf.autoconfirmDinks = arg.confirm;
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
      delShadeFromSpace(turf, shadeId, oldPos);
      if (formType === 'tile') {
        jabBySpaces(turf, pos, (space) => space.tile = shadeId);
      } else if (formType == 'wall' || formType == 'item') {
        jabBySpaces(turf, pos, (space) => space.shades.unshift(shadeId));
      } else return;
      shade.pos = pos;
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
  'set-shade-fx': (turf, arg) => {
    const { shadeId, fx } = arg;
    const shade = getShade(turf, shadeId);
    if (shade) {
      shade.fx = fx;
    }
  },
  'set-shade-effect': (turf, arg) => {
    const { shadeId, trigger, effect } = arg;
    const shade = getShade(turf, shadeId);
    if (shade) {
      const fx = shade.fx || [];
      const index = fx.findIndex((eff) => isEqual(eff.root, trigger));
      if (index === -1) {
        if (effect != null) fx.push({ root: trigger, effect });
      } else {
        if (effect == null) {
          fx.splice(index, 1);
        } else {
          fx[index] = { root: trigger, effect };
        }
      }
      shade.fx = fx;
    }
  },
  'set-shade-collidable': (turf, arg) => {
    const { shadeId, collidable } = arg;
    const shade = getShade(turf, shadeId);
    if (shade) {
      shade.collidable = collidable;
    }
  },
  'set-shade-form-id': (turf, arg) => {
    const { shadeId, formId } = arg;
    const shade = getShade(turf, shadeId);
    if (shade) {
      const newHusk = generateHusk(formId, 0);
      turf.cave[shadeId] = {
        pos: shade.pos,
        ...newHusk,
      };
    }
  },
  'set-gate': (turf, arg) => {
    turf.gate = arg.gate;
  },
  'set-lunk': (turf, arg) => {
    turf.lunk = arg.lunk;
  },
  'add-dink': (turf, arg) => {
    const { portalId } = arg;
    turf.dinks[portalId] = true;
  },
  'del-dink': (turf, arg) => {
    const { portalId } = arg;
    delete turf.dinks[portalId];
  },
  'add-portal': (turf, arg) => {
    turf.portals[turf.stuffCounter] = {
      outlet: null,
      for: arg.for,
      at: arg.at,
      pending: true,
    };
    turf.stuffCounter++;
  },
  'del-portal': (turf, arg) => {
    delPortal(turf, arg.portalId);
  },
  'set-portal-outlet': (turf, arg) => {
    const { portalId, outlet } = arg;
    const portal = turf.portals[portalId];
    if (portal) {
      portal.outlet = outlet;
    }
  },
  'confirm-portal': (turf, arg) => {
    const { portalId } = arg;
    const portal = turf.portals[portalId];
    if (portal && portal.at != null) {
      portal.pending = false;
    }
  },
  'revive-portal': (turf, arg) => {
    const { portalId } = arg;
    const portal = turf.portals[portalId];
    if (portal && portal.at == null) {
      portal.pending = true;
    }
  },
  'portal-confirmed': (turf, arg) => {
    const portal = turf.portals[arg.from];
    if (portal) {
      portal.at = arg.at;
      portal.pending = false;
    }
  },
  'portal-discarded': (turf, arg) => {
    const portal = turf.portals[arg.from];
    if (portal) {
      portal.at = null;
      portal.pending = false;
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
  'nil-port-offer': (turf, arg) => {
    const { ship } = arg;
    turf.portOffers[ship] = null;
  },
  'del-port-offer': (turf, arg) => {
    const { ship } = arg;
    delete turf.portOffers[ship];
  },
  'add-port-req': (turf, arg) => {
    const { ship, from, avatar } = arg;
    if (typeof from === 'number') {
      turf.portReqs[ship] = { from, avatar };
    }
  },
  'del-port-req': (turf, arg) => {
    const { ship } = arg;
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
        turf.players[src].wake = wen ? new Date(wen) : null;
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
    const { pos, formId, variation } = goal.arg;
    if (!isInTurf(turf, pos)) return false;
    const dupsOfForm = getThingsAtPosByFormId(turf, pos, formId)
      .filter((thing) =>
        thing.form.type === 'wall' || thing.variation === variation
      );
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
  'atomic': (turf, goal, top) => {
    const { goals: argGoals } = goal.arg;
    let roars = [], grits = [], goals = [];
    for (const goal of argGoals) {
      const res = filterGoal(filters, turf, goal, top);
      if (res.roars.length + res.grits.length + res.goals.length === 0) {
        return [];
      }
      roars = [...roars, ...res.roars];
      grits = [...grits, ...res.grits];
      goals = [...goals, ...res.goals];
    }
    // if (depth > 0) {
    goals = [{
      type: 'atomic',
      arg: {
        // depth: depth - 1,
        goals,
      },
    }];
    // }
    return { roars, grits, goals };
  },
  'add-shade': (turf, goal) => {
    const { pos, formId, isGate } = goal.arg;
    const formType = getForm(turf, formId)?.type;
    if (!isSpaceFormType(formType)) return [];
    goal.arg.pos = clampToTurf(turf, pos);
    const goals = [];
    if (isGate) {
      goals.push({ type: 'set-gate', arg: { gate: turf.stuffCounter } });
    }
    if (formType === 'tile') {
      const tileId = getTileId(turf, goal.arg.pos);
      if (tileId != null) {
        goals.push({
          type: 'del-shade',
          arg: { shadeId: tileId },
        });
      }
    }
    return {
      roars: [],
      grits: [goal],
      goals,
    };
  },
  'del-shade': (turf, goal) => {
    const { shadeId } = goal.arg;
    const goals = [];
    if (shadeId === turf.gate) {
      goals.push({ type: 'set-gate', arg: { gate: null } });
    }
    return { roars: [], grits: [goal], goals };
  },
  'move-shade': (turf, goal) => {
    const { pos, shadeId, collide, smooth } = goal.arg;
    const shade = getShade(turf, shadeId);
    const formType = getForm(turf, shade?.formId)?.type;
    if (!isSpaceFormType(formType)) return [];
    goal.arg.pos = clampToTurf(turf, pos);
    if (goal.arg.pos.equals(shade.pos)) return [];

    if (collide && getCollision(turf, goal.arg.pos)) {
      return {
        roars: [],
        grits: [],
        goals: pullTriggerAtPos(
          turf,
          our,
          trig('bump'),
          goal.arg.pos,
          shadeId,
        ),
      };
    }
    const grits = [goal];
    const trigger = trig('move', shade.pos, goal.arg.pos, collide, smooth);
    const leave = pullTriggerAtPos(turf, our, trigger, shade.pos, shadeId);
    const step = pullTriggerAtPos(turf, our, trigger, goal.arg.pos, shadeId);
    const goals = [...leave, ...step];
    if (formType === 'tile') {
      const tileId = getTileId(turf, goal.arg.pos);
      if (tileId != null) {
        goals.unshift({
          type: 'del-shade',
          arg: { shadeId: tileId },
        });
      }
    }
    return { roars: [], grits, goals };
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
      {
        type: 'set-portal-outlet',
        arg: {
          portalId,
          outlet: shadeId,
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
    const { ship, pos, collide, smooth } = goal.arg;
    const player = turf.players[ship];
    if (!player) return [];
    const newPos = clampToTurf(turf, pos);
    if (newPos.equals(player.pos)) return [];
    goal.arg.pos = newPos;
    if (collide && getCollision(turf, newPos)) {
      return {
        roars: [],
        grits: [],
        goals: pullTriggerAtPos(turf, ship, trig('bump'), newPos),
      };
    }
    const grits = [goal];
    const trigger = trig('move', player.pos, newPos, collide, smooth);
    const leave = pullTriggerAtPos(turf, ship, trigger, player.pos);
    const step = pullTriggerAtPos(turf, ship, trigger, newPos);
    const goals = [...leave, ...step];
    return { roars: [], grits, goals };
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
    return {
      roars: [],
      grits: [],
      goals: pullTriggerOnShade(turf, our, trig('click'), goal.arg.shadeId),
    };
  },
  'interact': (turf, goal) => {
    return {
      roars: [],
      grits: [],
      goals: pullTriggerOnShade(turf, our, trig('interact'), goal.arg.shadeId),
    };
  },
  'tell': (turf, goal) => {
    return {
      roars: [],
      grits: [],
      goals: pullTriggerOnShade(
        turf,
        our,
        trig('tell', goal.arg.msg),
        goal.arg.shadeId,
      ),
    };
  },
  'pull-trigger': (turf, goal) => {
    return {
      roars: [],
      grits: [],
      goals: pullTriggerOnShade(
        turf,
        our,
        goal.arg.trigger,
        goal.arg.shadeId,
        goal.arg.initId,
      ),
    };
  },
  'apply-effect': (turf, goal) => {
    const res = applyEffect({
      turf,
      ship: our,
      trigger: goal.arg.trigger,
      shadeId: goal.arg.shadeId,
      initId: goal.arg.initId,
    }, goal.arg.effect);
    return {
      ...res,
      grits: [],
    };
  },
};

// returns a list of goals
function pullTriggerAtPos(turf, ship, trigger, pos, initId) {
  const comps = getThingsAtPos(turf, pos);
  return pullTriggerOnComps(turf, ship, trigger, comps, initId);
}

// returns a list of goals
function pullTriggerOnShade(turf, ship, trigger, shadeId, initId) {
  const comp = getShadeWithForm(turf, shadeId);
  if (!comp) return [];
  return pullTriggerOnComps(turf, ship, trigger, [comp], initId);
}

// returns a list of goals
function pullTriggerOnComps(turf, ship, trigger, comps, initId) {
  return comps.map((comp) => {
    return getEffectsByComp(turf, comp, trigger, { ship, initId }).map(
      (effect) => {
        return {
          type: 'apply-effect',
          arg: {
            effect,
            shadeId: comp.id,
            trigger,
            initId,
          },
        };
      },
    );
  }).flat();
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
