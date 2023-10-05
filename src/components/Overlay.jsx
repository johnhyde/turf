import { useState } from 'stores/state.jsx';
import { connection } from 'lib/api';
import Heading from '@/Heading';
import SmallButton from '@/SmallButton';

export default function Overlay() {
  const state = useState();
  const dotColor = () => {
    switch (connection()) {
      case 'intial':
        return 'bg-gray-500';
      case 'active':
      case 'reconnected':
        return 'bg-green-500';
      case 'opening':
      case 'reconnecting':
        return 'bg-orange-500 animate-pulse';
      default:
        return 'bg-red-500';
    }
  }
  return (
    <div class="absolute top-[64px] sm:top-0 w-full flex flex-col pointer-events-none">
      <div class="flex">
        <div class="flex-grow"></div>
        <Show when={state.c.id}>
          <Heading class="text-xl mt-3 flex items-center pointer-events-auto">
            {state.c.name}
            <div
              class={'ml-2 mr-1 w-2 h-2 rounded-full ' + dotColor()}
            ></div>
            {/* <Show when={connection() === 'reconnecting' || connection() === 'errored'}> */}
              {/* <SmallButton class="ml-1 !pr-0.5 !pt-[-0.5] !bg-transparent border-0 hover:!bg-yellow-700" onClick={state.resetConnection.bind(state)}>
                ⟳
              </SmallButton> */}
            {/* </Show> */}
          </Heading>
        </Show>
        <div class="flex-grow text-left">
          {/* <Heading>
            {connection()}
          </Heading> */}
        </div>
      </div>
      <div class="flex flex-col items-center space-y-2 mt-2 pointer-events-auto">
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
