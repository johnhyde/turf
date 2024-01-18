import { createSignal, createContext, createEffect, createMemo, getOwner, runWithOwner, useContext, mergeProps, batch } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import * as api from 'lib/api.js';
import { normalizeIdAndDesig } from 'lib/utils';

export const PhoneContext = createContext();


export function getPhone() {
  const [phone, $phone] = createStore({
    calls: [],
    rings: [],
  });

  const _phone = mergeProps(phone, {
    call(patp) {
      const call = rtc.call(normalizeIdAndDesig(patp), rtc.dap);
      this.addCall(call);
      call.initialize();
      call.channel = call.createDataChannel('turf');
      call.channel.onmessage = this.handleIncomingMessage;
      call.channel.onopen = this.handleChannelOpen;
      call.channel.onclose = this.handleChannelClose;
    },
    answer(ring) {
      const call = ring.answer();
      this.addCall(call);
      call.initialize();
      this.delRing(ring);
    },
    reject(ring) {
      ring.reject();
      this.delRing(ring);
    },
    hangUp(call) {
      call.close();
      this.delCall(call);
    },
    addCall(call) {
      call.addEventListener('hungupcall', (e) => {
        this.delCall(call);
      });
      call.addEventListener('statechanged', ({ uuid, urbitState }) => {
        console.log(`state change for ${uuid}: ${urbitState}`);
      });
      call.ondatachannel = (event) => {
        call.channel = event.channel;
        call.channel.onmessage = this.handleIncomingMessage;
        call.channel.onopen = this.handleChannelOpen;
        call.channel.onclose = this.handleChannelClose;
      };
      $phone('calls', c => [...c, call]);
    },
    delCall(call) {
      $phone('calls', c => c.filter(c => c !== call));
    },
    delCallByUuid(uuid) {
      $phone('calls', c => c.filter(c => c.uuid !== uuid));
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

  // rtc.addEventListener("incomingcall", (e) => {
  //   console.log('call in', e);
  //   _phone.addRing(e);
  // });

  // rtc.addEventListener("hungupcall", ({ uuid }) => {
  //   _phone.delCallByUuid(uuid);
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
