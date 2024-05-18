// import { vec2 } from 'lib/utils.js';

export function newFxTarget(type = 'this') {
  switch (type) {
    case 'this':
    case 'user':
      return type;
    default: // item & player
      return {
        type,
        arg: null,
      };
  }
}
export function newFxLocation(type = 'target') {
  switch (type) {
    case 'target':
      return {
        type,
        arg: newFxTarget(),
      };
    case 'offset':
      return {
        type,
        arg: {
          offset: newFxOffset(),
          loc: newFxLocation(),
        },
      };
    default: // absolute
      return {
        type,
        arg: vec2(),
      };
  }
}
export function newFxOffset(type = 'absolute') {
  let arg;
  switch (type) {
    case 'relative':
      arg = newFxFromTo();
      return { type, arg };
    case 'direction':
      arg = {
        direction: newFxDir8(),
        distance: 0,
      };
      return { type, arg };
    case 'rotate':
      arg = {
        rotation: newFxDir(),
        offset: newFxOffset(),
      };
      return { type, arg };
    case 'flip-x':
      arg = newFxOffset();
      return { type, arg };
    case 'flip-y':
      arg = newFxOffset();
      return { type, arg };
    case 'combine':
      arg = {
        a: newFxOffset(),
        b: newFxOffset(),
      };
      return { type, arg };
    case 'absolute':
    default:
      arg = vec2();
      return { type, arg };
  }
}
export function newFxDir(type = 'absolute') {
  let arg;
  switch (type) {
    case 'face':
      arg = newFxTarget();
      return { type, arg };
    case 'relative':
      arg = {
        round: 'ud',
        ...newFxFromTo(),
      };
      return { type, arg };
    case 'round':
      arg = {
        round: 'ud',
        dir: newFxDir8(),
      };
      return { type, arg };
    case 'rotate':
      arg = {
        a: newFxDir(),
        b: newFxDir(),
      };
      return { type, arg };
    case 'flip-x':
      arg = newFxDir();
      return { type, arg };
    case 'flip-y':
      arg = newFxDir();
      return { type, arg };
    case 'absolute':
    default:
      arg = 'down';
      return { type, arg };
  }
}
export function newFxDir8(type = 'absolute-8') {
  let arg;
  switch (type) {
    case 'relative-8':
      arg = newFxFromTo();
      return { type, arg };
    case 'rotate-8':
      arg = {
        a: newFxDir8(),
        b: newFxDir8(),
      };
      return { type, arg };
    case 'flip-x-8':
      arg = newFxDir8();
      return { type, arg };
    case 'flip-y-8':
      arg = newFxDir8();
      return { type, arg };
    case 'absolute-8':
      arg = 'down';
      return { type, arg };
    default:
      return newFxDir(type);
  }
}
export function newFxFromTo() {
  return {
    from: newFxLocation(),
    to: newFxLocation(),
  };
}
