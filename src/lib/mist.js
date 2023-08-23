import { createMemo } from "solid-js";
import { produce } from "solid-js/store";
import cloneDeep from 'lodash/cloneDeep';
import * as api from 'lib/api.js';
import { vec2, vecToStr, jClone } from 'lib/utils';
import { getPool } from 'lib/pool';

export class Mist { // we use a class so we can put it inside a store without getting proxied
  constructor(id, options = {}) {
    this.id = id;
    const wash = (update, grits) => {
      update((mist) => {
        if (!mist?.id) return { ...mist, id };
        return mist;
      });
      washMist(update, grits);
    }
    const hydrate = (rock) => {
      if (rock) rock.id = id;
      return js.mist(rock);
    }
    const apiSendWave = (...args) => {
      api.sendMistWave(id, ...args);
    };
    this._ = getPool(wash, hydrate, apiSendWave, filters);
    this.$ = this._.$;

    this.subscribe();
  }

  get mist() {
    return this._.real;
  }

  get pulses() {
    return this._.pulses;
  }

  get charges() {
    return this._.charges;
  }

  get ether() {
    return this._.fake;
  }

  // returns true/false whether we attempted to send the wave or not
  // returns false if stir was judged to be unworthy (e.g. placing a duplicate item)
  sendWave(type, arg, batch = true) {
    this._.sendWave(type, arg, batch);
  }

  subscribe() {
    const onMistErr = () => {};
    const onMistQuit = () => {};
    api.subscribeToMist(this.id, this._.onRes.bind(this._), onMistErr, onMistQuit);
  }
}

const mistGrits = {
  'size-mist': (mist, arg) => {
    mist.offset = arg.offset;
    mist.size = arg.size;
    Object.values(mist.players).forEach((player) => {
      const newPos = clampToMist(mist, player.pos);
      player.pos.x = newPos.x;
      player.pos.y = newPos.y;
    });
  },
};

export function washMist(update, grits) {
  grits.forEach((grit) => {
    update(_washMist(grit));
  });
}

export function _washMist(grit) {
  grit = cloneDeep(grit);
  // console.log('washing a mist with grit', JSON.stringify(grit, null, 2))
  switch (grit.type) {
    case 'noop':
      return (mist) => mist
    case 'del-mist':
      return null;
    case 'set-mist':
      return (mist) => {
        const newMist = {
          id: mist?.id,
          ...grit.arg,
        };
        return js.mist(newMist);
      };
    default:
      return produce((mist) => {
        if (mistGrits[grit.type]) {
          mistGrits[grit.type](mist, grit.arg);
          js.mist(mist);
        } else {
          console.warn(`Could not process grit of type: ${grit.type}`);
        }
      });
  }
}

// returns false if goal is rejected
// otherwise, returns a pair of [goal, grit]
// or, more commonly, a single goal/grit
const filters = {
  'add-husk': (mist, goal) => {
    const { pos, formId } = goal.arg;
    if (!isInMist(mist, pos)) return false;
    const currentSpace = mist.spaces[vecToStr(pos)];
    const currentTile = currentSpace?.tile;
    const currentShades = (currentSpace?.shades || []).map(sid => mist.cave[sid]);
    const tileAlreadyHere = currentTile?.formId === formId;
    const shadeAlreadyHere = currentShades.some((shade) => shade.formId === formId);
    if (!tileAlreadyHere && !shadeAlreadyHere) {
      return goal;
    }
    return false;
  },
  'move': (mist, goal) => {
    const { ship, pos } = goal.arg;
    const player = mist.players[ship];
    if (!player) return false;
    const newPos = clampToMist(mist, pos);
    const playerColliding = getCollision(mist, player.pos);
    const willBeColliding = getCollision(mist, newPos);
    // if (willBeColliding && !playerColliding) return false;
    if (newPos.equals(player.pos)) return false;
    goal.arg.pos = newPos;
    return goal;
  },
  'send-chat': (mist, goal) => {
    return [
      goal,
      {
        type: 'chat',
        arg: {
          from: goal.arg.from,
          at: Date.now(),
          text: goal.arg.text,
        }
      },
    ]
  },
  'create-bridge': (mist, goal) => {
    debugger;
  }
};
