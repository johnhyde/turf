import { batch, on, createEffect, createMemo, createSignal, mergeProps, getOwner } from "solid-js";
import { createStore, unwrap, produce, reconcile } from "solid-js/store";
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import * as api from 'lib/api.js';
import {
  clampToTurf, isInTurf, getCollision, getEffectsByShade,
  jabBySpaces, delShade, delPortal
} from 'lib/turf';
import { vec2, minV, maxV, uuidv4, dirs, vecToStr, jClone } from 'lib/utils';

function gritsTypeStr(grits) {
  return `batch: [${grits.map(w => w?.type || 'no-op').join(', ')}]`;
}

export class Pond { // we use a class so we can put it inside a store without getting proxied
  constructor(id, options = {}) {
    this.id = id;
    const [pond, $pond] = getPond();
    this._ = pond;
    this.$ = $pond;

    this.firstChargeTimer = null;
    this.lastChargeTimer = null;
    this.minBatchLatency = options.minBatchLatency || 300;
    this.maxBatchLatency = options.maxBatchLatency || 1200;
    this.subscribe();
    // this.sendWave('') // todo join turf
  }

  get turf() {
    return this._.turf;
  }

  get pulses() {
    return this._.pulses;
  }

  get charges() {
    return this._.charges;
  }

  get ether() {
    const parent = this;
    return this._.ether;
  }
  get grid() {
    return this._.grid;
  }

  // returns true/false whether we attempted to send the wave or not
  // returns false if stir was judged to be unworthy (e.g. placing a duplicate item)
  sendWave(type, arg, batch = true) {
    let charge = filterGoals(this.ether, [{ type, arg }]);
    if (!charge) return false;
    if (batch) {
      this.addCharge(charge);
    } else {
      const {goals, grits} = charge;
      const uuid = uuidv4();
      console.log('sending grits', gritsTypeStr(grits), 'with id', uuid ? uuid.substring(0, 4) : uuid);
      this.addPulse({
        id: uuid,
        grits,
      });
      this.sendWavePoke(goals, uuid);
    }
    return true;
  }
  async sendWavePoke(goals, uuid, retries = 0) {
    try {
      await api.sendPondWave(this.id, goals, uuid);
    } catch (e) {
      if (e?.message === 'Failed to fetch') {
        // internet connectivity issue
        if (retries < 4) { // 15 seconds before pulse is discarded (1+2+4+8)
          const timeout = Math.pow(2, retries)*1000;
          retries++;
          console.warn(`Failed to send wave, attempting retry #${retries} in ${timeout/1000}s`);
          setTimeout(() => this.sendWavePoke(goal, uuid, retries), timeout);
        } else {
          console.warn('Failed to send wave, no more retries, rolling back');
          this.removePulse(uuid);
          this.replayEther();
        }
      } else {
        console.warn('Failed to send wave, can\'t retry, rolling back');
        this.removePulse(uuid);
        this.replayEther();
      }
    }
  }

  onPondRes(res) {
    batch(() => {
      if (res.hasOwnProperty('rock')) {
        const newTurf = rockToTurf(res.rock.turf, this.id);
        console.log(`new turf for ${this.id} from rock`, newTurf);
        this.$('turf', reconcile(newTurf, { merge: true }));
        this.updatePulses(false, res.rock.stirIds[our]); // always resets ether because grit is undefined
        // this.resetEther();
        // this.removePulses();
        console.log('leftover pulses: ', this.pulses.length);
      } else if (res.hasOwnProperty('wave')) {
        const { grits, id } = res.wave;
        console.log(`getting wave for ${this.id}`, gritsTypeStr(grits), 'with id', id ? id.substring(0, 4) : id);
        const noop = !grits || grits.length === 0;
        const noPulses = this.pulses.length === 0;
        const noCharges = this.charges.length === 0;
        
        if (!noop) {
          washTurf(this.updateTurf.bind(this), grits);
        }
        if (!noop && noPulses && noCharges) {
          washTurf(this.updateEther.bind(this), grits);
        } else {
          this.updatePulses(noop, id, grits);
        }
      } else {
        console.error('Pond response not a rock or wave???', res);
      }
    });
  }

  subscribe() {
    const onPondErr = () => {};
    const onPondQuit = () => {};
    api.subscribeToTurf(this.id, this.onPondRes.bind(this), onPondErr, onPondQuit);
  }

  applyGrits(wave) {
    washTurf(this.updateEther.bind(this), wave);
  }

  addPulse(pulse, apply = true) {
    batch(() => {
      this.$('pulses', (pulses) => [...pulses, pulse]);
      if (apply) this.applyGrits(pulse.grits);
    });
  }

  applyPulses() {
    this.pulses.forEach((pulse) => {
      this.applyGrits(pulse.grits);
    });
  }

  removePulse(uuid) {
    const pulseI = this.pulses.findIndex(p => p.id === uuid);
    this.$('pulses', p => [...p.slice(0, pulseI), ...p.slice(pulseI + 1)]);
  }

  removePulses() {
    this.$('pulses', []);
  }

  updatePulses(noop, id, grits) {
    const pulseI = !id ? -1 : this.pulses.findIndex(p => p.id === id);
    const matches = pulseI >= 0;
    const matchesFirst = pulseI === 0;
    const confirms = !noop && matches && isEqual(jClone(this.pulses[pulseI].grits), grits);
    const changesSomething = !noop || matches;
    const etherInvalidated = changesSomething && !(matchesFirst && confirms);
    if (matches) {
      // once we can guarantee that pokes are send to ship in order,
      // we can throw out any pulses before the matched one
      // this.$('pulses', p => [...p.slice(0, pulseI), ...p.slice(pulseI + 1)]);
      if (!confirms) console.log('DID NOT CONFIRM\nDID NOT CONFIRM');
      if (pulseI > 0) console.log(`THROWING AWAY ${pulseI} UNMATCHED PULSE(S)`);
      this.$('pulses', p => p.slice(pulseI + 1));
    }
    if (etherInvalidated) {
      this.replayEther();
    }
  }

  addCharge(charge, apply = true) {
    // console.log('adding charge')
    if (this.charges.length == 0) {
      this.setFirstChargeTimer();
    }
    this.setLastChargeTimer();
    batch(() => {
      this.$('charges', (charges) => [...charges, charge]);
      if (apply) this.applyGrits(charge.grits);
    });
  }

  setFirstChargeTimer() {
    if (this.firstChargeTimer) {
      clearTimeout(this.firstChargeTimer);
    }
    this.firstChargeTimer = setTimeout(() => {
      // console.log(`at least ${this.maxBatchLatency}ms since first charge; firing`);
      if (this.charges.length >= 1) {
        this.fireCharges();
      }
    }, this.maxBatchLatency);
  }

  setLastChargeTimer() {
    if (this.lastChargeTimer) {
      clearTimeout(this.lastChargeTimer);
    }
    this.lastChargeTimer = setTimeout(() => {
      // console.log(`at least ${this.minBatchLatency}ms since last charge; firing`);
      if (this.charges.length >= 1) {
        this.fireCharges();
      }
    }, this.minBatchLatency);
  }

  applyCharges() {
    this.charges.forEach((charge) => {
      this.applyGrits(charge.grits);
    });
  }

  fireCharges() {
    batch(() => {
      if (this.firstChargeTimer)
        clearTimeout(this.firstChargeTimer);
      if (this.lastChargeTimer)
        clearTimeout(this.lastChargeTimer);
      let goals = [], grits = [];
      this.charges.forEach(c => {
        goals = [...goals, ...c.goals]
        grits = [...grits, ...c.grits]
      });
      const uuid = uuidv4();
      console.log('sending grits', gritsTypeStr(grits), 'with id', uuid ? uuid.substring(0, 4) : uuid);
      this.$('charges', []);
      this.addPulse({
        id: uuid,
        grits,
      }, false); // don't apply because charges were already applied
      this.sendWavePoke(goals, uuid);
    });
  }

  resetEther() {
    // console.log('resetting ether');
    const turfCopy = js.turf(cloneDeep(this.turf));
    this.$('ether', reconcile(turfCopy, { merge: true }));
  }

  replayEther() {
    console.log('replaying ether');
    batch(() => {
      this.resetEther();
      this.applyPulses();
      this.applyCharges();
    });
  }

  updateTurf(fun) {
    // console.log('updating base turf')
    batch(() => {
      if (this.turf && !this.turf.id) this.$('turf', 'id', this.id);
      this.$('turf', fun);
    });
  }
  
  updateEther(fun) {
    // console.log('updating ether')
    batch(() => {
      if (this.ether && !this.ether.id) this.$('ether', 'id', this.id);
      this.$('ether', fun);
    });
  }
}

export function getPond() {
  let ether, grid;
  const [pond, $pond] = createStore({
    turf: null,
    ether: null,
    pulses: [], // waves that have been sent but not confirmed
    charges: [], // grits to be sent in the next batch
    get grid() {
      return grid();
    },
  });

  grid = createMemo(() => {
    console.log('recomputing grid, for some reason');
    if (!pond.ether) return null;
    return getTurfGrid(pond.ether);
  });

  return [pond, $pond];
}

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

export function rockToTurf(rock, id) {
  if (rock) rock.id = id;
  js.turf(rock);
  return rock;
}

const pondGrits = {
  'inc-counter': (turf, arg) => {
    turf.stuffCounter++;
  },
  'size-turf': (turf, arg) => {
    turf.offset = arg.offset;
    turf.size = arg.size;
    Object.values(turf.players).forEach((player) => {
      const newPos = clampToTurf(turf, player.pos);
      player.pos.x = newPos.x;
      player.pos.y = newPos.y;
    });
  },
  'add-husk': (turf, arg) => {
    const { pos, formId, variation } = arg;
    if (pos.x < turf.offset.x || pos.y < turf.offset.y) return;
    if (pos.x >= turf.offset.x + turf.size.x || pos.y >= turf.offset.y + turf.size.y) return;
    const formType = turf.skye[formId]?.type;
    const newHusk = {
      formId,
      variation,
      offset: vec2(),
      collidable: null,
      effects: {},
    }
    if (formType === 'tile') {
      jabBySpaces(turf, pos, space => space.tile = newHusk);
    } else if (formType == 'wall' || formType == 'item') {
      jabBySpaces(turf, pos, space => space.shades.unshift(turf.stuffCounter));
      turf.cave[turf.stuffCounter] = {
        pos,
        ...newHusk,
      }
      turf.stuffCounter++;
    }
  },
  'del-shade': (turf, arg) => {
    delShade(turf, arg.shadeId);
  },
  'cycle-shade': (turf, arg) => {
    const { shadeId, amount } = arg;
    const shade = turf.cave[shadeId];
    if (shade) {
      const form = turf.skye[shade.formId];
      if (form) {
        shade.variation = (shade.variation + amount) % form.variations.length;
      }
    }
  },
  'set-shade-var': (turf, arg) => {
    const { shadeId, variation } = arg;
    const shade = turf.cave[shadeId];
    if (shade) {
      const form = turf.skye[shade.formId];
      if (form) {
        shade.variation = variation % form.variations.length;
      }
    }
  },
  'set-shade-effect': (turf, arg) => {
    const { shadeId, trigger, effect } = arg;
    const shade = turf.cave[shadeId];
    if (shade) {
      shade.effects[trigger] = effect;
    }
  },
  'add-portal': (turf, arg) => {
    turf.portals[turf.stuffCounter] = {
      shadeId: null,
      for: arg.for,
      at: arg.at,
    }
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
    const shade = turf.cave[shadeId];
    if (shade) {
      const { fullFx, huskFx, formFx } = getEffectsByShade(turf, shade);
      Object.entries(fullFx).forEach(([trigger, effect]) => {
        if (effect?.type === 'port' && effect?.arg === portalId) {
          shade[trigger] = 'port';
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
      const newPos = clampToTurf(turf, arg.pos);
      player.pos.x = newPos.x;
      player.pos.y = newPos.y;
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
  'add-player': (turf, arg) => {
    turf.players[arg.ship] = arg.player;
  },
  'add-player': (turf, arg) => {
    turf.players[arg.ship] = arg.player;
  },
  'del-player': (turf, arg) => {
    delete turf.players[arg.ship];
  },
};

export function washTurf(update, grits) {
  grits.forEach((grit) => {
    update(_washTurf(grit));
  });
}

export function _washTurf(grit) {
  grit = cloneDeep(grit);
  // console.log('washing a turf with grit', JSON.stringify(grit, null, 2))
  switch (grit.type) {
    case 'noop':
      return (turf) => turf
    case 'del-turf':
      return null;
    case 'set-turf':
      return (turf) => {
        const newTurf = {
          id: turf?.id,
          ...grit.arg,
        };
        return js.turf(newTurf);
      };
    default:
      return produce((turf) => {
        pondGrits[grit.type](turf, grit.arg);
        js.turf(turf);
      });
  }
}

// returns false if goal is rejected
// otherwise, returns a pair of [goal, grit]
// or, more commonly, a single goal/grit
const filters = {
  'add-husk': (turf, goal) => {
    const { pos, formId } = goal.arg;
    if (!isInTurf(turf, pos)) return false;
    const currentSpace = turf.spaces[vecToStr(pos)];
    const currentTile = currentSpace?.tile;
    const currentShades = (currentSpace?.shades || []).map(sid => turf.cave[sid]);
    const tileAlreadyHere = currentTile?.formId === formId;
    const shadeAlreadyHere = currentShades.some((shade) => shade.formId === formId);
    if (!tileAlreadyHere && !shadeAlreadyHere) {
      return goal;
    }
    return false;
  },
  'move': (turf, goal) => {
    const { ship, pos } = goal.arg;
    const player = turf.players[ship];
    if (!player) return false;
    const newPos = clampToTurf(turf, pos);
    const playerColliding = getCollision(turf, player.pos);
    const willBeColliding = getCollision(turf, newPos);
    if (willBeColliding && !playerColliding) return false;
    if (newPos.equals(player.pos)) return false;
    goal.arg.pos = newPos;
    return goal;
  },
  'send-chat': (turf, goal) => {
    return [
      goal,
      {
        type: 'chat',
        arg: {
          from: goal.arg.from,
          at: Date.now(),
          text: goal.arg.text,
        }
      },
    ]
  },
  'create-bridge': (turf, goal) => {
    debugger;
  }
};

// returns false if wave is rejected
// otherwise, returns {goals, grits}
function filterGoals(turf, goals) {
  const [temp, $temp] = createStore(js.turf(cloneDeep(turf)));
  const newGoals = [], grits = [];
  goals.forEach((goal) => {
    const filtered = filterGoal(temp, goal);
    if (filtered) {
      newGoals.push(filtered.goal);
      grits.push(filtered.grit);
      washTurf($temp, [filtered.grit]);
    }
  });

  if (!grits.length) return false;
  return {
    goals: newGoals,
    grits,
  };
}

function filterGoal(turf, goal) {
  if (filters[goal.type]) {
    const goalGrit = filters[goal.type](turf, goal);
    if (!goalGrit) return false;
    if (goalGrit instanceof Array) {
      return { goal: goalGrit[0], grit: goalGrit[1] };
    }
    return { goal: goalGrit, grit: goalGrit };
  }
  return { goal: goal, grit: goal };
}

// We mutate everything I guess!
const js = {
  turf(turf) {
    // this.deepVec2(turf)
    if (turf) {
      turf.chats.forEach(this.chat.bind(this));
    }
    return turf;
  },
  chat(chat) {
    chat.at = new Date(chat.at);
  },
  deepVec2(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        // Recursively iterate through nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          if (Object.keys(value).sort().join() == 'x,y' && value.constructor.name == 'Object') {
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
