import { createSelector, createSignal, onCleanup, onMount } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { usePhone } from 'stores/phone.jsx';
import * as api from 'lib/api.js';
import {
  autofocus,
  jClone,
  pathToTurfId,
  stripPathPrefix,
  turfIdToName,
} from 'lib/utils.js';
import Modal from '@/Modal.jsx';
import MediumButton from './MediumButton.jsx';

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
    <div id='modals'>
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
            <Modal class='bg-teal-700 text-slate-100 w-96' onClose={reject}>
              <p class='text-xl mb-4 text-center'>
                {portOffer.of
                  ? "You've activated a portal!"
                  : "You've been summoned!"}
              </p>
              <p class='mb-2'>
                Would you like to travel to:
              </p>
              <p class='text-center text-lg'>
                <span class='font-bold'>{stripPathPrefix(portOffer.for)}</span>?
              </p>
              <div class='flex w-full justify-center mt-4 space-x-4'>
                <button
                  use:autofocus
                  class='bg-teal-800 rounded-lg px-4 py-2'
                  onClick={accept}
                >
                  Yes
                </button>
                <button
                  class='bg-teal-800 rounded-lg px-4 py-2'
                  onClick={reject}
                >
                  No
                </button>
              </div>
              <Show when={phone.r}>
                <p class='mt-2 text-center'>
                  Your call won't be interrupted
                </p>
              </Show>
            </Modal>
          );
        }}
      </Show>
      <Show when={state.m && (!state.e || !state.player)} keyed>
        <Switch>
          <Match when={state.p?.error?.()}>
            <Modal class='bg-orange-700 text-slate-100 w-96'>
              <Switch
                fallback={
                  <p class='text-xl mb-4 text-center'>
                    Unknown error in teleporting to {state.c.name}:{' '}
                    {state.p.error()}
                  </p>
                }
              >
                <Match when={state.p?.unavailable}>
                  <p class='text-xl mb-4 text-center'>
                    {state.c.name} is not available
                  </p>
                </Match>
                <Match when={state.p?.future}>
                  <p class='text-xl mb-4 text-center'>
                    {state.c.name} is running a newer version of Turf
                  </p>
                  <p class='mb-2'>
                    You won't be able to visit until you get the latest software
                    update from ~pandux
                  </p>
                </Match>
              </Switch>
              <div class='flex w-full justify-center mt-4 space-x-4'>
                <button
                  use:autofocus
                  class='bg-orange-800 rounded-lg px-4 py-2'
                  onClick={goHome}
                >
                  Go Home {state.c.id ? 'Instead' : ''}
                </button>
              </div>
            </Modal>
          </Match>
          <Match when={!state.p?.error?.()}>
            <Modal class='bg-teal-700 text-slate-100 w-96'>
              <p class='text-xl mb-4 text-center'>
                {state.c.id
                  ? `Teleporting to ${state.c.name}...`
                  : 'You are in the void, not present in any turf'}
              </p>
              {state.c.id && (
                <p class='mb-2'>
                  {!state.e
                    ? 'If this takes a long time, it may be because the host is offline.'
                    : 'Connected! Waiting for the latest update...'}
                </p>
              )}
              <div class='flex w-full justify-center mt-4 space-x-4'>
                <Show when={ourPond !== state.c.id}>
                  <button
                    use:autofocus
                    class='bg-teal-800 rounded-lg px-4 py-2'
                    onClick={goHome}
                  >
                    Go Home {state.c.id ? 'Instead' : ''}
                  </button>
                </Show>
                <Show
                  when={state.c.id && state.mist.possibleReturn() &&
                    state.mist.possibleReturn() !== ourPond}
                >
                  <button
                    class='bg-teal-800 rounded-lg px-4 py-2'
                    onClick={() => state.mist.returnWhenceCame()}
                  >
                    Return to{' '}
                    {turfIdToName(pathToTurfId(state.mist.possibleReturn()))}
                  </button>
                </Show>
              </div>
            </Modal>
          </Match>
        </Switch>
      </Show>
      <Show when={state.thisIsUs && state.p?.new} keyed>
        <Modal class='bg-teal-700 text-slate-100' onClose={optOut}>
          <p class='text-xl mb-4 text-center'>
            Welcome to Turf!
          </p>
          <p class='mb-2'>
            If you're ever confused about something, check the information in
            the ? tab in the top left.
          </p>
          <p class='mb-2'>
            If you're not on the mailing list, you're welcome to sign up here.
          </p>
          <form
            action='https://jointurf.us17.list-manage.com/subscribe/post?u=0b6fd4dedf856064303a80d2c&amp;id=1575aff1a3&amp;f_id=006365e0f0'
            method='post'
            target='_blank'
            class='flex flex-col items-center space-y-3'
          >
            <div>
              <label for='mce-FNAME'>First Name</label>
              <input
                type='text'
                name='FNAME'
                class='ml-2 px-1.5 text-black rounded-md'
                id='mce-FNAME'
                value=''
              />
            </div>
            <div>
              <label for='mce-EMAIL'>Email Address</label>
              <input
                type='email'
                name='EMAIL'
                class='ml-2  px-1.5 text-black rounded-md'
                id='mce-EMAIL'
                value=''
                required
                placeholder='(required)'
              />
            </div>
            <div hidden>
              <input type='hidden' name='tags' value='7097484' />
            </div>
            <input
              type='submit'
              name='subscribe'
              class='px-2 py-1 border border-white rounded-md'
              value='Get the newsletter'
            />
          </form>
          <Show
            when={state.mist.config?.enabled !== undefined &&
              !state.mist.config.enabled}
            keyed
            fallback={
              <div class='flex w-full justify-center mt-3'>
                <button
                  class='bg-teal-800 rounded-lg px-4 py-2'
                  onClick={optOut}
                >
                  Close
                </button>
              </div>
            }
          >
            <div class='w-full my-4 border-t border-white'></div>
            <p class='text-xl mb-4 text-center'>
              You Are Opted Out of Usage Tracking
            </p>
            <p class='mb-2'>
              Turf uses %vita to automatically track how many people are using
              Turf each day.
            </p>
            <p class='mb-2'>
              When enabled, Turf sends at most one message per day to{' '}
              {state.mist.config.vitaParent}, saying that you used app.
            </p>
            <p class='italic'>
              Please consider opting in—it's very helpful to know whether people
              find the app engaging.
            </p>
            <div class='flex w-full justify-center my-4 space-x-4'>
              <button
                use:autofocus
                class='bg-teal-800 rounded-lg px-4 py-2'
                onClick={optIn}
              >
                Opt In
              </button>
              <button class='bg-teal-800 rounded-lg px-4 py-2' onClick={optOut}>
                Close
              </button>
            </div>
            <p class='italic'>
              You can change this setting at any time from the{' '}
              <span class='font-bold'>?</span> tab.
            </p>
          </Show>
        </Modal>
      </Show>
      <Show when={state.note.text}>
        <Modal
          class='border-yellow-950 border-4 rounded-md bg-yellow-700'
          onClose={() => state.closeNote()}
        >
          <p class='text-xl mb-4 text-center whitespace-pre-wrap'>
            {state.note.text}
          </p>
          <div class='mt-4 text-center'>
            <Index each={state.note.actions}>
              {(action, i) => (
                <MediumButton onClick={() => state.noteAction(i)}>
                  {action()}
                </MediumButton>
              )}
            </Index>
            <MediumButton onClick={() => state.closeNote()}>
              Close
            </MediumButton>
          </div>
        </Modal>
      </Show>
      <Show when={Object.keys(phone.calls).length == 0 && phone.rings.length}>
        <Modal class='bg-teal-700 text-slate-100 w-96'>
          <p class='text-xl mb-4 text-center'>
            Incoming call{phone.rings.length > 1 ? 's' : ''} from:
          </p>
          <For each={phone.rings}>
            {(ring, index) => {
              function answer() {
                phone.answer(jClone(ring));
              }
              function reject() {
                phone.reject(jClone(ring));
              }

              const creator = () => ring.crewId.split('/')[2];
              return (
                <>
                  {index() == 0 ? null : <div class='my-4 border-b' />}
                  <p class='text-center text-lg'>
                    <span class='font-bold'>{creator()}</span>?
                  </p>
                  <div class='flex w-full justify-center mt-4 space-x-4'>
                    <button
                      use:autofocus
                      class='bg-teal-800 rounded-lg px-4 py-2'
                      onClick={answer}
                    >
                      Answer
                    </button>
                    <button
                      class='bg-teal-800 rounded-lg px-4 py-2'
                      onClick={reject}
                    >
                      Reject
                    </button>
                  </div>
                </>
              );
            }}
          </For>
        </Modal>
      </Show>
    </div>
  );
}
