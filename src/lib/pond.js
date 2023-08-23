import { createMemo } from "solid-js";
import { produce } from "solid-js/store";
import cloneDeep from 'lodash/cloneDeep';
import * as api from 'lib/api.js';
import {
  clampToTurf, isInTurf, getCollision, getEffectsByShade,
  jabBySpaces, delShade, delPortal
} from 'lib/turf';
import { vec2, vecToStr, jClone } from 'lib/utils';
import { getPool } from 'lib/pool';

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
    const wash = (update, grits) => {
      update((turf) => {
        if (!turf?.id) return { ...turf, id };
        return turf;
      });
      washTurf(update, grits);
    }
    const hydrate = (rock) => {
      if (rock) rock.id = id;
      return js.turf(rock);
    }
    const apiSendWave = (...args) => {
      api.sendPondWave(id, ...args);
    };
    this._ = getPool(wash, hydrate, apiSendWave, filters);
    this.$ = this._.$;

    this._grid = createMemo(() => {
      if (!this.ether) return null;
      return getTurfGrid(this.ether);
    });

    this.subscribe();
  }

  get turf() {
    return this._.real;
  }

  get pulses() {
    return this._.pulses;
  }

  get charges() {
    return this._.charges;
  }

  get ether() {
    return this._.fake;
  }

  get grid() {
    return this._grid();
  }

  // returns true/false whether we attempted to send the wave or not
  // returns false if stir was judged to be unworthy (e.g. placing a duplicate item)
  sendWave(type, arg, batch = true) {
    this._.sendWave(type, arg, batch);
  }

  subscribe() {
    const onPondErr = () => {};
    const onPondQuit = () => {};
    api.subscribeToTurf(this.id, this._.onRes.bind(this._), onPondErr, onPondQuit);
  }
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
        if (pondGrits[grit.type]) {
          pondGrits[grit.type](turf, grit.arg);
          js.turf(turf);
        } else {
          console.warn(`Could not process grit of type: ${grit.type}`);
        }
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
    // if (willBeColliding && !playerColliding) return false;
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
