import { unwrap } from "solid-js/store";
import { vec2 } from 'lib/utils';

export function rockToTurf(rock, id) {
  rock.id = id;
  return js.turf(rock);
}

export function washTurf(turf, wave) {
  turf = unwrap(turf);
  switch (wave.type) {
    case 'del-turf':
      turf = null;
      break;
    case 'inc-counter':
      turf['item-counter']++;
      break;
    case 'set-turf':
      turf = wave.arg;
      break;
    case 'chat':
      turf.chats.unshift(wave.arg);
      break;
    default:
  }
  turf = js.turf(turf);
  return turf;
}

const js = {
  turf(turf) {
    turf = this.deepVec2(turf)
    turf.chats = turf.chats.map(this.chat.bind(this));
    return turf;
  },
  chat(chat) {
    chat.at = new Date(chat.at);
    return chat;
  },
  deepVec2(obj) {
    obj = JSON.parse(JSON.stringify(obj));
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        // Recursively iterate through nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          if (Object.keys(value).sort().join() == 'x,y' && value.constructor.name == 'Object') {
            obj[key] = this.vec2(value);
          } else {
            obj[key] = this.deepVec2(value);
          }
        }
      }
    }
    return obj;
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

export function spriteName(id, variation, layer) {
  return id.replace(/\//g, '-') + '_' + (variation || '0') + (layer ? '_' + layer : '');
}
