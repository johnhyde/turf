import { decToUd, udToDec, unixToDa } from '@urbit/api';
import { hex2patp, patp2hex, patp } from 'urbit-ob';
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
export const vec2 = (x=0, y)=> x.x == undefined ? new Vector2(Number(x), y == undefined? Number(x) : Number(y)) : new Vector2(Number(x.x), Number(x.y));
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

export function nearestPow2(x) {
  return Math.pow(2, Math.round(Math.log(x)/0.6931471805599453)) // 0.693... being Math.log(2)
}

export function pixelsToTiles(pixels, tileSize=32) {
  pixels = vec2(pixels);
  return vec2(
    Math.floor(pixels.x/(factor*tileSize)),
    Math.floor(pixels.y/(factor*tileSize)),
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

export function makeTlonId() {
  const time = Date.now();
  return {
    id: `${our}/${decToUd(unixToDa(time).toString())}`,
    time,
  };
}

export function hexToInt(color) {
  return Number('0x' + color.replace(/(#|0x)/, ''));
}

export function intToHex(color) {
  return '#' + color.toString(16).padStart(6, '0');
}

export function intToRGB(decimal) {
  return {
    red: (decimal >> 16) & 0xff,
    green: (decimal >> 8) & 0xff,
    blue: decimal & 0xff,
  };
}

export function vecToStr(vec) {
  return vec.x + ',' + vec.y;
}

export function sig(str) {
  if (str[0] !== '~') {
    return '~' + str;
  }
  return str;
}

export function desig(str) {
  if (str[0] === '~') {
    return str.substring(1);
  }
  return str;
}

export function sanitizePatpInput(str) {
  return str.toLowerCase().trim();
}

export function normalizeId(patp) {
  return unpadPatp(sig(sanitizePatpInput(patp)));
}

export function normalizeIdAndDesig(patp) {
  return desig(normalizeId(patp));
}

export function unpadPatp(patp) {
  try {
    return hex2patp(patp2hex(patp));
  } catch {
    return patp;
  }
}

export function isValidPath(path) {
  return /^(\/[-~._0-9a-z]*)+$/.test(path);
}

export function jClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function stripPathPrefix(path) {
  return path.replace(/\/[^/]+\//, '');
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

export function autofocus(el, _) {
  if (el.offsetHeight) {
    el.focus();
  } else {
    setTimeout(() => autofocus(el), 10);
  }
}

export function input(el, callbacks) {
  function focus() {
    el.focus();
  }
  function blur() {
    el.blur();
  }
  el.addEventListener('focus', (e) => {
    game.input.keyboard.enabled = false;
    game.canvas.addEventListener('click', blur);
    const { onFocus } = callbacks();
    if (onFocus) onFocus(e);
  });
  el.addEventListener('blur', (e) => {
    game.input.keyboard.enabled = true;
    game.canvas.removeEventListener('click', blur);
    const { onBlur } = callbacks();
    if (onBlur) onBlur(e);
  });
}

export function isTextInputFocused() {
  return document.activeElement.tagName == 'TEXTAREA' || document.activeElement.tagName == 'INPUT';
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

export function makeImage(url) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();
      image.onload = () => createImageBitmap(image).then((bitmap) => {
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0);
        
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let dataUrl = canvas.toDataURL();
        console.log('loaded ' + url, dataUrl);
        resolve({
          image,
          bitmap,
          imageData,
          dataUrl,
        });
      });
      image.onerror = reject;
      image.src = url;
    } catch (e) {
      reject(e);
    }
  })
}

export async function tintImage(image, color) {
  const rgb = intToRGB(color);
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = (rgb.red * data[i])/256; // red
    data[i + 1] = (rgb.green * data[i + 1])/256; // green
    data[i + 2] = (rgb.blue * data[i + 2])/256; // blue
  }
  ctx.putImageData(imageData, 0, 0);
  let dataUrl = canvas.toDataURL();
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}