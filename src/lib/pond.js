import { batch, on, createEffect, createMemo, createSignal, mergeProps, getOwner } from "solid-js";
import { createStore, unwrap, produce, reconcile } from "solid-js/store";
import * as api from 'lib/api.js';
import { vec2, minV, maxV, uuidv4, dirs } from 'lib/utils';

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
    return this._.ether;
  }

  async sendWave(mark, data) {
    console.log('sending wave', mark);
    const uuid = uuidv4();
    this.addPulse({
      id: uuid,
      wave: {
        type: mark,
        arg: data,
      },
    });
    this.sendWavePoke(mark, data, uuid);
  }
  async sendWavePoke(mark, data, uuid, retries = 0) {
    try {
      await api.sendPondWave(this.id, mark, data, uuid);
    } catch (e) {
      if (e.message === 'Failed to fetch') {
        // internet connectivity issue
        if (retries < 4) { // 15 seconds before pulse is discarded (1+2+4+8)
          const timeout = Math.pow(2, retries)*1000;
          retries++;
          console.warn(`Failed to send wave, attempting retry #${retries} in ${timeout/1000}s`);
          setTimeout(() => this.sendWavePoke(mark, data, uuid, retries), timeout);
        } else {
          console.warn('Failed to send wave, no more retries');
          this.removePulse(uuid);
        }
      } else {
        throw e;
      }
    }
  }

  onPondRes(res) {
    if (res.hasOwnProperty('rock')) {
      const newTurf = rockToTurf(res.rock, this.id);
      console.log('new turf from rock', newTurf);
      this.$('turf', reconcile(newTurf, { merge: true }));
    } else if (res.hasOwnProperty('wave')) {
      console.log('getting wave', res.wave?.type || 'no-op');
      batch(() => {
        if (res.id) {
          const pulseI = this.pulses.findIndex(p => p.id === res.id);
          if (pulseI >= 0) {
            // const pulse = this.pulses[pulseI];
            this.$('pulses', p => p.slice(pulseI + 1));
          }
        }
        if (res.wave) {
          this.$('turf', washTurf(res.wave));
        }
      });
    } else {
      console.error('Pond response not a rock or wave???', res);
    }
  }

  subscribe() {
    const onPondErr = () => {};
    const onPondQuit = () => {};
    api.subscribeToTurf(this.id, this.onPondRes.bind(this), onPondErr, onPondQuit);
  }

  addPulse(pulse) {
    this.$('pulses', (pulses) => [...pulses, pulse]);
  }

  removePulse(uuid) {
    const pulseI = this.pulses.findIndex(p => p.id === uuid);
    this.$('pulses', p => [...p.slice(0, pulseI), ...p.slice(pulseI + 1)]);
  }
}

export function getPond() {
  let ether;
  const [pond, $pond] = createStore({
    turf: null,
    ether: null,
    pulses: [],
    // get ether() {
    //   return ether();
    // },
  });

  // createEffect(on(() => JSON.stringify(pond.pulses), () => {
  createEffect(() => {
    if (!pond.turf) return null;
    batch(() => {
      console.log('constructing ether');
      const turfCopy = js.turf(JSON.parse(JSON.stringify(pond.turf)));
      $pond('ether', reconcile(turfCopy, { merge: true }));
      // $pond('ether', reconcile(pond.turf));
      pond.pulses.forEach((pulse) => {
        $pond('ether', washTurf(pulse.wave));
      });
    })
  });
  // };
  return [pond, $pond];
}

export function rockToTurf(rock, id) {
  rock.id = id;
  js.turf(rock);
  return rock;
}

export function washTurf(wave) {
  const pondWaves = {
    'inc-counter':
      (turf) => {
        turf.stuffCounter++;
      },
    'add-husk':
      (turf) => {
        const { pos, formId, variation } = wave.arg;
        const normPos = vec2(pos).subtract(turf.offset);
        if (normPos.x < 0 || normPos.y < 0) return;
        if (normPos.x >= turf.size.x || normPos.y >= turf.size.y) return;
        const formType = turf.skye[formId]?.type;
        const newHusk = {
          formId,
          variation,
          offset: vec2(),
          collidable: null,
          effects: {},
        }
        if (formType === 'tile') {
          turf.spaces[normPos.x][normPos.y].tile = newHusk;
        } else if (formType == 'wall' || formType == 'item') {
          turf.spaces[normPos.x][normPos.y].shades.unshift(turf.stuffCounter);
          turf.cave[turf.stuffCounter] = {
            pos,
            ...newHusk,
          }
          turf.stuffCounter++;
        }
      },
    'del-shade':
      (turf) => {
        const { shadeId } = wave.arg;
        const shade = turf.cave[shadeId];
        if (shade) {
          const normPos = vec2(shade.pos).subtract(turf.offset);
          const space = turf.spaces[normPos.x]?.[normPos.y];
          if (space) {
            space.shades = [space.shades || []].filter((shadeId) => shadeId !== shadeId);
          }
          delete turf.cave[shadeId];
        }
      },
    'cycle-shade':
      (turf) => {
        const { shadeId, amount } = wave.arg;
        const shade = turf.cave[shadeId];
        if (shade) {
          const form = turf.skye[shade.formId];
          if (form) {
            shade.variation = (shade.variation + amount) % form.variations.length;
          }
        }
      },
    'set-shade-var':
      (turf) => {
        const { shadeId, variation } = wave.arg;
        const shade = turf.cave[shadeId];
        if (shade) {
          const form = turf.skye[shade.formId];
          if (form) {
            shade.variation = variation % form.variations.length;
          }
        }
      },
    'chat':
      (turf) => {
        turf.chats.unshift(wave.arg);
      },
    'move':
      (turf) => {
        const player = turf.players[wave.arg.ship];
        if (player) {
          const bounds = getTurfBounds(turf);
          const newPos = minV(maxV(vec2(wave.arg.pos), bounds.topLeft), bounds.botRight.subtract(vec2(1)));
          // const newPos = vec2(wave.arg.pos);
          player.pos.x = newPos.x;
          player.pos.y = newPos.y;
        }
      },
    'face':
      (turf) => {
        const player = turf.players[wave.arg.ship];
        if (player) {
          player.dir = wave.arg.dir;
        }
      },
    'set-avatar':
      (turf) => {
        const player = turf.players[wave.arg.ship];
        if (player) {
          player.avatar = wave.arg.avatar;
        }
      }
  };

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
        pondWaves[wave.type](turf);
        js.turf(turf);
      });
  }
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

export function getTurfBounds(turf) {
  return {
    topLeft: vec2(turf.offset),
    botRight: vec2(turf.offset).add(turf.size),
  };
}

export function getShadeWithForm(turf, shadeId) {
  const shade = turf.cave[shadeId];
  if (!shade) return null;
  const form = turf.skye[shade.formId];
  if (!form) return null;
  return {
    ...shade,
    id: shadeId,
    form,
  };
}

export function getShadesAtPos(turf, pos) {
  const normPos = vec2(pos).subtract(turf.offset);
  const shades = turf.spaces[normPos.x]?.[normPos.y]?.shades;
  if (!shades) return [];
  return shades.map(sid => getShadeWithForm(turf, sid));
}

export function getShadesAtPosByType(turf, pos, type) {
  return getShadesAtPos(turf, pos).filter(shade => shade.form.type === type);
}

export function getWallsAtPos(turf, pos) {
  return getShadesAtPosByType(turf, pos, 'wall');
}

export function getWallVariationAtPos(turf, pos, orFlags = 0, andFlags = 15) {
  const down = getWallsAtPos(turf, vec2(pos).add(vec2(0, 1)));
  const right = getWallsAtPos(turf, vec2(pos).add(vec2(1, 0)));
  const up = getWallsAtPos(turf, vec2(pos).add(vec2(0, -1)));
  const left = getWallsAtPos(turf, vec2(pos).add(vec2(-1, 0)));
  // set flag to one if length > 0
  const d = +!!down.length;
  const r = +!!right.length;
  const u = +!!up.length;
  const l = +!!left.length;
  const flags = ((d + (r * 2) + (u * 4) + (l * 8)) | orFlags) & andFlags;
  return [0, 1, 2, 7, 3, 5, 8, 11, 4, 10, 6, 14, 9, 13, 12, 15][flags];
}

export function extractSkyeSprites(skye) {
  const sprites = {};
  Object.entries(skye).forEach(([formId, form]) => {
    form.variations.forEach((variation, i) => {
      if (variation) {
        sprites[spriteName(formId, i)] = variation.sprite;
      }
    });
  });
  return sprites;
}

function addThingSprites(sprites, thing, patp) {
  thing.form.variations.forEach((variation, i) => {
    if (variation) {
      sprites[spriteName(thing.formId, i, patp)] = variation.sprite;
    }
  });
}

export function extractPlayerSprites(players) {
  const sprites = {};
  Object.entries(players).forEach(([patp, player]) => {
    addThingSprites(sprites, player.avatar.body.thing, patp);
    player.avatar.things.forEach((thing) => {
      addThingSprites(sprites, thing, patp);
    });
  });
  return sprites;
}

export function spriteName(id, variation, patp='') {
  return patp + id.replace(/\//g, '-') + '_' + (variation || '0');
}

export function spriteNameWithDir(id, form, dir = dir.DOWN, patp='') {
  let variation = dirs[dir];
  const len = form.variations.length;
  if (len === 3) {
    if (variation === 3) variation = 1; // left is right flipped
  } else if (len === 2) {
    if (variation === 2) return null; // don't display
  }
  variation = variation % form.variations.length;
  return spriteName(id, variation, patp);
}

export function extractShades(turf) {
  const husks = [];
  turf.spaces.forEach((col, i) => {
    col.forEach((space, j) => {
      const pos = vec2(i, j).add(turf.offset);
      space.husks.forEach((form) => {
        husks.push([pos, form]);
      });
    });
  });
  return husks;
}
