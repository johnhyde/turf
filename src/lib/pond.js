import { unwrap, produce, reconcile } from "solid-js/store";
import { vec2 } from 'lib/utils';

export function rockToTurf(rock, id) {
  rock.id = id;
  js.turf(rock);
  return rock;
}

export function washTurf(wave) {
  const pondWaves = {
    'inc-counter':
      (turf) => {
        turf.itemCounter++;
      },
    'add-item':
      (turf) => {
        const { pos, itemId, variation } = wave.arg;
        const normPos = vec2(pos).sub(turf.offset);
        const itemType = turf.library[itemId]?.type;
        const newItem = {
          itemId,
          id: turf.itemCounter,
          variation,
          offset: vec2(),
        }
        if (itemType === 'tile') {
          turf.spaces[normPos.x][normPos.y].tile = newItem;
          turf.itemCounter++;
        } else if (itemType == 'wall' || itemType == 'item') {
          turf.spaces[normPos.x][normPos.y].items.unshift(newItem);
          turf.itemCounter++;
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
          player.pos = wave.arg.pos;
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
    this.deepVec2(turf)
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

export function extractLibrarySprites(library) {
  const sprites = {};
  Object.entries(library).forEach(([itemId, item]) => {
    item.variations.forEach((variation, i) => {
      if (variation.back) {
        sprites[spriteName(itemId, i, 'back')] = {
          item,
          sprite: variation.back,
        };
      }
      if (variation.fore) {
        sprites[spriteName(itemId, i, 'fore')] = {
          item,
          sprite: variation.fore,
        };
      }
    });
  });
  return sprites;
}

export function extractPlayerSprites(players) {
  const sprites = {};
  Object.entries(players).forEach(([patp, player]) => {
    player.avatar.items.forEach((item) => {
      item.variations.forEach((variation, i) => {
        if (variation.back) {
          sprites[spriteName(item.itemId, i, 'back', patp)] = {
            item,
            sprite: variation.back,
          };
        }
        if (variation.fore) {
          sprites[spriteName(item.itemId, i, 'fore', patp)] = {
            item,
            sprite: variation.fore,
          };
        }
      });
    });
  });
  return sprites;
}

export function spriteName(id, variation, layer, patp='') {
  return patp + id.replace(/\//g, '-') + '_' + (variation || '0') + (layer ? '_' + layer : '');
}
