import { createRenderEffect } from 'solid-js';

const Vector2 = Phaser.Math.Vector2;

/** 
 * Create a 2d vector, can take another Vector2 to copy, 2 scalars, or 1 scalar
 * @param {Number} [x=0]
 * @param {Number} [y=0]
 * @return {Vector2}
 * @example
 * let a = vec2(0, 1); // vector with coordinates (0, 1)
 * let b = vec2(a);    // copy a into b
 * a = vec2(5);        // set a to (5, 5)
 * b = vec2();         // set b to (0, 0)
 * @memberof Utilities
 */
export const vec2 = (x=0, y)=> x.x == undefined ? new Vector2(Number(x), y == undefined? Number(x) : Number(y)) : new Vector2(x.x, x.y);
window.vec2 = vec2;

export function minV(a, b) {
  return vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
}

export function maxV(a, b) {
  return vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
}

export function floorV(v) {
  v = vec2(v);
  return vec2(Math.floor(v.x), Math.floor(v.y));
}

export function roundV(v) {
  v = vec2(v);
  return vec2(Math.round(v.x), Math.round(v.y));
}

export function swapAxes(array2d) {
  if (!array2d || array2d.length === 0) return [];
  return array2d[0].map((_, colIndex) => array2d.map(row => row[colIndex]));
}

export function flattenGrid(array2d) {
  return swapAxes(array2d).flat();
}

export function near(a, b, epsilon=1e-2) {
  return Math.abs(a - b) <= epsilon;
}

export function pixelsToTiles(pixels, tileSize=32) {
  pixels = vec2(pixels);
  return vec2(
    Math.floor(pixels.x/tileSize),
    Math.floor(pixels.y/tileSize),
  );
}

export const dirs = {
  DOWN: 'down',
  RIGHT: 'right',
  UP: 'up',
  LEFT: 'left',
  0: 'down',
  1: 'right',
  2: 'up',
  3: 'left',
  'down': 0,
  'right': 1,
  'up': 2,
  'left': 3,
}

export function getDirFromVec(v) {
  let dir = dirs.DOWN;
  if (v.y < 0) dir = dirs.UP;
  if (v.y > 0) dir = dirs.DOWN;
  if (v.x < 0) dir = dirs.LEFT;
  if (v.x > 0) dir = dirs.RIGHT;
  return dir;
}

export function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

export function hexToInt(color) {
  return Number('0x' + color.replace(/(#|0x)/, ''));
}

export function intToHex(color) {
  return '#' + color.toString(16).padStart(6, '0');
}

export function vecToStr(vec) {
  return vec.x + ',' + vec.y;
}

export function jClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


/** Random global functions
 *  @namespace Random */

/** Returns a random value between the two values passed in
 *  @param {Number} [valueA=1]
 *  @param {Number} [valueB=0]
 *  @return {Number}
 *  @memberof Random */
export const rand = (a=1, b=0)=> b + (a-b)*Math.random();

/** Returns a floored random value the two values passed in
 *  @param {Number} [valueA=1]
 *  @param {Number} [valueB=0]
 *  @return {Number}
 *  @memberof Random */
export const randInt = (a=1, b=0)=> rand(a,b)|0;

/** Randomly returns either -1 or 1
 *  @return {Number}
 *  @memberof Random */
export const randSign = ()=> (rand(2)|0) * 2 - 1;

/** Returns a random Vector2 within a circular shape
 *  @param {Number} [radius=1]
 *  @param {Number} [minRadius=0]
 *  @return {Vector2}
 *  @memberof Random */
export const randInCircle = (radius=1, minRadius=0)=> radius > 0 ? randVector(radius * rand(minRadius / radius, 1)**.5) : new Vector2;

/** Returns a random Vector2 with the passed in length
 *  @param {Number} [length=1]
 *  @return {Vector2}
 *  @memberof Random */
export const randVector = (length=1)=> new Vector2(length, 0).rotate(rand(2*PI));

/** Returns a random color between the two passed in colors, combine components if linear
 *  @param {Color}   [colorA=new Color(1,1,1,1)]
 *  @param {Color}   [colorB=new Color(0,0,0,1)]
 *  @param {Boolean} [linear]
 *  @return {Color}
 *  @memberof Random */
// export const randColor = (cA = new Color, cB = new Color(0,0,0,1), linear)=>
//     linear ? cA.lerp(cB, rand()) : new Color(rand(cA.r,cB.r),rand(cA.g,cB.g),rand(cA.b,cB.b),rand(cA.a,cB.a));

/** The seed used by the randSeeded function, should not be 0
 *  @memberof Random */
let randSeed = 1;

/** Returns a seeded random value between the two values passed in using randSeed
 *  @param {Number} [valueA=1]
 *  @param {Number} [valueB=0]
 *  @return {Number}
 *  @memberof Random */
export const randSeeded = (a=1, b=0)=>
{
    randSeed ^= randSeed << 13; randSeed ^= randSeed >>> 17; randSeed ^= randSeed << 5; // xorshift
    return b + (a-b) * abs(randSeed % 1e9) / 1e9;
}

export const Random = {
  rand,
  randInt,
  randSign,
  randInCircle,
  randVector,
  // randColor,
  randSeeded,
}

export function bind(el, accessor) {
  const [s, set] = accessor();
  el.addEventListener("input", (e) => set(e.currentTarget.value));
  createRenderEffect(() => {
    el.value = s();
  }); 
}

export function isTextInputFocused() {
  return document.activeElement.tagName == 'TEXTAREA' || document.activeElement.tagName == 'INPUT';
}
