import { onMount, onCleanup } from 'solid-js';
import { useState } from 'stores/state';
import { usePhone } from 'stores/phone';
import CallInfo from '@/CallInfo';

export default function CallCenter(props) {
  const state = useState();
  const phone = usePhone();
  const calls = () => Object.values(phone.calls).sort((a, b) => a.id.localeCompare(b.id));

  return (<>{
    (calls().length == 0) ?
    (
      <Show when={state.c.peers.length > 0}>
        <div>
          <button onClick={[phone.call.bind(phone), state.c.peers]}>Call</button>
          <For each={state.c.peers}>
            {(patp) => {
              return <p>{patp}</p>;
            }}
          </For>
        </div>
      </Show>
    ) : (<>
      <span>hey</span>
      <For each={calls()}>
        {(call) => <CallInfo call={call}/>}
      </For></>
    )
  }</>);
}
