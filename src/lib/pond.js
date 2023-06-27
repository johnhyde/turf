import { batch, on, createEffect, createMemo, createSignal, mergeProps, getOwner } from "solid-js";
import { createStore, unwrap, produce, reconcile } from "solid-js/store";
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import * as api from 'lib/api.js';
import { clampToTurf, isInTurf, getCollision, jabBySpaces } from 'lib/turf';
import { vec2, minV, maxV, uuidv4, dirs, vecToStr, jClone } from 'lib/utils';

export class Pond { // we use a class so we can put it inside a store without getting proxied
  constructor(id) {
    this.id = id;
    const [pond, $pond] = getPond(id);
    this._ = pond;
    this.$ = $pond;
    this.subscribe();
  }

  get turf() {
    return this._.turf;
  }

  get pulses() {
    return this._.pulses;
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
  sendWave(type, arg) {
    let stirWave = filterStir(this.ether, { type, arg });
    if (!stirWave) return false;
    const [stir, wave] = stirWave;
    const uuid = uuidv4();
    console.log('sending wave', type, 'with id', uuid ? uuid.substring(0, 4) : uuid);
    this.addPulse({
      id: uuid,
      wave,
    });
    this.sendWavePoke(stir.type, stir.arg, uuid);
    return true;
  }
  async sendWavePoke(type, arg, uuid, retries = 0) {
    try {
      await api.sendPondWave(this.id, type, arg, uuid);
    } catch (e) {
      if (e.message === 'Failed to fetch') {
        // internet connectivity issue
        if (retries < 4) { // 15 seconds before pulse is discarded (1+2+4+8)
          const timeout = Math.pow(2, retries)*1000;
          retries++;
          console.warn(`Failed to send wave, attempting retry #${retries} in ${timeout/1000}s`);
          setTimeout(() => this.sendWavePoke(type, arg, uuid, retries), timeout);
        } else {
          console.warn('Failed to send wave, no more retries');
          this.removePulse(uuid);
          this.replayEther();
        }
      } else {
        throw e;
      }
    }
  }

  onPondRes(res) {
    batch(() => {
      if (res.hasOwnProperty('rock')) {
        const newTurf = rockToTurf(res.rock, this.id);
        console.log('new turf from rock', newTurf);
        this.$('turf', reconcile(newTurf, { merge: true }));
        this.resetEther();
        this.removePulses();
      } else if (res.hasOwnProperty('wave')) {
        const { grit, id } = res.wave;
        console.log('getting wave', grit?.type || 'no-op', 'with id', id ? id.substring(0, 4) : id);
        const noop = !grit;
        const noPulses = this.pulses.length === 0;
        
        if (!noop) {
          this.$('turf', washTurf(grit));
        }
        if (!noop && noPulses) {
          this.$('ether', washTurf(grit));
        } else {
          const pulseI = !id ? -1 : this.pulses.findIndex(p => p.id === id);
          const matches = pulseI >= 0;
          const matchesFirst = pulseI === 0;
          const confirms = !noop && matches && isEqual(jClone(this.pulses[pulseI].wave), grit);
          const changesSomething = !noop || matches;
          const etherInvalidated = changesSomething && (!matchesFirst || !confirms);
          if (matches) {
            // once we can guarantee that pokes are send to ship in order,
            // we can throw out any pulses before the matched one
            this.$('pulses', p => [...p.slice(0, pulseI), ...p.slice(pulseI + 1)]);
          }
          if (etherInvalidated) {
            this.replayEther();
          }
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

  addPulse(pulse) {
    batch(() => {
      this.$('pulses', (pulses) => [...pulses, pulse]);
      this.applyPulse(pulse);
    });
  }

  applyPulse(pulse) {
    this.$('ether', washTurf(pulse.wave));
  }

  applyPulses() {
    this.pulses.forEach((pulse) => {
      this.applyPulse(pulse);
    });
  }

  removePulse(uuid) {
    const pulseI = this.pulses.findIndex(p => p.id === uuid);
    this.$('pulses', p => [...p.slice(0, pulseI), ...p.slice(pulseI + 1)]);
  }

  removePulses() {
    this.$('pulses', []);
  }

  resetEther() {
    const turfCopy = js.turf(cloneDeep(this.turf));
    this.$('ether', reconcile(turfCopy, { merge: true }));
  }

  replayEther() {
    this.resetEther();
    this.applyPulses();
  }
}

export function getPond() {
  let ether, grid;
  const [pond, $pond] = createStore({
    turf: null,
    ether: null,
    pulses: [],
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
  rock.id = id;
  js.turf(rock);
  return rock;
}

const pondWaves = {
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
    const { shadeId } = arg;
    const shade = turf.cave[shadeId];
    if (shade) {
      jabBySpaces(turf, shade.pos, (space) => {
        space.shades = space.shades.filter((shadeId) => shadeId !== shadeId);
      });
      delete turf.cave[shadeId];
    }
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
};

export function washTurf(wave) {
  switch (wave.type) {
    case 'del-turf':
      return null;
    case 'set-turf':
      return (turf) => {
        const newTurf = {
          id: turf.id,
          ...wave.arg,
        };
        return js.turf(newTurf);
      };
    default:
      return produce((turf) => {
        pondWaves[wave.type](turf, wave.arg);
        js.turf(turf);
      });
  }
}

// returns false if wave is rejected
// otherwise, returns a pair of [stir, wave]
// or, more commonly, a single stir/wave
const filters = {
  'add-husk': (turf, wave) => {
    const { pos, formId } = wave.arg;
    if (!isInTurf(turf, pos)) return false;
    const currentSpace = turf.spaces[vecToStr(pos)];
    const currentTile = currentSpace?.tile;
    const currentShades = (currentSpace?.shades || []).map(sid => turf.cave[sid]);
    const tileAlreadyHere = currentTile?.formId === formId;
    const shadeAlreadyHere = currentShades.some((shade) => shade.formId === formId);
    if (!tileAlreadyHere && !shadeAlreadyHere) {
      return wave;
    }
    return false;
  },
  'move': (turf, wave) => {
    const { ship, pos } = wave.arg;
    const player = turf.players[ship];
    if (!player) return false;
    const newPos = clampToTurf(turf, pos);
    const playerColliding = getCollision(turf, player.pos);
    const willBeColliding = getCollision(turf, newPos);
    if (willBeColliding && !playerColliding) return false;
    if (newPos.equals(player.pos)) return false;
    wave.arg.pos = newPos;
    return wave;
  },
  'send-chat': (turf, stir) => {
    return [
      stir,
      {
        type: 'chat',
        arg: {
          from: stir.arg.from,
          at: Date.now(),
          text: stir.arg.text,
        }
      },
    ]
  },
};

// returns false if wave is rejected
// otherwise, returns a pair of [stir, wave]
function filterStir(turf, wave) {
  if (filters[wave.type]) {
    const stirWave = filters[wave.type](turf, wave);
    if (!stirWave) return false;
    if (stirWave instanceof Array) return stirWave;
    return [stirWave, stirWave];
  }
  return [wave, wave];
}

// We mutate everything I guess!
const js = {
  turf(turf) {
    // this.deepVec2(turf)
    turf.chats.forEach(this.chat.bind(this));
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
