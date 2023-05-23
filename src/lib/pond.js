import { vec2 } from 'lib/utils';

export function rockToTurf(rock, id) {
  turf.id = id;
  return js.turf(rock);
}

export function washTurf(turf, wave) {
  switch (wave.type) {
    case 'del-turf':
      turf = null;
      break;
    case 'inc-counter':
      turf['item-counter']++;
      break;
    case 'set-turf':
      turf = js.turf(wave.arg);
      break;
    case 'chat':
      turf.chats.unshift(wave.arg);
      break;
    default:
  }
  return turf;
}

const js = {
  turf(turf) {
    turf = this.deepVec2(turf)
    turf.chats = turf.chats.map((chat) => {
      chat.at = new Date(chat.at);
      return chat;
    });
    return turf;
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
