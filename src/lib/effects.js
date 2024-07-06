import {
  dir8ToVec,
  equalsV,
  rotateDir,
  rotateDir8,
  roundDir8,
  vecToDir,
  vecToDir8,
} from 'lib/utils.js';
import { getShade, getShadeWithForm } from 'lib/turf.js';

export function trig(type, ...args) {
  switch (type) {
    case 'move':
      return {
        type,
        arg: {
          start: args[0],
          end: args[1],
          collide: args[2] ?? true,
          smooth: args[3] ?? true,
        },
      };
    case 'bump':
    case 'interact':
    case 'click':
      return { type, arg: null };
    case 'tell':
      return {
        type,
        arg: args[0],
      };
    // fake triggers for convenience
    case 'step': {
      const [turf, shadeId, collide, smooth] = args;
      const shade = getShade(turf, shadeId);
      const start = vec2(turf.offset);
      const end = shade?.pos || start;
      return trig('move', start, end, collide, smooth);
    }
    default:
      throw new Error('invalid trigger type: ' + type);
  }
}

export function getEffectsByShadeId(turf, shadeId, trigger, opts = {}) {
  const comp = getShadeWithForm(turf, shadeId);
  return getEffectsByComp(turf, comp, trigger, opts);
}

export function getEffectsByComp(turf, comp, trigger, opts = {}) {
  if (!comp) return [];
  const fx = comp.fx || comp.form.fx;
  return fx.filter((reflex) => {
    return matchRootCondition(reflex.root, {
      comp,
      turf,
      ship: opts.ship || our,
      trigger,
      initId: opts.initId ?? null,
    });
  }).map((reflex) => reflex.effect);
}

export function apCtx(ctx) {
  return {
    turf: ctx.turf,
    ship: ctx.ship,
    trigger: ctx.trigger,
    shadeId: ctx.comp.id,
    initId: ctx.nitId,
  };
}

export function matchRootCondition(ctx, root) {
  switch (root.type) {
    case 'or':
      return root.arg.some((rut) => matchRootCondition(ctx, rut));
    case 'and':
      if (!matchRootCondition(ctx, root.arg.root)) return false;
      return root.arg.cons.every((con) => matchCondition(ctx, con));
    case 'trigger':
      return matchTriggerCondition(ctx, root.arg);
  }
}

export function matchCondition(ctx, con) {
  const { arg } = con;
  switch (con.type) {
    case 'and':
      return arg.every((con) => matchCondition(ctx, con));
    case 'or':
      return arg.some((con) => matchCondition(ctx, con));
    case 'not':
      return !matchCondition(ctx, arg);
    case 'eq':
      return matchCondition(ctx, arg.a) === matchCondition(ctx, arg.b);
    case 'initiator':
      if (ctx.initId == null) {
        return arg === 'player';
      }
      return arg === 'item';
    case 'initiator-eq': {
      if (arg === 'initiator') return true;
      const target = absolutizeTarget(apCtx(ctx), arg);
      if (ctx.initId == null) {
        return target.type === 'player' && target.arg === ctx.ship;
      }
      return target.type === 'item' && target.arg === ctx.initId;
    }
    case 'user-eq':
      return arg === ctx.ship;
    case 'trigger':
      return matchTriggerCondition(ctx, arg);
    case 'item-exists':
      return !!resolveItemTarget(apCtx(ctx), arg);
    case 'variation': {
      const shade = resolveItemTarget(apCtx(ctx), arg.item);
      if (!shade) return false;
      return matchIntRel(arg.con, shade.variation);
    }
    case 'move-collide':
      return ctx.trigger.type === 'move' && ctx.trigger.arg.collide === arg;
    case 'move-smooth':
      return ctx.trigger.type === 'move' && ctx.trigger.arg.smooth === arg;
    case 'loc-eq': {
      const ctx = apCtx(ctx);
      return resolveFxLoc(ctx, arg.a) === resolveFxLoc(ctx, arg.b);
    }
  }
}

export function matchTriggerCondition(ton, ctx) {
  const { arg } = ton;
  if (ton.type !== ctx.trigger.type) return false;
  switch (ton.type) {
    case 'move':
      switch (arg.type) {
        case 'onto':
          return ctx.comp.pos === ctx.trigger.arg.end;
        case 'off':
          return ctx.comp.pos === ctx.trigger.arg.start;
        default:
          throw new Error('invalid move condition type: ' + arg.type);
      }
    case 'tell':
      return arg.arg === ctx.trigger.arg.msg;
    default:
      return true;
  }
}

export function matchIntRel(rel, int) {
  switch (rel.type) {
    case 'eq':
      return rel.arg === int;
    default:
      throw new Error('invalid int rel type: ' + rel.type);
  }
}

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
        dir: newFxDir8(),
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

//
// application, resolution, absolutization
//

export function applyEffect(ctx, effect) {
  const { turf, ship, shadeId } = ctx;
  switch (effect.type) {
    case 'list': {
      if (effect.arg.serial) { // true or 'atomic'
        let goals = effect.arg.effects.map((effect) => ({
          type: 'apply-effect',
          arg: {
            effect,
            shadeId,
          },
        }));
        if (effect.arg.serial === 'atomic') {
          goals = [{
            type: 'atomic',
            arg: {
              // depth: 20,
              goals,
            },
          }];
        }
        return {
          roars: [],
          goals,
        };
      } else {
        let roars = [], goals = [];
        effect.arg.effects.forEach((effect) => {
          const res = applyEffect(ctx, effect);
          roars = [...roars, ...res.roars];
          goals = [...goals, ...res.goals];
        });
        return { roars, goals };
      }
    }
    case 'port': {
      const portal = turf.portals[effect.arg];
      if (!portal || !portal.at) return { roars: [], goals: [] };
      return {
        roars: [],
        goals: [{
          type: 'add-port-offer',
          arg: { ship, from: effect.arg },
        }],
      };
    }
    case 'jump': {
      return {
        roars: [],
        goals: [{
          type: 'tele',
          arg: { ship, pos: effect.arg },
        }],
      };
    }
    case 'swap': {
      return {
        roars: [],
        goals: [{
          type: 'set-shade-form-id',
          arg: {
            shadeId,
            formId: effect.arg,
          },
        }],
      };
    }
    case 'vary': {
      return {
        roars: [],
        goals: [{
          type: 'set-shade-var',
          arg: {
            shadeId,
            variation: effect.arg,
          },
        }],
      };
    }
    case 'move':
    case 'tele': {
      const ctx = { turf, ship, shadeId };
      const { target, to } = effect.arg;
      const pos = resolveFxLoc(ctx, to);
      if (!pos) return { roars: [], goals: [] };
      const absTarget = absolutizeTarget(ctx, target);
      const isPlayer = absTarget.type === 'player';
      const goal = {
        type: isPlayer ? effect.type : `${effect.type}-shade`,
        arg: {
          [isPlayer ? 'ship' : 'shadeId']: absTarget.arg,
          pos,
        },
      };
      return {
        roars: [],
        goals: [goal],
      };
    }
    default: {
      return {
        roars: [{
          type: 'effect-' + effect.type,
          arg: effect.arg,
          ship,
          shadeId,
        }],
        goals: [],
      };
    }
  }
}

export function resolveFxLoc(ctx, loc) {
  switch (loc.type) {
    case 'target': {
      return resolveTargetPos(ctx, loc.arg);
    }
    case 'offset': {
      const start = resolveFxLoc(ctx, loc.arg.loc);
      if (!start) return null;
      const offset = resolveFxOffset(ctx, loc.arg.offset);
      return vec2(start).add(offset);
    }
    case 'mover-pos': {
      if (ctx.trigger.type !== 'trigger') return null;
      if (loc.arg === 'start') return ctx.trigger.arg.start;
      return ctx.trigger.arg.end;
    }
    case 'absolute': {
      return vec2(loc.arg);
    }
  }
}

export function resolveTargetPos(ctx, target) {
  const tar = resolveTarget(ctx, target);
  if (!tar) return null;
  return vec2(tar.arg.pos);
}

export function resolveTarget(ctx, target) {
  const absTarget = absolutizeTarget(ctx, target);
  if (absTarget.type === 'player') {
    const player = ctx.turf.players[absTarget.arg];
    if (!player) return null;
    return { ...absTarget, arg: player };
  } else {
    const shade = getShade(ctx.turf, absTarget.arg);
    if (!shade) return null;
    return { ...absTarget, arg: shade };
  }
}

export function resolveItemTarget(ctx, target) {
  const shadeId = absolutizeItemTarget(ctx, target);
  if (shadeId == null) return null;
  return getShade(ctx.turf, shadeId);
}

export function resolveFxOffset(ctx, offset) {
  switch (offset.type) {
    case 'relative': {
      const from = resolveFxLoc(ctx, offset.arg.from);
      if (!from) return vec2();
      const to = resolveFxLoc(ctx, offset.arg.to);
      if (!to) return vec2();
      return vec2(to).subtract(from);
    }
    case 'direction': {
      const dir = resolveFxDir8(ctx, offset.arg.dir);
      if (!dir) return vec2();
      return vec2(offset.arg.distance).multiply(dir8ToVec(dir));
    }
    case 'rotate': {
      const rot = resolveFxDir(ctx, offset.arg.rotation);
      const os = resolveFxOffset(ctx, offset.arg.offset);
      if (!rot) return os;
      switch (rot) {
        case 'down':
          return os;
        case 'right':
          return vec2(os.y, -os.x);
        case 'up':
          return os.multiply(vec2(-1));
        case 'left':
          return vec2(-os.y, os.x);
      }
      break; // stupid linter can tell that this is unreachable, but not that the case doesn't fall through
    }
    case 'flip-x': {
      const os = resolveFxOffset(ctx, offset.arg);
      return vec2(-os.x, os.y);
    }
    case 'flip-y': {
      const os = resolveFxOffset(ctx, offset.arg);
      return vec2(os.x, -os.y);
    }
    case 'combine': {
      const a = resolveFxOffset(ctx, offset.arg.a);
      const b = resolveFxOffset(ctx, offset.arg.b);
      return a.add(b);
    }
    case 'absolute': {
      return vec2(offset.arg);
    }
  }
}

export function resolveFxDir(ctx, dir) {
  const { type, arg } = dir;
  switch (type) {
    case 'face': {
      const target = resolveTarget(ctx, arg);
      if (!target) return null;
      if (target.type === 'item') return null;
      return target.arg.dir;
    }
    case 'relative': {
      const { round, from, to } = arg;
      const os = resolveFxOffset(ctx, {
        type: 'relative',
        arg: { from, to },
      });
      return vecToDir(os, round);
    }
    case 'round': {
      const dir8 = resolveFxDir8(ctx, arg.dir);
      if (!dir8) return null;
      return roundDir8(arg.round, dir8);
    }
    case 'rotate': {
      const a = resolveFxDir(ctx, arg.a);
      if (!a) return null;
      const b = resolveFxDir(ctx, arg.b);
      if (!b) return null;
      return rotateDir(a, b);
    }
    case 'flip-x': {
      const dir = resolveFxDir(ctx, arg);
      if (!dir) return null;
      switch (dir) {
        case 'left':
          return 'right';
        case 'right':
          return 'left';
        default:
          return dir;
      }
    }
    case 'flip-y': {
      const dir = resolveFxDir(ctx, arg);
      if (!dir) return null;
      switch (dir) {
        case 'down':
          return 'up';
        case 'up':
          return 'down';
        default:
          return dir;
      }
    }
    case 'absolute': {
      return arg;
    }
  }
}

export function resolveFxDir8(ctx, dir) {
  const { type, arg } = dir;
  switch (type) {
    case 'relative-8': {
      const { from, to } = arg;
      const os = resolveFxOffset(ctx, {
        type: 'relative',
        arg: { from, to },
      });
      return vecToDir8(os);
    }
    case 'rotate-8': {
      const a = resolveFxDir8(ctx, arg.a);
      if (!a) return null;
      const b = resolveFxDir8(ctx, arg.b);
      if (!b) return null;
      return rotateDir8(a, b);
    }
    case 'flip-x-8': {
      const dir = resolveFxDir8(ctx, arg);
      if (!dir) return null;
      switch (dir) {
        case 'right':
          return 'left';
        case 'left':
          return 'right';
        case 'dr':
          return 'dl';
        case 'dl':
          return 'dr';
        case 'ur':
          return 'ul';
        case 'ul':
          return 'ur';
        default:
          return dir;
      }
    }
    case 'flip-y-8': {
      const dir = resolveFxDir8(ctx, arg);
      if (!dir) return null;
      switch (dir) {
        case 'down':
          return 'up';
        case 'up':
          return 'down';
        case 'dr':
          return 'ur';
        case 'ur':
          return 'dr';
        case 'dl':
          return 'ul';
        case 'ul':
          return 'dl';
        default:
          return dir;
      }
    }
    case 'absolute-8':
      return arg;
    default:
      return resolveFxDir(ctx, dir);
  }
}

export function absolutizeTarget(ctx, target) {
  if (target === 'initiator') {
    if (ctx.initId == null) {
      target = 'user';
    } else {
      target = {
        type: 'item',
        arg: ctx.initId,
      };
    }
  }
  if (target === 'this') {
    return {
      type: 'item',
      arg: ctx.shadeId,
    };
  } else if (target === 'user') {
    return {
      type: 'player',
      arg: ctx.ship,
    };
  } else {
    return target;
  }
}

export function absolutizeItemTarget(ctx, target) {
  if (target === 'initiator') {
    return ctx.initId ?? null;
  }
  if (target === 'this') {
    return ctx.shadeId;
  }
  // type = 'item'
  return target.arg;
}
