import { batch, createMemo, createSelector, mergeProps } from 'solid-js';
import { createStore, produce, reconcile } from "solid-js/store";
import { getForm } from 'lib/turf';
import { vec2, bind, input, jClone } from 'lib/utils';
import mapValues from 'lodash/mapValues';
import { useState } from 'stores/state.jsx';
import Heading from '@/Heading';
import SmallButton from '@/SmallButton';
import FormInfo from '@/FormInfo';
import VariationPicker from '@/VariationPicker';
import ItemButton from '@/ItemButton';

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
    const merged = mergeProps(form().seeds, form().effects, husk().effects, newEffects);
    return mapValues(merged, (effect) => {
      if (typeof effect === 'string') {
        return { type: effect, arg: null };
      }
      return effect;
    });
  });

  function setArg(trigger, type, arg) {
    $newEffects(trigger, { type, arg });
  }

  function save() {
    batch(() => {
      Object.entries(effects()).forEach(([trigger, effect]) => {
        effect = effect.arg === null ? effect.type : effect;
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
      <div class="flex flex-col m-1 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700">
        <FormInfo formId={husk().formId} />
        <div class="my-2 border-t border-yellow-950"></div>
        <div class="mx-1">
          <div class="flex justify-center">
            <Show when={form().variations.length > 1} >
              <SmallButton onClick={() => cycleHusk(form().variations.length - 1)}>
                {"<"}
              </SmallButton>
            </Show>
            <div class="grow min-h-[64px] flex justify-center">
              <ItemButton form={form()} variation={husk().variation} />
            </div>
            <Show when={form().variations.length > 1} >
              <SmallButton onClick={[cycleHusk, 1]}>
                {">"}
              </SmallButton>
            </Show>
          </div>
          <Show when={form().variations.length > 1 || husk().variation >= form().variations.length}>
            <VariationPicker type={form().type} variations={form().variations} variation={husk().variation} onSelect={(i) => setHuskVariation(i)} />
          </Show>
          <p class="text-center">
            Variation: {husk().variation + 1} of {form().variations.length}
          </p>
          <div class="text-center">
            Position: {pos().x}x{pos().y}
            <Show when={isShade()}>
              <br/>
              <div class="text-sm -mt-1">
                (click+drag to move)
              </div>
            </Show>
          </div>
          <div class="flex justify-center items-center gap-2">
            <label for="collidable">
              Blocks Movement:
            </label>
            <input type="checkbox" id="collidable"
              checked={husk().collidable ?? form().collidable}
              onInput={(e) => setHuskCollidable(e.currentTarget.checked)}
            />
          </div>
          <Show when={Object.entries(effects()).length > 0}>
            Effects:
            <Index each={Object.entries(effects())} >
              {(item) => {
                const trigger = () => item()[0];
                const effect = () => item()[1];
                return (
                  <div class="mb-2">
                    <div class="flex items-center mb-1">
                      on {trigger()}: {effect().type}
                    </div>
                    <ArgInput
                      shade={husk()}
                      type={effect().type} arg={effect().arg}
                      setArg={(arg) => setArg(trigger(), effect().type, arg)}
                    />
                  </div>
                );
              }}
            </Index>
          </Show>
          <div class="my-1 flex justify-center space-x-2">
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
};

function ArgInput(props) {
  const state = useState();

  function defaultArg() {
    switch (props.type) {
      case 'port':
      case 'read':
        return '';
      case 'jump':
        return vec2(state.e.offset);
      default:
        return null;
    }
  }

  function updatePortal(portalId) {
    portalId = Number.parseInt(portalId);
    if (Number.isNaN(portalId)) {
      props.setArg('');
    } else {
      props.setArg(portalId);
    }
  }
  return (<>
    <div class="flex justify-center items-center space-x-2">
      { props.arg !== null ? 
        <Switch>
          <Match when={props.type === 'port'}>
            <span>Portal ID:</span>
            <input
              type='number'
              class="max-w-[80px]"
              use:input
              use:bind={[
                () => props.arg,
                updatePortal,
              ]} />
            <SmallButton onClick={[props.setArg, null]} >x</SmallButton>
          </Match>
          <Match when={props.type === 'read'}>
            <textarea
              class="rounded-input max-w-[160px]"
              use:input
              use:bind={[
                () => props.arg,
                (s) => props.setArg(s || ''),
              ]} />
            <SmallButton onClick={[props.setArg, null]} >x</SmallButton>
          </Match>
          <Match when={props.type === 'jump'}>
            <span>to x:</span>
            <input type="number"
              min={state.e.offset.x}
              max={state.e.offset.x + state.e.size.x - 1}
              use:input
              use:bind={[
                () => props.arg.x,
                (s) => props.setArg(vec2(s, props.arg.y))
              ]} />
            <span>y:</span>
            <input type="number"
              min={state.e.offset.y}
              max={state.e.offset.y + state.e.size.y - 1}
              use:input
              use:bind={[
                () => props.arg.y,
                (s) => props.setArg(vec2(props.arg.x, s))
              ]} />
            <SmallButton onClick={[props.setArg, null]} >x</SmallButton>
          </Match>
        </Switch>
      :
        <SmallButton onClick={[props.setArg, defaultArg()]} >+</SmallButton>
      }
    </div> 
  </>);
}
