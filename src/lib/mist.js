import { createMemo, createResource } from "solid-js";
import { produce } from "solid-js/store";
import cloneDeep from 'lodash/cloneDeep';
import * as api from 'lib/api.js';
import {
  generateHusk,
} from 'lib/turf';
import { hexToInt, vec2, vecToStr, jClone } from 'lib/utils';
import { getPool } from 'lib/pool';

export class Mist { // we use a class so we can put it inside a store without getting proxied
  constructor(id, options = {}) {
    this.id = id;
    const apiSendWave = (...args) => {
      api.sendMistWave(id, ...args);
    };
    this._ = getPool(washMist, null, apiSendWave, filters(this), options);
    this.$ = this._.$;
    const [local, { mutate, refetch }] = createResource(api.getLocal);
    this._local = local;
    this.refetchLocal = refetch;


    this.subscribe();
  }

  get mist() {
    return this._.real;
  }

  get vapor() {
    return this._.fake;
  }

  get config() {
    return this._local().config;
  }

  get closet() {
    return this._local().closet;
  }

  // returns true/false whether we attempted to send the wave or not
  // returns false if stir was judged to be unworthy (e.g. placing a duplicate item)
  sendWave(type, arg, batch = true) {
    return this._.sendWave(type, arg, batch);
  }

  subscribe() {
    const onMistErr = () => {};
    const onMistQuit = () => {};
    api.subscribeToPool(this.id, this._.onRes.bind(this._), onMistErr, onMistQuit);
  }

  goHome() {
    this.sendWave('export-self', {
      for: ourPond,
    });
  }

  acceptPortOffer() {
    if (this.vapor?.portOffer) {
      this.sendWave('accept-port-offer', this.vapor.portOffer.for);
    }
  }

  rejectPortOffer() {
    if (this.vapor?.portOffer) {
      this.sendWave('reject-port-offer', this.vapor.portOffer.for);
    }
  }

  setColor(color) {
    if (typeof color === 'string' && color[0] === '#') {
      color = hexToInt(color);
    }
    this.sendWave('set-color', Number(color));
  }

  addThing(formId) {
    this.sendWave('add-thing-from-closet', formId);
  }

  delThing(index) {
    this.sendWave('del-thing', Number(index));
  }

  async setVitaEnabled(enabled) {
    await api.setVitaEnabled(enabled);
    this.refetchLocal();
  }

  toggleVitaEnabled() {
    this.setVitaEnabled(!this.config.enabled);
  }
}

const mistGrits = {
  'set-ctid': (mist, turfId) => {
    mist.currentTurfId = turfId;
  },
  'set-avatar': (mist, avatar) => {
    mist.avatar = avatar;
  },
  'set-color': (mist, color) => {
    mist.avatar.body.color = color;
  },
  'add-thing': (mist, thing) => {
    mist.avatar.things = [...mist.avatar.things, thing];
  },
  'del-thing': (mist, index) => {
    mist.avatar.things.splice(index, 1);
  },
  'port-offered': (mist, portOffer) => {
    mist.portOffer = portOffer;
    mist.targetTurfId = null;
  },
  'accept-port-offer': (mist, turfId) => {
    mist.targetTurfId = turfId
    mist.portOffer = null;
  },
  'reject-port-offer': (mist, turfId) => {
    if (mist.portOffer?.for === turfId) {
      mist.portOffer = null;
    }
    if (mist.targetTurfId === turfId) {
      mist.targetTurfId = null;
    }
  },
  'clear-port-offer': (mist, _) => {
    mist.targetTurfId = null;
    mist.portOffer = null;
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
  return produce((mist) => {
    if (mistGrits[grit.type]) {
      mistGrits[grit.type](mist, grit.arg);
    } else {
      console.warn(`Could not process grit of type: ${grit.type}`);
    }
  });
}

// returns an object of functions which
// return false if goal is rejected
// otherwise, returns a pair of [goal, grit]
// or, more commonly, a single goal/grit
function filters(mistPool) {
  return {
    'add-thing-from-closet': (mist, goal) => {
      const formId = goal.arg;
      const form = mistPool.closet?.[formId];
      const husk = {
        ...generateHusk(formId),
        form,
      }
      if (!form) {
        return false;
      } else {
        return [
          goal,
          {
            type: 'add-thing',
            arg: husk,
          }
        ]
      }
    }
  };
}
