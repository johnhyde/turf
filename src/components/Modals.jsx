import { createSignal, createSelector, onMount, onCleanup } from 'solid-js';
import { useState } from 'stores/state.jsx';
import * as api from 'lib/api.js';
import { stripPathPrefix, autofocus } from 'lib/utils';
import Modal from '@/Modal';
import MediumButton from './MediumButton';

export default function Modals() {
  const state = useState();
  
  function optIn() {
    state.p.markNotNew();
    state.mist.setVitaEnabled(true);
  }
  
  function optOut() {
    state.p.markNotNew();
  }

  function goHome() {
    state.mist.goHome();
  }

  return (
    <>
      <Show when={state.portOffer || state.v?.portOffer} keyed>
        {(portOffer) => {
          function accept() {
            state.mist.acceptPortOffer(portOffer);
            state.setPortOffer(null);
          }
          function reject() {
            state.mist.rejectPortOffer(portOffer);
            state.setPortOffer(null);
          }

          return (
          <Modal class="bg-teal-700 text-slate-100 w-96">
            <p class="text-xl mb-4 text-center">
              {portOffer.of ?
                "You've activated a portal!"
              :
                "You've been summoned!"
              }
            </p>
            <p class="mb-2">
              Would you like to travel to:
            </p>
            <p class="text-center text-lg">
              <span class="font-bold">{stripPathPrefix(portOffer.for)}</span>?
            </p>
            <div class="flex w-full justify-center mt-4 space-x-4">
              <button use:autofocus class="bg-teal-800 rounded-lg px-4 py-2" onClick={accept}>
                Yes
              </button>
              <button class="bg-teal-800 rounded-lg px-4 py-2" onClick={reject}>
                No
              </button>
            </div>
          </Modal>);
        }}
      </Show>
      <Show when={state.m && (!state.e || !state.player)} keyed>
        <Modal class="bg-teal-700 text-slate-100 w-96">
          <p class="text-xl mb-4 text-center">
            {state.c.id ? `Teleporting to ${state.c.name}...` : 'You are in the void, not present in any turf'}
          </p>
          {state.c.id && (
              <p class="mb-2">
            {!state.e ?
              'If this takes a long time, it may be because the host is offline.'
            :
              'Connected! Waiting for the latest update...'
            }
              </p>
          )}
          <div class="flex w-full justify-center mt-4 space-x-4">
            <button use:autofocus class="bg-teal-800 rounded-lg px-4 py-2" onClick={goHome}>
              Go Home {state.c.id ? 'Instead' : ''}
            </button>
          </div>
        </Modal>
      </Show>
      <Show when={state.p?.id === ourPond && state.p?.new && state.mist.config?.enabled !== undefined && !state.mist.config.enabled} keyed>
        <Modal class="bg-teal-700 text-slate-100">
          <p class="text-xl mb-4 text-center">
            You Are Opted Out of Usage Tracking
          </p>
          <p class="mb-2">
            Turf uses %vita to automatically track how many people are using Turf each day.
          </p>
          <p class="mb-2">
            When enabled, Turf sends at most one message per day to {state.mist.config.vitaParent}, saying that you used app.
          </p>
          <p class="italic">
            Please consider opting in—this gives us the data we need to get funding to keep improving Turf.
          </p>
          <div class="flex w-full justify-center my-4 space-x-4">
            <button use:autofocus class="bg-teal-800 rounded-lg px-4 py-2" onClick={optIn}>
              Opt In
            </button>
            <button class="bg-teal-800 rounded-lg px-4 py-2" onClick={optOut}>
              Close
            </button>
          </div>
          <p class="italic">
            You can change this setting at any time from the <span class="font-bold">?</span> tab.
          </p>
        </Modal>
      </Show>
      <Show when={state.text}>
        <Modal class="border-yellow-950 border-4 rounded-md bg-yellow-700" onClose={() => state.displayText(null)}>
          <p class="text-xl mb-4 text-center whitespace-pre-wrap">
            {state.text}
          </p>
          <div class="mt-4 text-center">
            <MediumButton onClick={() => state.displayText(null)}>
              Close
            </MediumButton>
          </div>
        </Modal>
      </Show>
    </>
  );
}
