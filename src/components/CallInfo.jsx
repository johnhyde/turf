import { createEffect, createSignal, onCleanup } from 'solid-js';
import { useState } from 'stores/state';
import { usePhone } from 'stores/phone';

export default function CallInfo(props) {
  const phone = usePhone();
  const [peers, $peers] = createSignal([]);
  let controller;
  createEffect(() => {
    controller = new AbortController();
    props.call.addEventListener('crew-update', (update) => {
      updatePeers();
    }, { signal: controller.signal });
    updatePeers();
    onCleanup(() => controller.abort());
  });
  function updatePeers() {
    $peers(Object.keys(props.call.crew.crew.peers).filter(patp => patp !== our));
  }

  return (
    <div class="bg-yellow-700 border border-yellow-950 rounded-lg pointer-events-auto mx-auto">
      <p>
        Talking to {peers().length ? peers().join(', ') : 'no one, yet'}
      </p>
      <div class="flex justify-center">
        <button onClick={() => phone.hangUp(props.call)}>
          Hang Up
        </button>
      </div>
    </div>);
}
