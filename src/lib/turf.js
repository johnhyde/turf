import { vec2, minV, maxV, uuidv4, dirs, vecToStr, jClone } from 'lib/utils';

export function jabBySpaces(turf, pos, fn) {
  const id = vecToStr(pos);
  let space = turf.spaces[id] || {};
  if (!space.shades) space.shades = [];
  fn(space);
  turf.spaces[id] = space;
  return turf.spaces[id];
}

export function getTurfBounds(turf) {
  return {
    topLeft: vec2(turf.offset),
    botRight: vec2(turf.offset).add(turf.size),
  };
}

export function clampToBounds(bounds, pos) {
  const maxPos = bounds.botRight.subtract(vec2(1));
  return minV(maxV(vec2(pos), bounds.topLeft), maxPos);
}

export function clampToTurf(turf, pos) {
  return clampToBounds(getTurfBounds(turf), pos);
}

export function isInTurf(turf, pos) {
  const bounds = getTurfBounds(turf);
  return (
    pos.x >= bounds.topLeft.x && pos.y >= bounds.topLeft.y &&
    pos.x < bounds.botRight.x && pos.y < bounds.botRight.y
  );
}

export function getShadeWithForm(turf, shadeId) {
  const shade = turf.cave[shadeId];
  if (!shade) return null;
  const form = turf.skye[shade.formId];
  if (!form) return null;
  return {
    ...shade,
    id: shadeId,
    form,
  };
}

export function getSpace(turf, pos) {
  return turf.spaces[vecToStr(pos)];
}

export function getTile(turf, pos) {
  return getSpace(turf, pos)?.tile;
}

export function getTileWithForm(turf, pos) {
  const tile = getTile(turf, pos);
  if (!tile) return null;
  const form = turf.skye[tile.formId];
  if (!form) return null;
  return {
    ...tile,
    pos,
    form,
  };
}

export function getShadesAtPos(turf, pos) {
  const shades = getSpace(turf, pos)?.shades;
  if (!shades) return [];
  return shades.map(sid => getShadeWithForm(turf, sid));
}

export function getShadesAtPosByType(turf, pos, type) {
  return getShadesAtPos(turf, pos).filter(shade => shade.form.type === type);
}

export function getWallsAtPos(turf, pos) {
  return getShadesAtPosByType(turf, pos, 'wall');
}

export function getWallVariationAtPos(turf, pos, orFlags = 0, andFlags = 15) {
  const down = getWallsAtPos(turf, vec2(pos).add(vec2(0, 1)));
  const right = getWallsAtPos(turf, vec2(pos).add(vec2(1, 0)));
  const up = getWallsAtPos(turf, vec2(pos).add(vec2(0, -1)));
  const left = getWallsAtPos(turf, vec2(pos).add(vec2(-1, 0)));
  // set flag to one if length > 0
  const d = +!!down.length;
  const r = +!!right.length;
  const u = +!!up.length;
  const l = +!!left.length;
  const flags = ((d + (r * 2) + (u * 4) + (l * 8)) | orFlags) & andFlags;
  return [0, 1, 2, 7, 3, 5, 8, 11, 4, 10, 6, 14, 9, 13, 12, 15][flags];
}

export function isHuskCollidable(husk) {
  return !!(husk.collidable || husk.form.collidable);
}

export function getCollision(turf, pos) {
  const tile = getTileWithForm(turf, pos);
  if (tile && isHuskCollidable(tile)) return true;
  const shades = getShadesAtPos(turf, pos);
  return shades.some(isHuskCollidable);
}

export function extractSkyeSprites(skye) {
  const sprites = {};
  Object.entries(skye).forEach(([formId, form]) => {
    form.variations.forEach((variation, i) => {
      if (variation) {
        sprites[spriteName(formId, i)] = variation.sprite;
      }
    });
  });
  return sprites;
}

function addThingSprites(sprites, thing, patp) {
  thing.form.variations.forEach((variation, i) => {
    if (variation) {
      sprites[spriteName(thing.formId, i, patp)] = variation.sprite;
    }
  });
}

export function extractPlayerSprites(players) {
  const sprites = {};
  Object.entries(players).forEach(([patp, player]) => {
    addThingSprites(sprites, player.avatar.body.thing, patp);
    player.avatar.things.forEach((thing) => {
      addThingSprites(sprites, thing, patp);
    });
  });
  return sprites;
}

export function spriteName(id, variation, patp='') {
  return patp + id.replace(/\//g, '-') + '_' + (variation || '0');
}

export function spriteNameWithDir(id, form, dir = dir.DOWN, patp='') {
  let variation = dirs[dir];
  const len = form.variations.length;
  if (len === 3) {
    if (variation === 3) variation = 1; // left is right flipped
  } else if (len === 2) {
    if (variation === 2) return null; // don't display
  }
  variation = variation % form.variations.length;
  return spriteName(id, variation, patp);
}