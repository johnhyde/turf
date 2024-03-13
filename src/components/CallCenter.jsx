import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import { useState } from 'stores/state';
import { usePhone } from 'stores/phone';
import Modal from '@/Modal';
import CallInfo from '@/CallInfo';
import MediumButton from '@/MediumButton';
import SmallButton from '@/SmallButton';
import { destToString } from '../lib/rally';

function idSort(a, b) {
  return a.id.localeCompare(b.id);
}

export default function CallCenter() {
  const state = useState();
  const phone = usePhone();
  const calls = () => Object.values(phone.calls).sort(idSort);
  const publicCalls = () => Object.values(phone.publicCalls).sort(idSort);
  const wrapperClass = 'flex flex-wrap justify-end items-start content-start gap-3 pointer-events-auto';

  return (
    <div class="p-3 h-full flex flex-col gap-3 items-end">
      <Show when={!calls().length && state.c.peers.length}>
        <div class={wrapperClass}>
          <MediumButton onClick={() => state.makeCall(state.c.peers)} class="!m-0">
            Call {state.c.peers.join(', ')}
          </MediumButton>
          <For each={publicCalls()}>
            {(call) => {
              return <JoinCallButton call={call} />
            }}
          </For>
        </div>
      </Show>
      <Show when={calls().length && phone.rings.length}>
        <div class={wrapperClass}>
          <For each={phone.rings}>
            {(ring) => {
              const creator = () => ring.crewId.split('/')[2];
              return <MediumButton class="!m-0">
                {creator()} is calling
              </MediumButton>
            }}
          </For>
        </div>
      </Show>
      <div class="min-h-0 max-w-[245px] flex flex-col">
        <For each={calls()}>
          {(call) => (
            <CallInfo call={call}/>
          )}
        </For>
      </div>
    </div>
  );
}


function JoinCallButton(props) {
  const state = useState();
  const [callers, $callers] = createSignal([]);
  const callPeers = () => callers().filter(c => [our, ...state.c.peers].includes(c));
  const phone = usePhone();
  const isInvite = () => phone.rings.map(destToString).includes(props.call.id);
  createEffect(() => {
    if (props.call) {
      const controller = new AbortController();
      props.call.addEventListener('crew-update', (e) => {
        $callers(props.call.activePeers);
      }, { signal: controller.signal });
      $callers(props.call.activePeers);
      onCleanup(() => {
        controller.abort();
      });
    }
  });

  return <Show when={callPeers().length}>
    <MediumButton onClick={() => phone.answer(props.call.id)} class="!m-0">
      {isInvite() ? 'Answer' : 'Join'} {callers().join(', ')}
    </MediumButton>
  </Show>
}