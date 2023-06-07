import { batch, on, createEffect, createMemo, createSignal, mergeProps, getOwner, createUniqueId } from "solid-js";
import { createStore, unwrap, produce, reconcile } from "solid-js/store";
import * as api from '~/api.js';
import { vec2, minV, maxV } from 'lib/utils';

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
    const uuid = createUniqueId();
    this.$('pulses', (pulses) => [...pulses, {
      id: uuid,
      wave: {
        type: mark,
        arg: data,
      },
    }]);
    api.sendPondWave(this.id, mark, data, uuid);
  }

  onPondRes(res) {
    if (res.rock) {
      const newTurf = rockToTurf(res.rock, this.id);
      console.log(newTurf);
      this.$('turf', reconcile(newTurf, { merge: true }));
    } else if (res.wave) {
      console.log('getting wave', res.wave.type);
      batch(() => {
        if (res.id) {
          const pulseI = this.pulses.findIndex(p => p.id === res.id);
          if (pulseI >= 0) {
            // const pulse = this.pulses[pulseI];
            this.$('pulses', p => p.slice(pulseI + 1));
          }
        }
        this.$('turf', washTurf(res.wave));
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
    'chat':
      (turf) => {
        turf.chats.unshift(wave.arg);
      },
    'move':
      (turf) => {
        const player = turf.players[wave.arg.ship];
        if (player) {
          const bounds = getTurfBounds(turf);
          // player.pos = minV(maxV(vec2(wave.arg.pos), bounds.topLeft), bounds.botRight.subtract(vec2(1)));
          const newPos = minV(maxV(vec2(wave.arg.pos), bounds.topLeft), bounds.botRight.subtract(vec2(1)));
          player.pos.x = newPos.x;
          player.pos.y = newPos.y;
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
        return reconcile(js.turf(newTurf), { merge: true });
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

export function extractSkyeSprites(skye) {
  const sprites = {};
  Object.entries(skye).forEach(([formId, form]) => {
    form.variations.forEach((variation, i) => {
      if (variation.back) {
        sprites[spriteName(formId, i, 'back')] = variation.back;
      }
      if (variation.fore) {
        sprites[spriteName(formId, i, 'fore')] = variation.fore;
      }
    });
  });
  return sprites;
}

export function extractPlayerSprites(players) {
  const sprites = {};
  Object.entries(players).forEach(([patp, player]) => {
    player.avatar.things.forEach((thing) => {
      thing.variations.forEach((variation, i) => {
        if (variation.back) {
          sprites[spriteName(thing.formId, i, 'back', patp)] = variation.back;
        }
        if (variation.fore) {
          sprites[spriteName(thing.formId, i, 'fore', patp)] = variation.fore;
        }
      });
    });
  });
  return sprites;
}

export function spriteName(id, variation, layer, patp='') {
  return patp + id.replace(/\//g, '-') + '_' + (variation || '0') + (layer ? '_' + layer : '');
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
