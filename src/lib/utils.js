import { decToUd, udToDec, unixToDa } from '@urbit/api';
import { hex2patp, patp, patp2hex } from 'urbit-ob';
import { createRenderEffect, createSignal } from 'solid-js';
import { decompressFrames, parseGIF } from 'gifuct-js';

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
// export const vec2 = (x = 0, y) =>
//   x.x == undefined
//     ? new Vector2(Number(x), y == undefined ? Number(x) : Number(y))
//     : new Vector2(Number(x.x), Number(x.y));
export const vec2 = (...args) => {
  const v = new Vector2(...args);
  if (typeof v.x === 'string' || typeof v.y === 'string') {
    console.error('there should not be astring in a vec2!');
  }
  return v;
};
// export const vec2 = (...args) => new Vector2(...args);
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

export function equalsV(a, b) {
  a = vec2(a);
  b = vec2(b);
  return a.x === b.x && a.y === b.y;
}

export function swapAxes(array2d) {
  if (!array2d || array2d.length === 0) return [];
  return array2d[0].map((_, colIndex) => array2d.map((row) => row[colIndex]));
}

export function flattenGrid(array2d) {
  return swapAxes(array2d).flat();
}

export function near(a, b, epsilon = 1e-2) {
  return Math.abs(a - b) <= epsilon;
}

export function nearestPow2(x) {
  return Math.pow(2, Math.round(Math.log(x) / 0.6931471805599453)); // 0.693... being Math.log(2)
}

export function pixelsToTiles(pixels, tileSize = 32) {
  pixels = vec2(pixels);
  return vec2(
    Math.floor(pixels.x / (factor * tileSize)),
    Math.floor(pixels.y / (factor * tileSize)),
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
};

export function getDirFromVec(v) {
  let dir = dirs.DOWN;
  if (v.y < 0) dir = dirs.UP;
  if (v.y > 0) dir = dirs.DOWN;
  if (v.x < 0) dir = dirs.LEFT;
  if (v.x > 0) dir = dirs.RIGHT;
  return dir;
}

export function shiftVInDir(v, dir) {
  return v.add(dir8ToVec(dir));
}

export function dir8ToVec(dir) {
  switch (dir) {
    case 'down':
      return vec2(0, 1);
    case 'dr':
      return vec2(1, 1);
    case 'right':
      return vec2(1, 0);
    case 'ur':
      return vec2(1, -1);
    case 'up':
      return vec2(0, -1);
    case 'ul':
      return vec2(-1, -1);
    case 'left':
      return vec2(-1, 0);
    case 'dl':
    default:
      return vec2(-1, 1);
  }
}

function ud(v) {
  return v.y > 0 ? 'down' : 'up';
}

function lr(v) {
  return v.x > 0 ? 'right' : 'left';
}

export function vecToDir8(v) {
  if (equalsV(vec2(), v)) return null;
  const xAbs = Math.abs(v.x);
  const yAbs = Math.abs(v.y);
  const ratio = Math.min(xAbs / yAbs, yAbs / xAbs);
  const diag = ratio > 0.4142135624; // tan(π/8)
  const vert = yAbs >= xAbs;
  if (diag) {
    if (v.x > 0) {
      return v.y > 0 ? 'dr' : 'ur';
    } else {
      return v.y > 0 ? 'dl' : 'ul';
    }
  } else {
    return vert ? ud(v) : lr(v);
  }
}

export function vecToDir(v, round = 'ud') {
  if (equalsV(vec2(), v)) return null;
  const xAbs = Math.abs(v.x);
  const yAbs = Math.abs(v.y);
  const diag = xAbs === yAbs;
  const vert = yAbs >= xAbs;
  if (diag) {
    return round === 'ud' ? ud(v) : lr(v);
  } else {
    return vert ? ud(v) : lr(v);
  }
}

export function roundDir8(round, dir) {
  if (round === 'ud') {
    switch (dir) {
      case 'ur':
      case 'ul':
        return 'up';
      case 'dr':
      case 'dl':
        return 'down';
      default:
        return dir;
    }
  } else {
    switch (dir) {
      case 'dr':
      case 'ur':
        return 'right';
      case 'dl':
      case 'ul':
        return 'left';
      default:
        return dir;
    }
  }
}

export function rotateDir8(a, b) {
  return intToDir8(dir8ToInt(a) + dir8ToInt(b));
}

export function rotateDir(a, b) {
  return roundDir8('ud', rotateDir8(a, b));
}

function dir8ToInt(dir) {
  return {
    down: 0,
    dr: 1,
    right: 2,
    ur: 3,
    up: 4,
    ul: 5,
    left: 6,
    dl: 7,
  }[dir] || 0;
}

function intToDir8(i) {
  return 'down dr right ur up ul left dl'.split(' ')[i % 8];
}

export function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(
        16,
      ),
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

export const defaultTextStyles = {
  fontFamily: 'monospace',
  fontSmooth: 'never',
  '--webkit-font-smoothing': 'none',
  color: 'white',
  strokeThickness: 1.5 * factor,
  stroke: 'black',
};

export function vecToStr(vec) {
  return vec.x + ',' + vec.y;
}

export function toPairs(str) {
  return str.split(', ').map((t) => t.split('  ')).map((p) => {
    if (p.length === 1) return [...p, ...p];
    return p;
  });
}

export function normalizeTermIsh(str) {
  return str.toLocaleLowerCase().replaceAll(/[^-_.~a-z0-9]+/g, '-');
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
    const newPatp = hex2patp(patp2hex(patp));
    if (patp.startsWith('~doz') && newPatp.length < patp.length) return patp;
    return newPatp;
  } catch {
    return patp;
  }
}

// Adapted from cite() in urbit/pkg/npm/api/lib/lib.ts
// to handle those rare comets which start with dozzod
export function cite(ship) {
  let patp = ship,
    shortened = '';
  if (patp === null || patp === '') {
    return null;
  }
  patp = desig(patp);
  // comet
  if (patp.length >= 35) {
    shortened = '~' + patp.slice(0, 6) + '_' + patp.slice(-6);
    return shortened;
  }
  // moon
  if (patp.length >= 20) {
    shortened = '~' + patp.slice(-13, -7) + '^' + patp.slice(-6);
    return shortened;
  }
  return `~${patp}`;
}

export function isValidPath(path) {
  return /^(\/[-~._0-9a-z]*)+$/.test(path);
}

export function splitPath(path) {
  return [...path.matchAll(/\/[^\/]*/g)].map((m) => m[0]);
}

export function jClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function stripPathPrefix(path) {
  return path.replace(/\/[^/]+\//, '');
}

export function turfIdToPath(turfId) {
  return '/pond/' + turfIdToName(turfId);
}

export function turfIdToName(turfId) {
  return turfId.ship + (turfId.path !== '/' ? turfId.path : '');
}

export function pathToTurfId(path) {
  const parts = path.split('/');
  return {
    ship: parts[2],
    path: '/' + parts.slice(3).join('/'),
  };
}

export function truncateString(str, maxLength) {
  if (str.length > maxLength) {
    const truncated = str.slice(0, maxLength - 3);
    return truncated + '...';
  }
  return str;
}

export function getDateString(date, short = true) {
  const today = new Date();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = (hours > 11 && hours !== 24) ? 'pm' : 'am';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const time = `${hours}:${minutes}${ampm}`;
  if (
    short &&
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return time;
  } else {
    // const year = date.getFullYear().toString().slice(2);
    const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    // return `${time} ${day}.${month}.${year}`;
    return `${time} ${month} ${day}`;
  }
}

export function getTimeString(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

/** Random global functions
 *  @namespace Random */

/** Returns a random value between the two values passed in
 *  @param {Number} [valueA=1]
 *  @param {Number} [valueB=0]
 *  @return {Number}
 *  @memberof Random */
export const rand = (a = 1, b = 0) => b + (a - b) * Math.random();

/** Returns a floored random value the two values passed in
 *  @param {Number} [valueA=1]
 *  @param {Number} [valueB=0]
 *  @return {Number}
 *  @memberof Random */
export const randInt = (a = 1, b = 0) => rand(a, b) | 0;

/** Randomly returns either -1 or 1
 *  @return {Number}
 *  @memberof Random */
export const randSign = () => (rand(2) | 0) * 2 - 1;

/** Returns a random Vector2 within a circular shape
 *  @param {Number} [radius=1]
 *  @param {Number} [minRadius=0]
 *  @return {Vector2}
 *  @memberof Random */
export const randInCircle = (radius = 1, minRadius = 0) =>
  radius > 0
    ? randVector(radius * rand(minRadius / radius, 1) ** .5)
    : new Vector2();

/** Returns a random Vector2 with the passed in length
 *  @param {Number} [length=1]
 *  @return {Vector2}
 *  @memberof Random */
export const randVector = (length = 1) =>
  new Vector2(length, 0).rotate(rand(2 * PI));

/** Returns a random color between the two passed in colors, combine components if linear
 *  @param {Color}   [colorA=new Color(1,1,1,1)]
 *  @param {Color}   [colorB=new Color(0,0,0,1)]
 *  @param {Boolean} [linear]
 *  @return {Color}
 *  @memberof Random */
// export const randColor = (cA = new Color, cB = new Color(0,0,0,1), linear)=>
//     linear ? cA.lerp(cB, rand()) : new Color(rand(cA.r,cB.r),rand(cA.g,cB.g),rand(cA.b,cB.b),rand(cA.a,cB.a));

export const randBrightColorInt = () => {
  const primary = randInt(256, 220);
  let secondary = randInt(256, 0);
  const tertiary = Math.floor(Math.random() * secondary);
  secondary -= tertiary;
  let rgb = [primary, secondary, tertiary];
  if (Math.random() > 0.5) rgb.reverse();
  const moves = randInt(3, 0);
  for (let i = 0; i < moves; i++) {
    rgb = [rgb[1], rgb[2], rgb[0]];
  }
  return (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
};

export const randBrightColor = () => {
  return intToHex(randBrightColorInt(minBrightness));
};

/** The seed used by the randSeeded function, should not be 0
 *  @memberof Random */
let randSeed = 1;

/** Returns a seeded random value between the two values passed in using randSeed
 *  @param {Number} [valueA=1]
 *  @param {Number} [valueB=0]
 *  @return {Number}
 *  @memberof Random */
export const randSeeded = (a = 1, b = 0) => {
  randSeed ^= randSeed << 13;
  randSeed ^= randSeed >>> 17;
  randSeed ^= randSeed << 5; // xorshift
  return b + (a - b) * abs(randSeed % 1e9) / 1e9;
};

export const Random = {
  rand,
  randInt,
  randSign,
  randInCircle,
  randVector,
  // randColor,
  randSeeded,
};

function calcMaxHeight(n, r, v, a) {
  const c = Math.ceil(n / r);
  const mw1 = a / c;
  const mh1 = mw1 / v;
  const mh2 = 1 / r;
  return Math.min(mh1, mh2);
}

function testRig(n, v, a) {
  const tests = [];
  for (let i = 1; i < 100; i++) {
    tests.push([i, calcMaxHeight(n, i, v, a)]);
  }
  return tests;
}
export function calcRowsColsRig(n, v, a) {
  const tests = testRig(n, v, a);
  let [rows, biggest] = tests[0];
  tests.forEach(([r, h]) => {
    if (h > biggest) {
      biggest = h;
      rows = r;
    }
  });
  const cols = Math.ceil(n / rows);
  console.log('just calculated rows and cols', rows, cols);
  return [rows, cols, biggest];
}

export function calcCellDims(n, v, aw, ah, gap = 0) {
  if (aw === 0) {
    return vec2(ah * v, ah);
  }
  if (ah === 0) {
    return vec2(aw, aw / v);
  }
  const [rows, cols, maxHeight] = calcRowsColsRig(n, v, aw / ah);
  let gapW = gap * ((cols - 1) / cols);
  const gapH = Math.max(gap * ((rows - 1) / rows), gapW / v);
  gapW = gapH * v;
  return vec2((v * maxHeight * ah) - gapW, (maxHeight * ah) - gapH);
}

export function bind(el, accessor) {
  const [v, set] = accessor();
  el.addEventListener('input', (e) => set(e.currentTarget.value));
  createRenderEffect(() => {
    el.value = v();
  });
}

export function bindNum(el, accessor) {
  const [v, set] = accessor();
  bind(el, () => [v, (s) => {
    console.log('just got num');
    if (s === '') return;
    const n = Number(s);
    if (isNaN(n)) return;
    set(n);
  }]);
  console.log('just bound');
}

export function autofocus(el, _) {
  if (el.offsetHeight) {
    el.focus();
  } else {
    setTimeout(() => autofocus(el), 10);
  }
}

export function input(el, callbacks) {
  function blur() {
    el.blur();
  }
  el.addEventListener('focus', (e) => {
    if (game.input.keyboard.enabled) {
      game.input.keyboard.enabled = false;
      game.canvas.addEventListener('click', blur);
      const { onFocus } = callbacks();
      if (onFocus) onFocus(e);
      el.addEventListener('blur', (e) => {
        game.input.keyboard.enabled = true;
        game.canvas.removeEventListener('click', blur);
        const { onBlur } = callbacks();
        if (onBlur) onBlur(e);
      }, { once: true });
    }
  });
  el.addEventListener('keydown', (e) => {
    const { onSubmit, dontEscape } = callbacks();
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(e);
      blur();
      e.stopPropagation();
    }
    if (e.key === 'Escape' && !dontEscape) {
      blur();
      e.stopPropagation();
    }
  });
}

export function createNow(interval) {
  const [now, $now] = createSignal(Date.now());
  setInterval(() => $now(Date.now()), interval);
  return now;
}
export const now5 = createNow(5000);

export function isTextInputFocused() {
  return document.activeElement.tagName == 'TEXTAREA' ||
    document.activeElement.tagName == 'INPUT';
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', {
  willReadFrequently: true,
});

export function makeImage(url) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();
      image.crossOrigin = 'Anonymous';
      image.onload = async () => {
        let bitmap;
        try {
          bitmap = await createImageBitmap(image);
        } catch (e) {
          reject(e);
        } finally {
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
        }
      };
      image.onerror = reject;
      image.src = url;
    } catch (e) {
      reject(e);
    }
  });
}

export function makeImageFromArray(arr, width, height) {
  canvas.width = width;
  canvas.height = height;

  const idata = ctx.createImageData(width, height);
  idata.data.set(arr);
  ctx.putImageData(idata, 0, 0);
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let dataUrl = canvas.toDataURL();
  const image = new Image();
  image.src = dataUrl;
  return {
    image,
    canvas,
    imageData,
    dataUrl,
  };
}

const gifCanvas = document.createElement('canvas');
const gifCtx = gifCanvas.getContext('2d', {
  willReadFrequently: true,
});
export function convertGifFramesToDataUrls(frames) {
  gifCanvas.width = frames[0].dims.width;
  gifCanvas.height = frames[0].dims.height;
  gifCtx.clearRect(0, 0, gifCanvas.width, gifCanvas.height);
  const urls = [];
  for (const frame of frames) {
    const imageData =
      makeImageFromArray(frame.patch, frame.dims.width, frame.dims.height)
        .imageData;
    gifCtx.drawImage(canvas, frame.dims.left, frame.dims.top);
    urls.push(gifCanvas.toDataURL());
    if (frame.disposalType === 2) {
      gifCtx.clearRect(
        frame.dims.left,
        frame.dims.top,
        frame.dims.width,
        frame.dims.height,
      );
    }
  }
  return urls;
}

export async function processImageFiles(files) {
  files = [...files]; // convert weird FilesList to array
  const results = await Promise.all(files.map((file) => {
    if (!file.type.startsWith('image/')) {
      console.log('file not an image: ', file.type);
      return [null, 'file not an image'];
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onError = () => {
        console.log('could not import image: ', file.name);
        resolve([null, 'could not import image: ' + file.name]);
      };
      if (file.type === 'image/gif') {
        reader.onload = async (e) => {
          const gif = parseGIF(e.target.result);
          const frames = convertGifFramesToDataUrls(
            decompressFrames(gif, true),
          );
          resolve([frames, null]);
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = async (e) => {
          const dataUrl = e.target.result;
          try {
            await makeImage(dataUrl);
            resolve([dataUrl, null]);
          } catch {
            e.target.onError();
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }));
  const frames = results.map((r) => r[0]).filter((e) => e);
  const errors = results.map((r) => r[1]).filter((e) => e);
  return [frames, errors];
}

export function tintImage(image, color) {
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(tintImageData(imageData, color), 0, 0);
  const dataUrl = canvas.toDataURL();
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      // console.log('finished loading tinted image');
      resolve(image);
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}

export function tintImageData(imgData, color) {
  const rgb = intToRGB(color);
  const data = imgData.data;
  const newImgData = ctx.createImageData(imgData);
  const newData = newImgData.data;
  for (let i = 0; i < data.length; i += 4) {
    newData[i] = (rgb.red * data[i]) / 256; // red
    newData[i + 1] = (rgb.green * data[i + 1]) / 256; // green
    newData[i + 2] = (rgb.blue * data[i + 2]) / 256; // blue
    newData[i + 3] = data[i + 3]; // copy alpha
  }
  return newImgData;
}
