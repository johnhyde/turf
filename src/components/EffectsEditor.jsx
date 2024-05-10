import { batch, createSignal } from 'solid-js';
import { useState } from 'stores/state.jsx';
import {
  autofocus,
  bind,
  bindNum,
  input,
  jClone,
  turfIdToName,
  vec2,
} from 'lib/utils.js';
import SmallButton from '@/SmallButton.jsx';
import ItemButton from '@/ItemButton.jsx';
import PathInput from '@/PathInput.jsx';

function toPairs(str) {
  return str.split(', ').map((t) => t.split('  ')).map((p) => {
    if (p.length === 1) return [...p, ...p];
    return p;
  });
}
// todo bump
const triggers = toPairs('step, leave, interact, click');
// todo: swap
const effectTypes = toPairs(
  'port  teleport, jump, read  show text, swap  change base item',
);

function defaultArg(type, turf) {
  switch (type) {
    case 'port':
    case 'read':
      return '';
    case 'jump':
      return vec2(turf.offset);
    case 'swap':
      return '/';
    case 'seem':
    case 'vary':
      return 0;
    default:
      return null;
  }
}

export default function EffectsEditor(props) {
  // props.effects, props.$effects

  const noEmptyEffect = () => props.effects[''] == null;

  function addEmptyEffect() {
    if (noEmptyEffect()) {
      setArg('', '', null);
    }
  }

  function setArg(trigger, type, arg) {
    props.$effects(trigger, { type, arg });
  }

  return (
    <>
      <div class='flex flex-col divide-y divide-yellow-950'>
        <Index each={Object.entries(props.effects)}>
          {(item) => {
            const trigger = () => item()[0];
            const effect = () => item()[1];

            function clearEffect() {
              props.$effects(trigger(), null);
            }

            function $trigger(newTrigger) {
              batch(() => {
                clearEffect();
                props.$effects(newTrigger, effect());
              });
            }

            function $type(type) {
              setArg(trigger(), type, defaultArg(type, state.e));
            }

            return (
              <Show when={effect() != null}>
                <div class='py-2 flex gap-2 items-start'>
                  <div>
                    <div class='flex flex-wrap items-center gap-1 mb-1'>
                      <div class='flex gap-1 items-center'>
                        <span>on</span>
                        <TriggerSelector
                          trigger={trigger()}
                          $trigger={$trigger}
                        />
                      </div>
                      <div class='flex gap-1 items-center'>
                        <span>do</span>
                        <EffectTypeSelector
                          type={effect().type}
                          $type={$type}
                        />
                      </div>
                    </div>
                    <ArgInput
                      type={effect().type}
                      arg={effect().arg}
                      $arg={(arg) => setArg(trigger(), effect().type, arg)}
                      allowSeeds={props.allowSeeds}
                    />
                  </div>
                  <SmallButton
                    onClick={clearEffect}
                    class=''
                  >
                    x
                  </SmallButton>
                </div>
              </Show>
            );
          }}
        </Index>
      </div>
      <Show when={noEmptyEffect()}>
        <SmallButton onClick={addEmptyEffect}>new effect</SmallButton>
      </Show>
    </>
  );
}

function TriggerSelector(props) {
  return (
    <select
      value={props.trigger}
      onChange={(e) => props.$trigger(e.target.value)}
      class='rounded-md'
    >
      <For each={triggers}>
        {([trigger, label]) => {
          return (
            <option value={trigger}>
              {label}
            </option>
          );
        }}
      </For>
    </select>
  );
}

function EffectTypeSelector(props) {
  return (
    <select
      value={props.type}
      onChange={(e) => props.$type(e.target.value)}
      class='rounded-md'
    >
      <option value=''>nothing</option>
      <For each={effectTypes}>
        {([type, label]) => {
          return (
            <option value={type}>
              {label}
            </option>
          );
        }}
      </For>
    </select>
  );
}

function ArgInput(props) {
  const state = useState();

  function updatePortal(portalId) {
    portalId = Number.parseInt(portalId);
    if (Number.isNaN(portalId)) {
      props.$arg('');
    } else {
      props.$arg(portalId);
    }
  }
  return (
    <>
      <Show when={props.type !== ''}>
        <div class='flex items-center gap-x-2'>
          {props.arg === null
            ? (
              <SmallButton
                onClick={[props.$arg, defaultArg(props.type, state.e)]}
              >
                configure effect
              </SmallButton>
            )
            : (
              <>
                <Switch>
                  <Match when={props.type === 'port'}>
                    <span>to</span>
                    <select
                      value={props.arg}
                      onChange={(e) => updatePortal(e.target.value)}
                    >
                      <For each={Object.entries(state.e.portals)}>
                        {([portalId, portal]) => {
                          return (
                            <option value={portalId}>
                              {turfIdToName(portal.for)}
                            </option>
                          );
                        }}
                      </For>
                    </select>
                  </Match>
                  <Match when={props.type === 'read'}>
                    <textarea
                      class='rounded-input max-w-[160px]'
                      use:autofocus
                      use:input
                      use:bind={[
                        () => props.arg,
                        (s) => props.$arg(s || ''),
                      ]}
                    />
                  </Match>
                  <Match when={props.type === 'jump'}>
                    <span>to x:</span>
                    <input
                      type='number'
                      class='rounded-md pl-1'
                      min={state.e.offset.x}
                      max={state.e.offset.x + state.e.size.x - 1}
                      use:input
                      use:bindNum={[
                        () => props.arg.x,
                        (n) => props.$arg(vec2(n, props.arg.y)),
                      ]}
                    />
                    <span>y:</span>
                    <input
                      type='number'
                      class='rounded-md pl-1'
                      min={state.e.offset.y}
                      max={state.e.offset.y + state.e.size.y - 1}
                      use:input
                      use:bindNum={[
                        () => props.arg.y,
                        (n) => props.$arg(vec2(props.arg.x, n)),
                      ]}
                    />
                  </Match>
                  <Match when={props.type === 'swap'}>
                    <PathInput
                      value={props.arg}
                      $validValue={(p) => props.$arg(p)}
                      warn={!state.e.skye[props.arg]}
                    />
                    <Show when={state.e.skye[props.arg]}>
                      <ItemButton form={state.e.skye[props.arg]} />
                    </Show>
                  </Match>
                </Switch>
                <Show when={props.allowSeeds}>
                  <SmallButton onClick={[props.$arg, null]}>
                    x
                  </SmallButton>
                </Show>
              </>
            )}
        </div>
      </Show>
    </>
  );
}
