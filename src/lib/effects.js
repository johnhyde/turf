import {
  dir8ToVec,
  equalsV,
  jClone,
  rotateDir,
  rotateDir8,
  roundDir8,
  vecToDir,
  vecToDir8,
} from 'lib/utils.js';
import {
  getShade,
  getShadeWithForm,
  getSpace,
  isThingCollidable,
} from 'lib/turf.js';

export function getEffectsByShadeId(turf, shadeId, trigger, opts = {}) {
  const comp = getShadeWithForm(turf, shadeId);
  return getEffectsByComp(turf, comp, trigger, opts);
}

export function getEffectsByComp(turf, comp, trigger, opts = {}) {
  if (!comp) return [];
  const fx = comp.fx || comp.form.fx;
  return fx.filter((reflex) => {
    return matchRootCondition({
      comp,
      turf,
      ship: opts.ship || our,
      trigger,
      initId: opts.initId ?? null,
    }, reflex.root);
  }).map((reflex) => reflex.effect);
}

export function apCtx(ctx) {
  return {
    turf: ctx.turf,
    ship: ctx.ship,
    trigger: ctx.trigger,
    shadeId: ctx.comp.id,
    initId: ctx.initId,
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
      if (!target) return false;
      if (ctx.initId == null) {
        return target.type === 'player' && target.arg === ctx.ship;
      }
      return target.type === 'item' && target.arg === ctx.initId;
    }
    case 'user-eq':
      if (ctx.ship[0] !== '~') console.error(`Invalid src @p: ${ctx.ship}`);
      return arg === ctx.ship;
    case 'trigger':
      return matchTriggerCondition(ctx, arg);
    case 'item-exists':
      // if (ctx.trigger.type === 'move' && ctx.trigger.arg.start.x > 0) debugger;
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
      const ap = apCtx(ctx);
      const a = resolveFxLoc(ap, arg.a);
      const b = resolveFxLoc(ap, arg.b);
      if (!a || !b) return false;
      return equalsV(a, b);
    }
  }
}

export function matchTriggerCondition(ctx, ton) {
  const { arg } = ton;
  if (ton.type !== ctx.trigger.type) return false;
  switch (ton.type) {
    case 'bump': {
      if (ctx.comp.id === ctx.initId) return false;
      const thing = getShadeWithForm(ctx.turf, ctx.comp.id);
      if (!thing) return false;
      return isThingCollidable(thing);
    }
    case 'move': {
      const isSelf = ctx.comp.id === ctx.initId;
      if (arg.type === 'self') return isSelf;
      if (isSelf) return false;
      switch (arg.type) {
        case 'onto':
          return equalsV(ctx.comp.pos, ctx.trigger.arg.end);
        case 'off':
          return equalsV(ctx.comp.pos, ctx.trigger.arg.start);
        default:
          throw new Error('invalid move condition type: ' + arg.type);
      }
    }
    case 'tell':
      return arg.arg === ctx.trigger.arg;
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

// generators

export function trig(type, ...args) {
  switch (type) {
    case 'move':
      return {
        type,
        arg: {
          start: vec2(args[0]),
          end: vec2(args[1]),
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
      const shade = turf ? getShade(turf, shadeId) : null;
      const start = turf ? vec2(turf.offset) : null;
      const end = shade?.pos || start;
      return trig('move', start, end, collide, smooth);
    }
    default:
      throw new Error('invalid trigger type: ' + type);
      // return { type: '', arg: null };
  }
}
export function newFxTriggerCondition(type, ...args) {
  switch (type) {
    case 'move':
      return {
        type,
        arg: { type: args[0] || 'onto', arg: null },
      };
    case 'bump':
    case 'interact':
    case 'click':
      return { type, arg: null };
    case 'tell':
      return {
        type,
        arg: { type: 'eq', arg: args[0] ?? null },
      };
    // fake trigger conditionss for convenience
    case 'step':
      return newFxTriggerCondition('move', 'onto');
    case 'leave':
      return newFxTriggerCondition('move', 'off');
    case 'moved':
      return newFxTriggerCondition('move', 'self');
    default:
      // throw new Error('invalid trigger type: ' + type);
      return { type: '', arg: null };
  }
}

export function newReflex() {
  return {
    root: { type: '', arg: null },
    effect: newEffect(),
  };
}

export function newFxRootCondition(type, root) {
  if (root) root = jClone(root);
  switch (type) {
    case 'or':
      return {
        type,
        arg: root ? [root, newFxRootCondition()] : [newFxRootCondition()],
      };
    case 'and':
      return {
        type,
        arg: {
          root: root ?? newFxRootCondition(),
          cons: root ? [newFxCondition()] : [],
        },
      };
    case 'trigger':
      return { type, arg: newFxTriggerCondition() };
    default:
      return { type: 'trigger', arg: newFxTriggerCondition(type) };
  }
}

export function newFxCondition(type, con) {
  if (con) con = jClone(con);
  if (!type) return { type: '', arg: null };
  switch (type) {
    case 'and':
    case 'or':
      return { type, arg: con ? [con, newFxCondition()] : [newFxCondition()] };
    case 'not':
      return { type, arg: con ?? newFxCondition() };
    case 'eq':
      return {
        type,
        arg: {
          a: newFxCondition(),
          b: newFxCondition(),
        },
      };
    case 'initiator':
      return { type, arg: 'item' };
    case 'initiator-eq':
      return { type, arg: newFxTarget() };
    case 'user-eq':
      return { type, arg: null };
    case 'trigger':
      return { type, arg: newFxTriggerCondition() };
    case 'item-exists':
      return { type, arg: newFxItemTarget() };
    case 'variation':
      return { type, arg: { item: newFxItemTarget(), con: newFxIntRel() } };
    case 'move-collide':
      return { type, arg: true };
    case 'move-smooth':
      return { type, arg: true };
    case 'loc-eq':
      return { type, arg: { a: newFxLocation(), b: newFxLocation() } };
    default:
      return { type: 'trigger', arg: newFxTriggerCondition(type) };
  }
}

export function newFxIntRel() {
  return {
    type: 'eq',
    arg: 0,
  };
}

export function newEffect() {
  return { type: 'noop', arg: null };
}

export function newEffectArg(type, turf) {
  switch (type) {
    case 'list':
      return {
        serial: 'simult',
        effects: [newEffect()],
      };
    case 'port':
      return '';
    case 'read':
      return newFxRead();
    case 'swap':
      return '/';
    case 'seem':
    case 'vary':
      return 0;
    case 'move':
      return newFxMove();
    case 'tell':
      return newFxTell();
    case 'noop':
    default:
      return null;
  }
}

export function newFxRead() {
  return {
    text: '',
    actions: [],
  };
}

export function newFxAction() {
  return {
    name: '',
    effect: newEffect(),
  };
}

export function newFxMove() {
  return {
    target: newFxTarget(),
    to: newFxLocation(),
    collide: true,
    smooth: true,
  };
}

export function newFxTell() {
  return {
    target: newFxItemTarget(),
    msg: '',
  };
}

export function newFxTarget(type = 'this') {
  switch (type) {
    case 'this':
    case 'user':
    case 'initiator':
      return type;
    case 'top-shade-at-loc':
      return {
        type,
        arg: newFxLocation(),
      };
    default: // item & player
      return {
        type,
        arg: null,
      };
  }
}
export function newFxItemTarget(type = 'this') {
  switch (type) {
    case 'this':
    case 'initiator':
      return type;
    case 'top-shade-at-loc':
      return {
        type,
        arg: newFxLocation(),
      };
    default: // item
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
    case 'mover-pos':
      return { type, arg: 'start' };
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
  const { turf, ship, trigger, shadeId, initId } = ctx;
  const defaultReturn = {
    roars: [{
      type: 'effect-' + effect.type,
      arg: effect.arg,
      ship,
      shadeId,
    }],
    goals: [],
  };
  switch (effect.type) {
    case 'list': {
      if (effect.arg.serial === 'simult') {
        let roars = [], goals = [];
        effect.arg.effects.forEach((effect) => {
          const res = applyEffect(ctx, effect);
          roars = [...roars, ...res.roars];
          goals = [...goals, ...res.goals];
        });
        return { roars, goals };
      } else {
        let goals = effect.arg.effects.map((effect) => ({
          type: 'apply-effect',
          arg: {
            effect,
            trigger,
            shadeId,
            initId,
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
    case 'read': {
      const { actions } = effect.arg;
      if (actions.length === 0) return defaultReturn;
      const reflexes = actions.map((action, i) => {
        return {
          root: {
            type: 'and',
            arg: {
              root: {
                type: 'trigger',
                arg: {
                  type: 'tell',
                  arg: { type: 'eq', arg: 'note: ' + i },
                },
              },
              cons: [{
                type: 'user-eq',
                arg: ship,
              }],
            },
          },
          effect: {
            type: 'list',
            arg: {
              serial: 'serial',
              effects: [
                {
                  type: 'tell',
                  arg: { target: 'this', msg: 'clear-note' },
                },
                action.effect,
              ],
            },
          },
        };
      });
      const clearCondition = {
        type: 'and',
        arg: {
          root: {
            type: 'trigger',
            arg: {
              type: 'tell',
              arg: { type: 'eq', arg: 'clear-note' },
            },
          },
          cons: [{
            type: 'user-eq',
            arg: ship,
          }],
        },
      };
      reflexes.unshift({
        root: clearCondition,
        effect: {
          type: 'wipe',
          arg: [jClone(clearCondition), ...reflexes.map((r) => r.root)],
        },
      });

      return {
        roars: defaultReturn.roars,
        goals: reflexes.map((reflex) => ({
          type: 'set-shade-effect',
          arg: {
            shadeId,
            trigger: reflex.root,
            effect: reflex.effect,
          },
        })),
      };
    }
    case 'wipe': {
      return {
        roars: [],
        goals: effect.arg.map((root) => ({
          type: 'set-shade-effect',
          arg: {
            shadeId,
            trigger: root,
            effect: null,
          },
        })),
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
    case 'move': {
      const { target, to, collide, smooth } = effect.arg;
      const pos = resolveFxLoc(ctx, to);
      if (!pos) return { roars: [], goals: [] };
      const absTarget = absolutizeTarget(ctx, target);
      if (!absTarget) return { roars: [], goals: [] };
      const isPlayer = absTarget.type === 'player';
      const goal = {
        type: isPlayer ? 'move' : 'move-shade',
        arg: {
          [isPlayer ? 'ship' : 'shadeId']: absTarget.arg,
          pos,
          collide,
          smooth,
        },
      };
      return {
        roars: [],
        goals: [goal],
      };
    }
    case 'tell': {
      const { target, msg } = effect.arg;
      const targetId = absolutizeItemTarget(ctx, target);
      if (targetId == null) return { roars: [], goals: [] };
      return {
        roars: [],
        goals: [{
          type: 'pull-trigger',
          arg: {
            trigger: trig('tell', msg),
            shadeId: targetId,
            initId: shadeId,
          },
        }],
      };
    }
    default: {
      return defaultReturn;
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
      if (ctx.trigger.type !== 'move') return null;
      if (loc.arg === 'start') return vec2(ctx.trigger.arg.start);
      return vec2(ctx.trigger.arg.end);
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
  if (!absTarget) return null;
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
  } else if (target.type === 'top-shade-at-loc') {
    const absTarget = absolutizeTargetAtLoc(ctx, target.arg);
    if (absTarget == null) return null;
    return {
      type: 'item',
      arg: absTarget,
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
  if (target.type === 'top-shade-at-loc') {
    return absolutizeTargetAtLoc(ctx, target.arg);
  }
  // type = 'item'
  return target.arg;
}

export function absolutizeTargetAtLoc(ctx, loc) {
  const pos = resolveFxLoc(ctx, loc);
  if (!pos) return null;
  const space = getSpace(ctx.turf, pos);
  if (!space) return null;
  if (space.shades.length) return space.shades[0];
  return space.tile; // may be null
}
