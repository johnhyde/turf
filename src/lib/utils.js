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
export const vec2 = (x=0, y)=> x.x == undefined ? new Vector2(x, y == undefined? x : y) : new Vector2(x.x, x.y);
window.vec2 = vec2;

export function minV(a, b) {
  return vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
}

export function maxV(a, b) {
  return vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
}

export function swapAxes(array2d) {
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