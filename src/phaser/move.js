const speed = 170 * factor;

// Phaser GameObject, ms delta t
// ob should have an actionQueue, tilePos
// returns whether any smooth movement was made
export function moveTheThing(ob, dt, setDir, setPos) {
  const aq = ob.actionQueue;
  //Action queue retirement here. The objects in the action queue are just grits. The code that fills the actionQueue is the event handlers, window.addEventListener lines in game.js:startPhaser. These trigger on either predicted or confirmed events. So, the point is that this is a little sneaky side-state that only applies to the presentation, to avoid additional bookkeeping requirements the presentation doesn't need.
  if (aq.length > 100) {
    aq.splice(0, aq.length - 10);
  }
  while (
    aq[0] &&
    (!aq[0].arg?.smooth)
  ) {
    const action = aq[0];
    if (action.type === 'face') {
      setDir(action.arg.dir);
    } else {
      ob.dPos = vec2(action.arg.pos).scale(tileFactor);
      setPos(ob.dPos.x, ob.dPos.y);
    }
    aq.shift();
  }
  const targetPos = () =>
    vec2(aq.length ? aq[0].arg.pos : ob.tilePos).scale(tileFactor);
  ob.dPos = ob.dPos || vec2(ob.x, ob.y);
  if (ob.dPos.equals(targetPos())) {
    aq.shift();
  }
  const tPos = targetPos();
  if (!ob.dPos.equals(tPos)) {
    const dif = vec2(tPos).subtract(ob.dPos);
    const step = speed * dt / 1000;
    if (step > dif.length()) {
      ob.dPos = vec2(tPos);
      setPos(tPos.x, tPos.y);
    } else {
      const change = dif.normalize().scale(step);
      ob.dPos.add(change);
      setPos(Math.round(ob.dPos.x), Math.round(ob.dPos.y));
    }
    return true;
  }
  return false;
}
