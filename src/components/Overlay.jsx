import { useState } from 'stores/state.jsx';
import { connection } from 'lib/api';
import Heading from '@/Heading';
import SmallButton from '@/SmallButton';
import CallCenter from '@/CallCenter';
import home from 'assets/icons/home.png';
import gate from 'assets/icons/gate.png';

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
  };
  return (
    <div class='absolute top-[64px] bottom-[32px] left-0 sm:top-0 sm:bottom-0 w-full flex pointer-events-none'>
      <div class='basis-1/2'></div>
      <div class='shrink-0 flex flex-col'>
        <Show when={state.c.id}>
          <div className='flex justify-center items-center space-x-2 pt-2'>
            <Heading class='text-xl !mx-0 h-fit flex space-x-2 items-center pointer-events-auto'>
              {/* <div class='flex flex-col'> */}
              {/* </div> */}
              <Show when={state.e?.name} fallback={<span>{state.c.name}</span>}>
                <div class='flex flex-col text-center'>
                  <span>{state.e.name}</span>
                  <span class='text-sm'>{state.c.name}</span>
                </div>
              </Show>
              <div
                class={'ml-2 mr-1 w-2 h-2 rounded-full ' + dotColor()}
              >
              </div>
              {/* <Show when={connection() === 'reconnecting' || connection() === 'errored'}> */}
              {
                /* <SmallButton class="ml-1 !pr-0.5 !pt-[-0.5] !bg-transparent border-0 hover:!bg-yellow-700" onClick={state.resetConnection.bind(state)}>
                ⟳
              </SmallButton> */
              }
              {/* </Show> */}
            </Heading>
            <Show when={!state.thisIsUs}>
              <SmallButton
                class='pointer-events-auto'
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => state.mist.goHome()}
                tooltip='Return to Your Turf'
              >
                <img src={home} class='w-4 h-4 my-0.5' />
              </SmallButton>
            </Show>
            <SmallButton
              class='pointer-events-auto'
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => state.goToGate()}
              tooltip='Return to Turf Entrypoint'
            >
              <img src={gate} class='w-4 h-4 my-0.5' />
            </SmallButton>
          </div>
        </Show>
        <div class='flex flex-col items-center space-y-2 mt-2 pointer-events-auto'>
          <For each={state.notifications}>
            {(notif, index) => (
              <SmallButton
                class='font-normal !px-3 !py-1.5 !bg-yellow-600 transition'
                onClick={() => state.unnotify(index())}
              >
                {notif?.msg || notif}
              </SmallButton>
            )}
          </For>
        </div>
      </div>
      <div class='basis-1/2 text-left pointer-events-none'>
        <CallCenter />
      </div>
    </div>
  );
}
