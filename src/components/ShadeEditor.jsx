import {
  batch,
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  mergeProps,
} from 'solid-js';
import { createStore, produce, reconcile, unwrap } from 'solid-js/store';
import { getForm } from 'lib/turf.js';
import { bind, input, jClone, vec2 } from 'lib/utils.js';
import mapValues from 'lodash/mapValues';
import isEqual from 'lodash/isEqual';
import { useState } from 'stores/state.jsx';
import SmallButton from '@/SmallButton.jsx';
import FormInfo from '@/FormInfo.jsx';
import ListItemPicker from '@/ListItemPicker.jsx';
import ItemButton from '@/ItemButton.jsx';
import EffectsEditor from '@/EffectsEditor.jsx';
import leftCaret from 'assets/icons/left-caret.png';

export default function ShadeEditor(props) {
  const state = useState();
  const [newFx, $_newFx] = createStore([]);
  const [fx, $fx] = createStore([]);
  // const [newInited, $newInited] = createSignal(false);
  const [shouldReset, $shouldReset] = createSignal(false);
  const $newFx = (...args) => {
    $shouldReset(false);
    $_newFx(...args);
  };
  const shade = () => props.shade;
  const pos = () => props.shade?.pos;
  const form = () => shade().form;
  // const shadeEffects = mergeProps(shade().fx, shadeResets);
  // createEffect(() => {
  //   if (shouldReset()) {
  //     $shadeEffects(reconcile([]));
  //   } else {
  //     Object.keys(shade().fx).forEach((key) => {
  //       $shadeEffects(key, shade().fx[key]);
  //     });
  //   }
  // });
  // const shadeEffects = () => shouldReset() ? {} : shade().fx;
  // const nonFormEffects = mergeProps(shadeEffects, newFx);

  // function clearNewEffects() {
  //   $newFx(reconcile([]));
  // }

  function resetEffects() {
    batch(() => {
      // clearNewEffects();
      $shouldReset(true);
      updateNewFx();
    });
  }

  createEffect(updateNewFx);
  function updateNewFx() {
    if (!shade()) {
      $_newFx(reconcile([]));
    } else if (!shade().fx || shouldReset()) {
      $_newFx(reconcile(jClone(shade().form.fx || [])));
    } else {
      // if (!newInited()) {
      $_newFx(reconcile(jClone(shade().fx)));
    }
    // } else {
    //   $fx(reconcile(shade().fx));
    // }
  }

  function save() {
    batch(() => {
      if (shouldReset()) {
        state.setShadeFx(shade().id, null);
      } else {
        state.setShadeFx(shade().id, jClone(newFx));
      }
      // Object.entries(newFx).forEach(([trigger, effect]) => {
      //   if (trigger === '') return;
      //   if (effect != null) {
      //     effect = effect.arg === null ? effect.type : effect;
      //   }
      //   if (effect === '') return;
      //   state.setShadeEffect(shade().id, trigger, effect);
      // });
      cancel();
    });
  }

  function cycleShade(amount) {
    state.cycleShade(shade().id, amount);
  }

  function setShadeVariation(variation) {
    state.setShadeVariation(shade().id, variation);
  }

  function setShadeCollidable(collidable) {
    state.setShadeCollidable(shade().id, collidable);
  }

  function cancel() {
    // clearNewEffects();
    batch(() => {
      $shouldReset(false);
      updateNewFx();
    });
  }

  function deleteItem() {
    state.delShade(shade().id);
  }

  return (
    <Show when={shade()}>
      <div class='flex flex-col m-1 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700 grow overflow-y-auto'>
        <div class='relative'>
          <SmallButton
            onClick={() => state.selectShade(null)}
            class='absolute top-1.5 left-1.5 !p-0.5'
          >
            <img src={leftCaret} class='w-4 h-4' />
          </SmallButton>
        </div>
        <FormInfo formId={shade().formId} />
        <div class='my-2 border-t border-yellow-950'></div>
        <div class='mx-1'>
          <div class='flex justify-center'>
            <Show when={form().variations.length > 1}>
              <SmallButton
                onClick={() => cycleShade(form().variations.length - 1)}
              >
                {'<'}
              </SmallButton>
            </Show>
            <div class='grow min-h-[64px] flex justify-center'>
              <ItemButton form={form()} variation={shade().variation} />
            </div>
            <Show when={form().variations.length > 1}>
              <SmallButton onClick={[cycleShade, 1]}>
                {'>'}
              </SmallButton>
            </Show>
          </div>
          <Show
            when={form().variations.length > 1 ||
              shade().variation >= form().variations.length}
          >
            <ListItemPicker
              wall={form().type === 'wall'}
              items={form().variations}
              selected={shade().variation}
              onSelect={(i) => setShadeVariation(i)}
            />
          </Show>
          <p class='text-center'>
            Variation: {shade().variation + 1} of {form().variations.length}
          </p>
          <div class='text-center'>
            Position: {pos().x}x{pos().y}
            <br />
            <div class='text-sm -mt-1'>
              (click+drag to move)
            </div>
          </div>
          <div class='flex justify-center items-center gap-2'>
            <label for='collidable'>
              Blocks Movement:
            </label>
            <input
              type='checkbox'
              id='collidable'
              checked={shade().collidable ?? form().collidable}
              onInput={(e) => setShadeCollidable(e.currentTarget.checked)}
            />
          </div>
          <div class='flex items-center space-x-2'>
            <span>Effects:</span>
            <Show when={!isEqual(jClone(newFx), jClone(shade().form.fx))}>
              <SmallButton onClick={resetEffects}>
                Reset Effects
              </SmallButton>
            </Show>
          </div>
          {
            /* form: {JSON.stringify(form().fx, null, 2)}
          shade: {JSON.stringify(shade().fx, null, 2)}
          shadeEffects: {JSON.stringify(shadeEffects, null, 2)}
          newFx: {JSON.stringify(newFx, null, 2)}
          nonFormEffects: {JSON.stringify(nonFormEffects, null, 2)} */
          }
          <EffectsEditor
            fx={newFx}
            $fx={$newFx}
            form={form()}
          />
          <div class='my-1 flex justify-center space-x-2'>
            <Show
              when={!isEqual(
                newFx,
                shade().fx || shade().form.fx,
              ) || shouldReset()}
            >
              <SmallButton onClick={save}>
                Save
              </SmallButton>
              <SmallButton onClick={cancel}>
                Cancel
              </SmallButton>
            </Show>
            <SmallButton onClick={deleteItem}>
              Delete
            </SmallButton>
          </div>
        </div>
      </div>
    </Show>
  );
}
