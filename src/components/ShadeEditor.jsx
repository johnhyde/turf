import { batch, createSignal, createSelector, mergeProps } from 'solid-js';
import { createStore, produce, reconcile } from "solid-js/store";
import { vec2, bind, input } from 'lib/utils';
import mapValues from 'lodash/mapValues';
import { useState } from 'stores/state.jsx';

export default function ShadeEditor(props) {
  const state = useState();
  const [newEffects, $newEffects] = createStore({});

  function clearNewEffects() {
    $newEffects(reconcile({}));
  }

  const effects = () => {
    if (!props.shade) return {};
    const merged = mergeProps(props.shade.form.seeds, props.shade.form.effects, props.shade.effects, newEffects);
    return mapValues(merged, (effect) => {
      if (typeof effect === 'string') {
        return { type: effect, arg: null };
      }
      return effect;
    });
  };

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

  return (
    <Show when={props.shade}>
      {(shade) =>
        <div>
          <For each={Object.entries(effects())} >
            {([trigger, effect]) => {
              return <div>
                {trigger}: {effect.type}
                <ArgInput
                  shade={shade()}
                  type={effect.type} arg={effect.arg}
                  setArg={(arg) => setArg(trigger, effect.type, arg)}
                />
              </div>;
            }}
          </For>
          <button onClick={save}>
            Save
          </button>
          <button onClick={cancel}>
            Cancel
          </button>
          <pre>
            {JSON.stringify(effects(), null, 2)}
            {JSON.stringify(newEffects, null, 2)}
          </pre>
          <pre>
            {JSON.stringify(shade(), null, 2)}
          </pre>
        </div>
      }
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
    { props.arg !== null ? <div>
      <Switch>
        <Match when={props.type === 'port'}>
          <input
            type='number'
            use:input
            use:bind={[
              () => props.arg,
              updatePortal,
            ]} />
          <button onClick={[props.setArg, null]} >x</button>
        </Match>
        <Match when={props.type === 'jump'}>
          <input type="number"
            min={state.e.offset.x}
            max={state.e.offset.x + state.e.size.x - 1} 
            use:input
            use:bind={[
              () => props.arg.x,
              (s) => props.setArg(vec2(s, props.arg.y))
            ]} />
          <input type="number"
            min={state.e.offset.y}
            max={state.e.offset.y + state.e.size.y - 1} 
            use:input
            use:bind={[
              () => props.arg.y,
              (s) => props.setArg(vec2(props.arg.x, s))
            ]} />
          <button onClick={[props.setArg, null]} >x</button>
        </Match>
      </Switch>
    </div> :
    <button onClick={[props.setArg, defaultArg()]} >+</button>
    }
  </>);
}
