import { onMount, onCleanup } from 'solid-js';
import { usePhone } from 'stores/phone';

export default function CallInfo(props) {
  const phone = usePhone();

  return (<Show when={phone.calls[0]}>
    {(call) => {
      return <div class="bg-yellow-700 border border-yellow-950 rounded-lg pointer-events-auto mx-auto">
        <p>
          Talking to {'~' + call().peer}
        </p>
        <div class="flex justify-center">
          <button onClick={() => phone.hangUp(call())}>
            Hang Up
          </button>
        </div>
      </div>
    }}
  </Show>);
}
