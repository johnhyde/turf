import {
  dirs,
  floorV,
  intToHex,
  jClone,
  maxV,
  minV,
  pathToTurfId,
  uuidv4,
  vec2,
  vecToStr,
} from 'lib/utils';

export function isSpaceFormType(formType) {
  return ['tile', 'item', 'wall'].includes(formType);
}

export function generateHusk(formId, variation = 0) {
  return {
    formId,
    variation,
    offset: vec2(),
    collidable: null,
    fx: null,
  };
}

export function getHost(turf) {
  const id = pathToTurfId(turf.id);
  return id.ship;
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

  for (let y = 0; y < turf.size.y; y++) {
    for (let x = 0; x < turf.size.x; x++) {
      const pos = vec2(x, y).add(vec2(turf.offset));
      const posStr = vecToStr(pos);
      if (turf.spaces[posStr]?.tile) continue;
      const tile = generateHusk(formId, 0);
      tile.pos = pos;
      if (!turf.spaces[posStr]) {
        turf.spaces[posStr] = {
          tile: turf.stuffCounter,
          shades: [],
        };
      } else {
        turf.spaces[posStr].tile = turf.stuffCounter;
      }
      turf.cave[turf.stuffCounter] = tile;
      turf.stuffCounter++;
    }
  }
}

export function getEntryPos(turf) {
  const gate = getShade(turf, turf.gate);
  if (gate == null) {
    return vec2(turf.offset).add(floorV(vec2(turf.size).divide(vec2(2))));
  } else {
    return gate.pos;
  }
}

export function getForm(turf, formId) {
  return turf.skye[formId];
}

export function getShade(turf, shadeId) {
  const shade = turf.cave[shadeId];
  if (!shade) return null;
  return shade;
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

export function getTileId(turf, pos) {
  const id = getSpace(turf, pos)?.tile;
  if (id == null) return null;
  return id;
}

export function getTile(turf, pos) {
  const id = getSpace(turf, pos)?.tile;
  if (id == null) return null;
  return getShade(turf, id);
}

export function getTileWithForm(turf, pos) {
  const tileId = getTileId(turf, pos);
  if (tileId == null) return null;
  return getShadeWithForm(turf, tileId);
}

export function getThingsAtPos(turf, pos) {
  const space = getSpace(turf, pos);
  let shades = space?.shades || [];
  if (space?.tile != null) shades = [...shades, space.tile];
  return shades.map((sid) => getShadeWithForm(turf, sid))
    .filter((shade) => shade);
}

export function getThingsAtPosByFormId(turf, pos, formId) {
  return getThingsAtPos(turf, pos).filter((shade) => shade.formId === formId);
}

export function getThingsAtPosByType(turf, pos, type) {
  return getThingsAtPos(turf, pos).filter((shade) => shade.form.type === type);
}

export function getWallsAtPos(turf, pos, formId) {
  if (formId) return getThingsAtPosByFormId(turf, pos, formId);
  return getThingsAtPosByType(turf, pos, 'wall');
}

export function getWallVariationAtPos(
  turf,
  pos,
  orFlags = 0,
  andFlags = 15,
  formId,
) {
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

export function getIndexDepthMod(turf, shadeId, pos) {
  const siblings = getSpace(turf, pos)?.shades || []; // tile depth mod = 0
  const i = siblings.findIndex((s) => Number(s) === Number(shadeId));
  if (i === -1) return 0;
  const index = siblings.length - i; // reverse since bottom/first is most recent
  return index / 1000;
}

export function getPerm(turf, ship) {
  const host = getHost(turf);
  if (host === ship) return 'admin';
  return turf.perms.except[ship] || turf.perms.default;
}

export function hasPerm(turf, ship, perm) {
  return getPerm(turf, ship).length >= perm.length;
}

export function isThingCollidable(thing) {
  return !!(thing.collidable ?? thing.form.collidable);
}

export function getCollision(turf, pos) {
  const things = getThingsAtPos(turf, pos);
  return things.some(isThingCollidable);
}

export function delShade(turf, shadeId) {
  const shade = getShade(turf, shadeId);
  if (shade) {
    delShadeFromSpace(turf, shadeId, shade.pos);
    delete turf.cave[shadeId];
  }
}

export function delShadeFromSpace(turf, shadeId, pos) {
  jabBySpaces(turf, pos, (space) => {
    space.shades = space.shades.filter((id) => id !== Number(shadeId));
    if (space.tile == shadeId) space.tile = null;
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

function addFormSprites(turfId, sprites, form, formId, patp, config = {}) {
  form.variations.forEach((variation, i) => {
    if (variation) {
      const name = spriteName(turfId, formId, i, patp);
      const colorConfig = variation.tint == null
        ? {}
        : { color: variation.tint };
      const newConfig = {
        ...colorConfig,
        ...config,
      };
      if (typeof variation.sprite === 'string') {
        sprites[name] = { sprite: variation.sprite, config: newConfig };
      } else {
        sprites[name] = {
          sprite: variation.sprite.frames.slice(),
          config: newConfig,
        };
      }
    }
  });
}

function addThingSprites(turfId, sprites, thing, patp, config = {}) {
  addFormSprites(turfId, sprites, thing.form, thing.formId, patp, config);
}

export function extractPlayerSprites(turfId, players) {
  const sprites = {};
  Object.entries(players).forEach(([patp, player]) => {
    addThingSprites(turfId, sprites, player.avatar.body.thing, patp, {
      color: player.avatar.body.color,
    });
    player.avatar.things.forEach((thing) => {
      addThingSprites(turfId, sprites, thing, patp);
    });
  });
  return sprites;
}

export function spriteName(turfId, id, variation, patp = '') {
  // return turfId.replace(/\/(pond\/)?/g, '-') + patp + id.replace(/\//g, '-') + '_' + (variation || '0');
  return turfId.replace(/\//g, '-') + patp + id.replace(/\//g, '-') + '_' +
    (variation || '0');
}

export function spriteNameWithDir(
  turfId,
  id,
  form,
  dir = dirs.DOWN,
  patp = '',
) {
  const variation = pickVariationWithDir(form, dir);
  if (variation === null) return null;
  return spriteName(turfId, id, variation, patp);
}

export function pickVariationWithDir(form, dir = dirs.DOWN) {
  let variation = dirs[dir];
  const len = form.variations.length;
  if (len === 3) {
    if (variation === 3) variation = 1; // left is right flipped
  } else if (len === 2) {
    if (variation === 2) return null; // don't display
  }
  return variation % form.variations.length;
}

export function pickVariationWithIndex(form, i) {
  return pickVariationWithDir(form, dirs[i % 4]);
}

export function getVariationWithDir(form, dir = dirs.DOWN) {
  return form.variations[pickVariationWithDir(form, dir)];
}

export function getVariationWithIndex(form, i) {
  return form.variations[pickVariationWithIndex(form, i)];
}

export const specialFormIds = ['/portal', '/portal/house', '/gate'];
export function isSpecialFormId(formId) {
  return specialFormIds.includes(formId);
}

export function getSpriteTiming(sprite, defaultTiming = 1000 / 7) {
  const timing = sprite?.timing?.[0];
  return timing || defaultTiming;
}

export function getSpriteFps(sprite, defaultFps = 7) {
  const timing = sprite?.timing?.[0];
  return timing ? 1000 / timing : defaultFps;
}
