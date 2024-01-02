import { createSignal, createSelector, onMount, onCleanup } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { usePhone } from 'stores/phone.jsx';
import * as api from 'lib/api.js';
import { stripPathPrefix, autofocus } from 'lib/utils';
import Modal from '@/Modal';
import MediumButton from './MediumButton';

export default function Modals() {
  const state = useState();
  const phone = usePhone();
  
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
      <Show when={state.thisIsUs && state.p?.new} keyed>
        <Modal class="bg-teal-700 text-slate-100" onClose={optOut}>
          <p class="text-xl mb-4 text-center">
            Welcome to Turf!
          </p>
          <p class="mb-2">
            If you're ever confused about something, check the information in the ? tab in the top left.
          </p>
          <p class="mb-2">
            If you're not on the mailing list, you're welcome to sign up here.
          </p>
          <form action="https://jointurf.us17.list-manage.com/subscribe/post?u=0b6fd4dedf856064303a80d2c&amp;id=1575aff1a3&amp;f_id=006365e0f0" method="post" target="_blank" class="flex flex-col items-center space-y-3">
            <div>
              <label for="mce-FNAME">First Name</label>
              <input type="text" name="FNAME" class="ml-2 px-1.5 text-black rounded-md" id="mce-FNAME" value="" />
            </div>
            <div>
              <label for="mce-EMAIL">Email Address</label>
              <input type="email" name="EMAIL" class="ml-2  px-1.5 text-black rounded-md" id="mce-EMAIL" value="" required placeholder="(required)" />
            </div>
            <div hidden><input type="hidden" name="tags" value="7097484" /></div>
            <input type="submit" name="subscribe" class="px-2 py-1 border border-white rounded-md" value="Get the newsletter" />
          </form>
          <Show when={state.mist.config?.enabled !== undefined && !state.mist.config.enabled} keyed fallback={
            <div class="flex w-full justify-center mt-3">
              <button class="bg-teal-800 rounded-lg px-4 py-2" onClick={optOut}>
                Close
              </button>
            </div>
          }>
            <div class="w-full my-4 border-t border-white"></div>
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
          </Show>
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
      <Show when={phone.rings[0]} keyed>

      {(ring) => {
        function answer() {
          phone.answer(ring);
        }
        function reject() {
          phone.reject(ring);
        }
        return (
          <Modal class="bg-teal-700 text-slate-100 w-96">
            <p class="text-xl mb-4 text-center">
              Incoming call from:
            </p>
            <p class="text-center text-lg">
              <span class="font-bold">{'~' + ring.peer}</span>?
            </p>
            <div class="flex w-full justify-center mt-4 space-x-4">
              <button use:autofocus class="bg-teal-800 rounded-lg px-4 py-2" onClick={answer}>
                Answer
              </button>
              <button class="bg-teal-800 rounded-lg px-4 py-2" onClick={reject}>
                Reject
              </button>
            </div>
          </Modal>);
        }}
      </Show>
    </>
  );
}
