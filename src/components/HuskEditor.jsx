import {
  batch,
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  mergeProps,
} from 'solid-js';
import { createStore, produce, reconcile } from 'solid-js/store';
import { getForm } from 'lib/turf.js';
import { bind, input, jClone, vec2 } from 'lib/utils.js';
import mapValues from 'lodash/mapValues';
import { useState } from 'stores/state.jsx';
import SmallButton from '@/SmallButton.jsx';
import FormInfo from '@/FormInfo.jsx';
import ListItemPicker from '@/ListItemPicker.jsx';
import ItemButton from '@/ItemButton.jsx';
import EffectsEditor from '@/EffectsEditor.jsx';
import leftCaret from 'assets/icons/left-caret.png';

export default function HuskEditor(props) {
  const state = useState();
  const [newEffects, $newEffects] = createStore({});
  const [shouldReset, $shouldReset] = createSignal(false);
  const husk = () => props.shade;
  const pos = () => props.shade?.pos;
  const form = () => husk().form;
  const [huskEffects, $huskEffects] = createStore({});
  // const huskEffects = mergeProps(husk().effects, huskResets);
  createEffect(() => {
    if (shouldReset()) {
      $huskEffects(reconcile({}));
    } else {
      Object.keys(husk().effects).forEach((key) => {
        $huskEffects(key, husk().effects[key]);
      });
    }
  });
  // const huskEffects = () => shouldReset() ? {} : husk().effects;
  const nonFormEffects = mergeProps(huskEffects, newEffects);

  function clearNewEffects() {
    $newEffects(reconcile({}));
  }

  function resetEffects() {
    batch(() => {
      clearNewEffects();
      $shouldReset(true);
    });
  }

  const effects = createMemo(() => {
    if (!husk()) return {};
    const merged = mergeProps(
      form().seeds,
      form().effects,
      nonFormEffects,
    );
    return mapValues(merged, (effect) => {
      if (typeof effect === 'string') {
        return { type: effect, arg: null };
      }
      return effect;
    });
  });

  function save() {
    batch(() => {
      if (shouldReset()) state.resetShadeEffects(husk().id);
      Object.entries(newEffects).forEach(([trigger, effect]) => {
        if (trigger === '') return;
        if (effect != null) {
          effect = effect.arg === null ? effect.type : effect;
        }
        if (effect === '') return;
        state.setShadeEffect(husk().id, trigger, effect);
      });
      cancel();
    });
  }

  function cycleHusk(amount) {
    state.cycleShade(husk().id, amount);
  }

  function setHuskVariation(variation) {
    state.setShadeVariation(husk().id, variation);
  }

  function setHuskCollidable(collidable) {
    state.setShadeCollidable(husk().id, collidable);
  }

  function cancel() {
    clearNewEffects();
    $shouldReset(false);
  }

  function deleteItem() {
    state.delShade(husk().id);
  }

  return (
    <Show when={husk()}>
      <div class='flex flex-col m-1 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700 grow overflow-y-auto'>
        <div class='relative'>
          <SmallButton
            onClick={() => state.selectShade(null)}
            class='absolute top-1.5 left-1.5 !p-0.5'
          >
            <img src={leftCaret} class='w-4 h-4' />
          </SmallButton>
        </div>
        <FormInfo formId={husk().formId} />
        <div class='my-2 border-t border-yellow-950'></div>
        <div class='mx-1'>
          <div class='flex justify-center'>
            <Show when={form().variations.length > 1}>
              <SmallButton
                onClick={() => cycleHusk(form().variations.length - 1)}
              >
                {'<'}
              </SmallButton>
            </Show>
            <div class='grow min-h-[64px] flex justify-center'>
              <ItemButton form={form()} variation={husk().variation} />
            </div>
            <Show when={form().variations.length > 1}>
              <SmallButton onClick={[cycleHusk, 1]}>
                {'>'}
              </SmallButton>
            </Show>
          </div>
          <Show
            when={form().variations.length > 1 ||
              husk().variation >= form().variations.length}
          >
            <ListItemPicker
              wall={form().type === 'wall'}
              items={form().variations}
              selected={husk().variation}
              onSelect={(i) => setHuskVariation(i)}
            />
          </Show>
          <p class='text-center'>
            Variation: {husk().variation + 1} of {form().variations.length}
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
              checked={husk().collidable ?? form().collidable}
              onInput={(e) => setHuskCollidable(e.currentTarget.checked)}
            />
          </div>
          <div class='flex items-center space-x-2'>
            <span>Effects:</span>
            <Show when={Object.keys(nonFormEffects).length}>
              <SmallButton onClick={resetEffects}>
                Reset Effects
              </SmallButton>
            </Show>
          </div>
          {
            /* form: {JSON.stringify(form().effects, null, 2)}
          husk: {JSON.stringify(husk().effects, null, 2)}
          huskEffects: {JSON.stringify(huskEffects, null, 2)}
          newEffects: {JSON.stringify(newEffects, null, 2)}
          nonFormEffects: {JSON.stringify(nonFormEffects, null, 2)} */
          }
          <EffectsEditor
            effects={effects()}
            $effects={$newEffects}
            form={form()}
          />
          <div class='my-1 flex justify-center space-x-2'>
            <Show when={Object.keys(newEffects).length || shouldReset()}>
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
