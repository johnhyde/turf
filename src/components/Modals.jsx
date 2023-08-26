import { createSignal, createSelector } from 'solid-js';
import { useState } from 'stores/state.jsx';
import * as api from 'lib/api.js';
import { stripPathPrefix, autofocus } from 'lib/utils';
import Button from '@/Button';
import cycle from 'assets/icons/cycle.png';

export default function Modals() {
  const state = useState();

  // document.addEventListener('keydown', (e) => {
  //   if (!e.defaultPrevented && !isTextInputFocused()) {
  //     if (e.code === 'Escape') {
  //       if (state.selectedTab) {
  //         selectTab(null);
  //       } else {
  //         if (open()) {
  //           closeSidebar();
  //         } else {
  //           openSidebar();
  //         }
  //         e.preventDefault();
  //       }
  //     }
  //     switch (e.key) {
  //       case '?':
  //       case 'h':
  //         toggleTab(state.tabs.HELP);
  //         openSidebar();
  //         break;
  //       case 'p':
  //         toggleTab(state.tabs.LAB);
  //         openSidebar();
  //       break;
  //       case 'e':
  //         toggleTab(state.tabs.EDITOR);
  //         openSidebar();
  //         break;
  //       case 'g':
  //         toggleTab(state.tabs.PORTALS);
  //         openSidebar();
  //         break;
  //       default:
  //     }
  //   }
  // });

  return (
    <>
      <Show when={state.v?.portOffer} keyed>
        <Modal class="bg-teal-700 text-slate-100">
          <p>
            {state.v.portOffer.of ?
              "You've activated a portal! Would you like to travel to:"
            :
              "You've been summoned! Would you like to travel to:"
            }
          </p>
          <p class="text-center text-lg">
            <span class="font-bold">{stripPathPrefix(state.v.portOffer.for)}</span>?
          </p>
          <div class="flex w-full justify-center mt-2 space-x-4">
            <button use:autofocus class="bg-teal-800 rounded-lg px-4 py-2" onClick={state.mist.acceptPortOffer.bind(state.mist)}>
              Yes
            </button>
            <button class="bg-teal-800 rounded-lg px-4 py-2" onClick={state.mist.rejectPortOffer.bind(state.mist)}>
              No
            </button>
          </div>
        </Modal>
      </Show>
    </>
  );
}

function Modal(props) {
  return (
    <div class="absolute w-full h-full flex z-20">
      <div class={"m-auto max-w-md max-h-md p-4 rounded-2xl " + (props.class || '')}>
        {props.children}
      </div>
    </div>
  )
}
