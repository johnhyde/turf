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
    options = {
      ...options,
      // preFilters,
      filters: filters(this),
    };
    this._ = getPool(washMist, null, apiSendWave, options);
    this.$ = this._.$;
    const [local, { mutate, refetch }] = createResource(api.getLocal);
    this._local = local;
    this.refetchLocal = refetch;

    this.sub = null;
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

  async subscribe() {
    const onMistErr = () => {};
    const onMistQuit = () => {};
    this.sub = await api.subscribeToPool(this.id, this._.onRes.bind(this._), onMistErr, onMistQuit);
  }
  async unsubscribe() {
    await api.unsubscribeToPool(this.id);
  }

  async destroy() {
    return this.unsubscribe();
  }

  goHome() {
    this.sendWave('export-self', {
      for: ourPond,
      via: null,
    });
  }

  acceptInvite(turfId, inviteId) {
    this.sendWave('export-self', {
      for: turfId,
      via: inviteId,
    });
  }

  acceptInviteCode(code) {
    const lastSlash = code.lastIndexOf('/');
    const turfId = '/pond/' + code.substring(0, lastSlash);
    const inviteId = code.substring(lastSlash + 1);
    console.log('accepting invite:', turfId, inviteId);
    this.acceptInvite(turfId, inviteId);
  }

  acceptPortOffer(portOffer) {
    if (portOffer) {
      this.sendWave('accept-port-offer', portOffer.for);
    }
  }

  rejectPortOffer(portOffer) {
    if (portOffer) {
      this.sendWave('reject-port-offer', portOffer.for);
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

export function washMist(update, grits, src, wen) {
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

// These simulate the filters on the ship
// returns either
// Array<grit>
//   or
// {
//   roars: Array<roar>, // side-effects
//   grits: Array<grit>, // what grits does this translate to?
//   goals: Array<goal>, // what sub-goals does this trigger?
// }
function filters(mistPool) {
  return {
    'add-thing-from-closet': (mist, goal) => {
      const formId = goal.arg;
      const form = mistPool.closet?.[formId];
      if (!form) {
        return [];
      } else {
        const husk = {
          ...generateHusk(formId),
          form,
        };
        return [
        {
          type: 'add-thing',
          arg: husk,
        }];
      }
    }
  };
}
