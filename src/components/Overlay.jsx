import { useState } from 'stores/state.jsx';
import Heading from '@/Heading';
import SmallButton from '@/SmallButton';

export default function Overlay() {
  const state = useState();
  return (
    <div class="absolute w-full flex flex-col">
      <Show when={state.c.id}>
        <Heading class="text-xl mt-3">
          {state.c.name}
        </Heading>
      </Show>
      <div class="flex flex-col items-center space-y-2 mt-2">
        <For each={state.notifications}>
          {(notif, index) =>
            <SmallButton class="font-normal !px-3 !py-1.5 !bg-yellow-600 transition" onClick={() => state.unnotify(index())}>
              {notif?.msg || notif}
            </SmallButton>
          }
        </For>
      </div>
    </div>
  );
}
