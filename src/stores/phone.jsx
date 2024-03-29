import { createSignal, createContext, createEffect, createMemo, createResource, getOwner, runWithOwner, useContext, mergeProps, batch } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import { horn as hornPromise } from 'lib/api.js';
import { normalizeId } from 'lib/utils';
import { useState } from 'stores/state';

export const PhoneContext = createContext();

const [horn, _] = createResource(() => hornPromise);
const incoming = () => horn()?.incomings?.['turf'];


export function getPhone(state) {
  const [phone, $phone] = createStore({
    calls: {},
    rings: [],
    publics: null,
    publicCalls: {},
  });

  const _phone = mergeProps(phone, {
    get r() { return Object.values(phone.calls)[0] },
    get c() { return Object.values(this.r.calls)[0] },
    async call(peers) {
      if (!horn()) await hornPromise;
      if (!Array.isArray(peers)) peers = [peers];
      const call = horn().createRally();
      this.addCall(call);
      call.invite(peers.map(normalizeId));
    },
    async answer(ring) {
      if (!horn()) await hornPromise;
      const call = horn().joinRally(ring, { leaveOtherClients: true });
      this.addCall(call);
      this.delRing(ring);
    },
    reject(ring) {
      incoming().reject(ring);
      this.delRing(ring); // not actually necessary because incoming updates
    },
    hangUp(call) {
      call.leaveAsClient();
      this.delCall(call);
    },
    delete(call) {
      call.delete();
      this.delCall(call);
    },
    addCall(call) {
      call.addEventListener('crew-over', (e) => {
        this.delCall(call);
      });
      $phone('calls', call.id, call);
    },
    delCall(call) {
      this.delCallById(call.id);
    },
    delCallById(id) {
      $phone('calls', id, undefined);
    },
    addRing(ring) {
      $phone('rings', r => [...r, ring]);
    },
    delRing(ring) {
      $phone('rings', r => r.filter((r) => {
        return !(r.ship === ring.ship && r.crewId === ring.crewId);
      }));
    },
    handleIncomingMessage(e) {
      console.log('IncomingMessage', e);
    },
    handleChannelOpen(e) {
      console.log('ChannelOpen', e);
    },
    handleChannelClose(e) {
      console.log('ChannelClose', e);
    },
  });

  createEffect(() => {
    if (incoming()) {
      incoming().addEventListener('dests-update', (e) => {
        if (e.dap === 'turf') {
          $phone('rings', reconcile(horn().incoming));
        }
      });
      $phone('rings', reconcile(horn().incoming));
    }
  });

  createEffect(() => {
    if (state.gameLoaded && state.soundOn) {
      if (Object.keys(phone.calls).length == 0 && phone.rings.length) {
        game.sound.play('ring', { loop: true });
      } else {
        game.sound.stopByKey('ring');
      }
    }
  });

  let wakeTimer = null;
  createEffect(() => {
    if (Object.keys(phone.calls).length) {
      if (!wakeTimer) {
        wakeTimer = setInterval(() => state.wake(), 60000);
        state.wake();
      }
    } else {
      if (wakeTimer) {
        clearInterval(wakeTimer);
        wakeTimer = null;
      }
    }
  });

  createEffect(() => {
    const ourCrewIdPrefix = `/turf/${our}`;
    const ours = _phone.rings.filter((i) => {
      return (i.ship === state.c.host) && (i.crewId.startsWith(ourCrewIdPrefix))
    });
    ours.forEach(_phone.answer.bind(_phone));
  });

  createEffect(() => {
    console.log('help');
    if (phone.publics?.host !== state.c.host) {
      if (phone.publics) phone.publics.cancel();
      if (state.c.host && horn()) {
        const publics = horn().watchPublics(state.c.host, null, { watchDetails: true });
        publics.addEventListener('dests-update', (e) => {
          console.log(publics.publics);
          $phone('publicCalls', reconcile(publics.crews))
        });
        $phone('publics', publics);
      }
    }
  });
  createEffect(() => {
    console.log('public calls', JSON.stringify(phone.publicCalls, null, 2));
  });

  window.phone = _phone;
  return _phone;
}

export function PhoneProvider(props) {
  const state = useState();
  return (
    <PhoneContext.Provider value={getPhone(state)}>
      {props.children}
    </PhoneContext.Provider>
  );
}

export function usePhone() { return useContext(PhoneContext); }
