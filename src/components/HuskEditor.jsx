import { batch, createMemo, createSelector, mergeProps } from 'solid-js';
import { createStore, produce, reconcile } from 'solid-js/store';
import { getForm } from 'lib/turf.js';
import { bind, input, jClone, vec2 } from 'lib/utils.js';
import mapValues from 'lodash/mapValues';
import { useState } from 'stores/state.jsx';
import Heading from '@/Heading.jsx';
import SmallButton from '@/SmallButton.jsx';
import FormInfo from '@/FormInfo.jsx';
import ListItemPicker from '@/ListItemPicker.jsx';
import ItemButton from '@/ItemButton.jsx';
import EffectsEditor from '@/EffectsEditor.jsx';

export default function HuskEditor(props) {
  const state = useState();
  const [newEffects, $newEffects] = createStore({});
  const isShade = () => !!props.shade;
  const husk = () => props.shade || props.tile;
  const pos = () => isShade() ? props.shade?.pos : props.pos;
  const form = () => isShade() ? husk().form : getForm(state.e, husk().formId);

  function clearNewEffects() {
    $newEffects(reconcile({}));
  }

  const effects = createMemo(() => {
    if (!husk()) return {};
    const merged = mergeProps(
      form().seeds,
      form().effects,
      husk().effects,
      newEffects,
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
      Object.entries(effects()).forEach(([trigger, effect]) => {
        if (trigger === '') return;
        if (effect != null) {
          effect = effect.arg === null ? effect.type : effect;
        }
        if (effect === '') return;
        if (isShade()) {
          state.setShadeEffect(husk().id, trigger, effect);
        } else {
          state.setTileEffect(pos(), trigger, effect);
        }
      });
      clearNewEffects();
    });
  }

  function cycleHusk(amount) {
    if (isShade()) {
      state.cycleShade(husk().id, amount);
    } else {
      state.cycleTile(pos(), amount);
    }
  }

  function setHuskVariation(variation) {
    if (isShade()) {
      state.setShadeVariation(husk().id, variation);
    } else {
      state.setTileVariation(pos(), variation);
    }
  }

  function setHuskCollidable(collidable) {
    if (isShade()) {
      state.setShadeCollidable(husk().id, collidable);
    } else {
      state.setTileCollidable(pos(), collidable);
    }
  }

  function cancel() {
    clearNewEffects();
  }

  function deleteItem() {
    if (isShade()) {
      state.delShade(husk().id);
    }
  }

  return (
    <Show when={husk()}>
      <div class='flex flex-col m-1 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700'>
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
            <Show when={isShade()}>
              <br />
              <div class='text-sm -mt-1'>
                (click+drag to move)
              </div>
            </Show>
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
          Effects:
          <EffectsEditor effects={effects()} $effects={$newEffects} />
          <div class='my-1 flex justify-center space-x-2'>
            <Show when={Object.keys(newEffects).length}>
              <SmallButton onClick={save}>
                Save
              </SmallButton>
              <SmallButton onClick={cancel}>
                Cancel
              </SmallButton>
            </Show>
            <Show when={isShade()}>
              <SmallButton onClick={deleteItem}>
                Delete
              </SmallButton>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
}
