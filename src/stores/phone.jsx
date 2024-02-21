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
      const call = horn().joinRally(ring);
      this.addCall(call);
      this.delRing(ring);
    },
    reject(ring) {
      incoming().reject(ring);
      this.delRing(ring);
    },
    hangUp(call) {
      call.leave(true);
      this.delCall(call);
    },
    delete(call) {
      call.delete();
      this.delCall(call);
    },
    addCall(call) {
      call.addEventListener('crew-quit', (e) => {
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
      $phone('rings', r => r.filter(r => r !== ring));
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
