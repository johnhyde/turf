import { createSignal, createContext, createEffect, createMemo, getOwner, runWithOwner, useContext, mergeProps, batch } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import { horn, incoming } from 'lib/api.js';
import { normalizeId } from 'lib/utils';

export const PhoneContext = createContext();


export function getPhone() {
  const [phone, $phone] = createStore({
    calls: {},
    rings: [],
  });

  const _phone = mergeProps(phone, {
    call(peers) {
      if (!Array.isArray(peers)) peers = [peers];
      const call = horn.createRally();
      this.addCall(call);
      call.invite(peers.map(normalizeId));
    },
    answer(ring) {
      const call = horn.joinRally(ring);
      this.addCall(call);
      this.delRing(ring);
    },
    reject(ring) {
      incoming.reject(ring);
      this.delRing(ring);
    },
    hangUp(call) {
      call.leave(true);
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

  incoming.addEventListener('incoming', (e) => {
    if (e.dap === 'turf') {
      $phone('rings', reconcile(horn.incoming));
      // console.log('call in', e);
      // _phone.addRing(e);
    }
  });

  // rtc.addEventListener("hungupcall", ({ uuid }) => {
  //   _phone.delCallById(uuid);
  // });
  // rtc.initialize();

  window.phone = _phone;
  return _phone;
}

export function PhoneProvider(props) {
  return (
    <PhoneContext.Provider value={getPhone()}>
      {props.children}
    </PhoneContext.Provider>
  );
}

export function usePhone() { return useContext(PhoneContext); }
