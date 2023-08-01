import { createSignal, createSelector, mergeProps } from 'solid-js';
import { produce } from "solid-js/store";
import { vec2, bind, input } from 'lib/utils';
import mapValues from 'lodash/mapValues';
import { useState } from 'stores/state.jsx';

export default function ShadeEditor(props) {
  const state = useState();
  // const combinedEffects = () => {

  // }
  const effects = () => {
    if (!props.shade) return {};
    const merged = mergeProps(props.shade.form.seeds, props.shade.form.effects, props.shade.effects);
    return mapValues(merged, (effect) => {
      if (typeof effect === 'string') {
        return { type: effect, arg: null };
      }
      return effect;
    });
  };

  function setArg(trigger, type, arg) {
    if (arg !== null) {
      state.p.$('ether', 'cave', props.shade.id, 'effects', trigger, { type, arg });
    } else {
      state.p.$('ether', 'cave', props.shade.id, 'effects',
        produce((e) => {
          delete e[trigger];
        })
      );
    }
  }

  function save() {
    Object.entries(effects()).forEach(([trigger, effect]) => {
      state.setShadeEffect(
        props.shade.id,
        trigger,
        effect.arg === null ? effect.type : effect,
      )
    });
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
        return {
          for: {
            ship: '~',
            path: '/',
          },
          at: Number(props.shade.id),
        };
      case 'jump':
        return vec2(state.e.offset);
      default:
        return null;
    }
  }

  function updateShip(ship) {
    props.setArg({
      ...props.arg,
      for: {
        ...props.arg.for,
        ship,
      }
    });
  }
  return (<>
    { props.arg ? <div>
      <Switch>
        <Match when={props.type === 'port'}>
          <input
            use:input
            use:bind={[
              () => props.arg.for.ship,
              updateShip,
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
