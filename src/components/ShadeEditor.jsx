import { batch, createMemo, createSelector, mergeProps } from 'solid-js';
import { createStore, produce, reconcile } from "solid-js/store";
import { vec2, bind, input, jClone } from 'lib/utils';
import mapValues from 'lodash/mapValues';
import { useState } from 'stores/state.jsx';
import Heading from '@/Heading';
import SmallButton from '@/SmallButton';
import FormEditor from '@/FormEditor';

export default function ShadeEditor(props) {
  const state = useState();
  const [newEffects, $newEffects] = createStore({});

  function clearNewEffects() {
    $newEffects(reconcile({}));
  }

  const effects = createMemo(() => {
    if (!props.shade) return {};
    const merged = mergeProps(props.shade.form.seeds, props.shade.form.effects, props.shade.effects, newEffects);
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
        state.setShadeEffect(
          props.shade.id,
          trigger,
          effect.arg === null ? effect.type : effect,
        );
      });
      clearNewEffects();
    });
  }

  function cancel() {
    clearNewEffects();
  }

  const [newForm, $newForm] = createStore({});
  function importForm() {
    if (props.shade.formId && props.shade.form) $newForm(jClone({
      formId: props.shade.formId,
      form: props.shade.form,
    }));
  }

  return (
    <Show when={props.shade}>
      <div class="flex flex-col m-1 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700">
        <Heading>{props.shade.form.name}</Heading>
        {state.c.id !== ourPond && 
          <>
            <SmallButton onClick={importForm} class="mx-auto">
              Import Item
            </SmallButton>
            <FormEditor form={newForm} $form={$newForm} addFn={state.importForm.bind(state)}/>
          </>
        }
        <p class="text-center">
          Item ID: {props.shade.formId}
        </p>
        <p class="text-center">
          Position: {props.shade.pos.x}x{props.shade.pos.y}
        </p>
        <Show when={Object.entries(effects()).length > 0}>
          Effects:
          <For each={Object.entries(effects())} >
            {([trigger, effect]) => {
              return (
                <div class="mb-2">
                  <div class="flex items-center mb-1">
                    on {trigger}: {effect.type}
                  </div>
                  <ArgInput
                    shade={props.shade}
                    type={effect.type} arg={effect.arg}
                    setArg={(arg) => setArg(trigger, effect.type, arg)}
                  />
                </div>
              );
            }}
          </For>
          <Show when={Object.keys(newEffects).length}>
            <div class="flex justify-center space-x-2">
              <SmallButton onClick={save}>
                Save
              </SmallButton>
              <SmallButton onClick={cancel}>
                Cancel
              </SmallButton>
            </div>
          </Show>
        </Show>
      </div>
    </Show>
  );
};

function ArgInput(props) {
  const state = useState();

  function defaultArg() {
    switch (props.type) {
      case 'port':
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
