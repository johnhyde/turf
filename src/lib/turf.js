import { vec2, minV, maxV, uuidv4, dirs, vecToStr, jClone } from 'lib/utils';

export function generateHusk(formId, variation = 0) {
  return {
    formId,
    variation,
    offset: vec2(),
    collidable: null,
    effects: {},
  };
}
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

export function fillEmptySpace(turf, formId) {
  const form = turf?.skye?.[formId];
  if (!form) return;
  if (form.type !== 'tile') return;

  for (let x = 0; x < turf.size.x; x++) {
    for (let y = 0; y < turf.size.y; y++) {
      const tile = generateHusk(formId, 0);
      const pos = vecToStr(vec2(x, y).add(vec2(turf.offset)));
      if (!turf.spaces[pos]) {
        turf.spaces[pos] = {
          tile,
          shades: [],
        }
      } else if (!turf.spaces[pos].tile) {
        turf.spaces[pos].tile = tile;
      }
    }
  }
}

export function getForm(turf, formId) {
  return turf.skye[formId];
}

export function getShade(turf, shadeId) {
  const shade = turf.cave[shadeId];
  if (!shade) return null;
  return shade
}

export function getShadeWithForm(turf, shadeId) {
  const shade = getShade(turf, shadeId);
  if (!shade) return null;
  const form = getForm(turf, shade.formId);
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
  const form = getForm(turf, tile.formId);
  if (!form) return null;
  return {
    ...tile,
    pos,
    form,
  };
}

export function getHusk(turf, huskId) {
  if (typeof huskId == 'number') {
    return getShade(turf, huskId);
  }
  return getTile(turf, huskId);
}

export function getHuskWithForm(turf, huskId) {
  if (typeof huskId == 'number') {
    return getShadeWithForm(turf, huskId);
  }
  return getTileWithForm(turf, huskId);
}

export function getShadesAtPos(turf, pos) {
  const shades = getSpace(turf, pos)?.shades;
  if (!shades) return [];
  return shades.map(sid => getShadeWithForm(turf, sid)).filter(shade => shade);
}

export function getThingsAtPos(turf, pos) {
  const tile = getTileWithForm(turf, pos);
  const shades = getShadesAtPos(turf, pos);
  if (tile) return [tile, ...shades];
  return shades;
}

export function getShadesAtPosByFormId(turf, pos, formId) {
  return getShadesAtPos(turf, pos).filter(shade => shade.formId === formId);
}

export function getShadesAtPosByType(turf, pos, type) {
  return getShadesAtPos(turf, pos).filter(shade => shade.form.type === type);
}

export function getWallsAtPos(turf, pos, formId) {
  if (formId) return getShadesAtPosByFormId(turf, pos, formId);
  return getShadesAtPosByType(turf, pos, 'wall');
}

export function getWallVariationAtPos(turf, pos, orFlags = 0, andFlags = 15, formId) {
  const down = getWallsAtPos(turf, vec2(pos).add(vec2(0, 1)), formId);
  const right = getWallsAtPos(turf, vec2(pos).add(vec2(1, 0)), formId);
  const up = getWallsAtPos(turf, vec2(pos).add(vec2(0, -1)), formId);
  const left = getWallsAtPos(turf, vec2(pos).add(vec2(-1, 0)), formId);
  // set flag to one if length > 0
  const d = +!!down.length;
  const r = +!!right.length;
  const u = +!!up.length;
  const l = +!!left.length;
  const flags = ((d + (r * 2) + (u * 4) + (l * 8)) | orFlags) & andFlags;
  return [0, 1, 2, 7, 3, 5, 8, 11, 4, 10, 6, 14, 9, 13, 12, 15][flags];
}

export function getPortalByShadeId(turf, shadeId) {
  if (shadeId === undefined) return null;
  return Object.values(turf.portals).find((portal) => {
    if (portal.shadeId == shadeId) return true;
  });
}

export function getTownHost(turf) {
  const shadeId = turf.lunk?.shadeId;
  if (shadeId === undefined) return null;
  const portal = getPortalByShadeId(turf, shadeId);
  return portal?.for?.ship || null;
}

export function isLunkApproved(turf) {
  return turf.lunk?.approved === true;
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

export function getEffectsByHusk(turf, shade) {
  const form = getForm(turf, shade.formId);
  return getEffectsByThing({
    ...shade,
    form,
  });
}

export function getEffectsByThing(thing) {
  if (!thing.form) return {
    fullFx: thing.effects,
    huskFx: thing.effects,
    formFx: {},
  };
  const formFx = Object.assign({}, thing.form.seeds, thing.form.effects);
  const fullFx = Object.assign({}, formFx, thing.effects);
  return {
    fullFx,
    huskFx: thing.effects,
    formFx,
  };
}

export function delShade(turf, shadeId) {
  const shade = getShade(turf, shadeId);
  if (shade) {
    delShadeFromSpace(turf, shadeId, shade.pos)
    delete turf.cave[shadeId];
  }
}

export function delShadeFromSpace(turf, shadeId, pos) {
  jabBySpaces(turf, pos, (space) => {
    space.shades = space.shades.filter((id) => id !== Number(shadeId));
  });
}

export function delPortal(turf, portalId) {
  delete turf.portals[portalId];
}

export function burnBridge(turf, portalId) {
  const portal = turf.portals[portalId];
  if (portal?.shadeId) {
    delShade(turf, portal.shadeId);
  }
  delPortal(turf, portalId);
}

export function extractSkyeSprites(turfId, skye) {
  const sprites = {};
  Object.entries(skye).forEach(([formId, form]) => {
      addFormSprites(turfId, sprites, form, formId);
  });
  return sprites;
}

export function extractSkyeTileSprites(turfId, skye) {
  const sprites = {};
  Object.entries(skye).forEach(([formId, form]) => {
    if (form.type === 'tile') {
      addFormSprites(turfId, sprites, form, formId);
    }
  });
  return sprites;
}

function addFormSprites(turfId, sprites, form, formId, patp, config = {}) {
  form.variations.forEach((variation, i) => {
    if (variation) {
      const name = spriteName(turfId, formId, i, patp);
      if (typeof variation.sprite === 'string') {
        sprites[name] = { sprite: variation.sprite, config };
      } else {
        sprites[name] = { sprite: variation.sprite.frames.slice(), config };
      }
    }
  });
}

function addThingSprites(turfId, sprites, thing, patp, config = {}) {
  addFormSprites(turfId, sprites, thing.form, thing.formId, patp, config)
}

export function extractPlayerSprites(turfId, players) {
  const sprites = {};
  Object.entries(players).forEach(([patp, player]) => {
    addThingSprites(turfId, sprites, player.avatar.body.thing, patp, { color: player.avatar.body.color });
    player.avatar.things.forEach((thing) => {
      addThingSprites(turfId, sprites, thing, patp);
    });
  });
  return sprites;
}

export function spriteName(turfId, id, variation, patp='') {
  // return turfId.replace(/\/(pond\/)?/g, '-') + patp + id.replace(/\//g, '-') + '_' + (variation || '0');
  return turfId.replace(/\//g, '-') + patp + id.replace(/\//g, '-') + '_' + (variation || '0');
}

export function spriteNameWithDir(turfId, id, form, dir = dir.DOWN, patp='') {
  let variation = dirs[dir];
  const len = form.variations.length;
  if (len === 3) {
    if (variation === 3) variation = 1; // left is right flipped
  } else if (len === 2) {
    if (variation === 2) return null; // don't display
  }
  variation = variation % form.variations.length;
  return spriteName(turfId, id, variation, patp);
}

export const specialFormIds = ['/portal', '/portal/house', '/gate'];
export function isSpecialFormId(formId) {
    return specialFormIds.includes(formId);
}