import { Vector2d } from 'melonjs';

/** 
 * Create a 2d vector, can take another Vector2d to copy, 2 scalars, or 1 scalar
 * @param {Number} [x=0]
 * @param {Number} [y=0]
 * @return {Vector2d}
 * @example
 * let a = vec2(0, 1); // vector with coordinates (0, 1)
 * let b = vec2(a);    // copy a into b
 * a = vec2(5);        // set a to (5, 5)
 * b = vec2();         // set b to (0, 0)
 * @memberof Utilities
 */
export const vec2 = (x=0, y)=> x.x == undefined ? new Vector2d(x, y == undefined? x : y) : new Vector2d(x.x, x.y);


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

/** Returns a random Vector2d within a circular shape
 *  @param {Number} [radius=1]
 *  @param {Number} [minRadius=0]
 *  @return {Vector2d}
 *  @memberof Random */
export const randInCircle = (radius=1, minRadius=0)=> radius > 0 ? randVector(radius * rand(minRadius / radius, 1)**.5) : new Vector2d;

/** Returns a random Vector2d with the passed in length
 *  @param {Number} [length=1]
 *  @return {Vector2d}
 *  @memberof Random */
export const randVector = (length=1)=> new Vector2d(length, 0).rotate(rand(2*PI));

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