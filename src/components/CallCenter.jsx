import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import { useState } from 'stores/state';
import { usePhone } from 'stores/phone';
import Modal from '@/Modal';
import CallInfo from '@/CallInfo';

function idSort(a, b) {
  return a.id.localeCompare(b.id);
}

export default function CallCenter() {
  const state = useState();
  const phone = usePhone();
  const calls = () => Object.values(phone.calls).sort(idSort);
  const publicCalls = () => Object.values(phone.publicCalls).sort(idSort);

  return (<>{
    (calls().length == 0) ?
    (
      <Show when={state.c.peers.length > 0}>
        <div>
          {/* <button onClick={[phone.call.bind(phone), state.c.peers]}>Call</button> */}
          <button onClick={[state.makeCall.bind(state), state.c.peers]}>Call</button>
          <For each={state.c.peers}>
            {(patp) => {
              return <p>{patp}</p>;
            }}
          </For>
        </div>
        <For each={publicCalls()}>
          {(call) => {
            return <JoinCallButton call={call} />
          }}
        </For>
      </Show>
    ) : (
      <Portal mount={document.getElementById('modals')}>
        <For each={calls()}>
          {(call) => (
            <Modal class="!max-w-fit !max-h-full">
              <CallInfo call={call}/>
            </Modal>
          )}
        </For>
      </Portal>
    )
  }</>);
}


function JoinCallButton(props) {
  const state = useState();
  const [callers, $callers] = createSignal([]);
  const callPeers = () => callers().filter(c => state.c.peers.includes(c));
  const phone = usePhone();
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
    <button onClick={[phone.answer.bind(phone), props.call.id]}>
      Join {callers().join(', ')}
    </button>
  </Show>
}