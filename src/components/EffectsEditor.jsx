import { batch, createSignal } from 'solid-js';
import { reconcile } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import {
  autofocus,
  bind,
  bindNum,
  input,
  jClone,
  toPairs,
  turfIdToName,
  vec2,
} from 'lib/utils.js';
import { newFxLocation, newFxTarget } from 'lib/effects.js';
import { Indent } from '@/GroupIndent.jsx';
import ListItemPicker from '@/ListItemPicker.jsx';
import SmallButton from '@/SmallButton.jsx';
import ItemButton from '@/ItemButton.jsx';
import Select from '@/Select.jsx';
import PathInput from '@/PathInput.jsx';
import Radio from '@/Radio.jsx';
import { FxMoveInput, PositionInput } from '@/FxInputs.jsx';

// todo bump
const triggers = toPairs('step, leave, interact, click');
// todo: swap
const effectTypes = toPairs(
  'list  multiple, port  teleport, jump, read  show text, swap  replace item, seem  show variation, vary  change variation, move',
);

function defaultArg(type, turf) {
  switch (type) {
    case 'list':
      return {
        serial: false,
        effects: [{ type: '', arg: null }],
      };
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
    case 'move':
      return {
        target: newFxTarget(),
        to: newFxLocation(),
      };
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
    props.$effects(trigger, reconcile({ type, arg }));
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

            function $arg(arg) {
              setArg(trigger(), effect().type, arg);
            }

            return (
              <Show when={effect() != null}>
                {/* <div class='w-full py-2 flex gap-2 items-start'> */}
                <div class='w-full py-2 flex flex-wrap items-center gap-1 mb-1'>
                  <div className='w-full flex gap-2 items-start'>
                    <div class='grow flex gap-1 items-center'>
                      <span>on</span>
                      <TriggerSelector
                        trigger={trigger()}
                        $trigger={$trigger}
                      />
                    </div>
                    <SmallButton
                      onClick={clearEffect}
                      class=''
                    >
                      x
                    </SmallButton>
                  </div>
                  <EffectEditor
                    type={effect().type}
                    arg={effect().arg}
                    $type={$type}
                    $arg={$arg}
                    form={props.form}
                    allowSeeds={props.allowSeeds}
                  />
                </div>
                {/* </div> */}
              </Show>
            );
          }}
        </Index>
      </div>
      <Show when={noEmptyEffect()}>
        <SmallButton onClick={addEmptyEffect}>New Effect</SmallButton>
      </Show>
    </>
  );
}

function EffectEditor(props) {
  return (
    <>
      <div class='flex gap-1 items-center'>
        <span>do</span>
        <EffectTypeSelector
          type={props.type}
          $type={props.$type}
        />
      </div>
      <ArgInput
        type={props.type}
        arg={props.arg}
        $arg={props.$arg}
        form={props.form}
        allowSeeds={props.allowSeeds}
      />
    </>
  );
}

function TriggerSelector(props) {
  return (
    <Select value={props.trigger} $value={props.$trigger} options={triggers} />
  );
}

function EffectTypeSelector(props) {
  return (
    <Select
      value={props.type}
      $value={props.$type}
      options={[['', 'nothing'], ...effectTypes]}
    />
  );
}

function ArgInput(props) {
  const state = useState();
  const notGarb = () => props.form?.type !== 'garb';

  function addListEffect() {
    const list = props.arg.effects.length ? props.arg.effects : [];
    props.$arg({
      ...props.arg,
      effects: [...list, { type: '', arg: null }],
    });
  }

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
        {/* <div class='flex items-center gap-x-2'> */}
        {props.arg === null
          ? (
            <SmallButton
              onClick={[props.$arg, defaultArg(props.type, state.e)]}
            >
              Configure Effect
            </SmallButton>
          )
          : (
            <>
              <Switch>
                <Match when={props.type === 'list'}>
                  <Radio
                    value={props.arg.serial}
                    $value={(v) =>
                      props.$arg({
                        ...props.arg,
                        serial: JSON.parse(v),
                      })}
                    items={[[true, 'Serial'], [false, 'Simultaneous']]}
                    bg='border border-yellow-950'
                    bgActive='border border-yellow-950 bg-yellow-600'
                  />
                  <For each={props.arg.effects}>
                    {(effect, i) => {
                      function $type(type) {
                        const newList = [...props.arg.effects];
                        newList[i()] = { type, arg: defaultArg(type, state.e) };
                        props.$arg({ ...props.arg, effects: newList });
                      }
                      function $arg(arg) {
                        const newList = [...props.arg.effects];
                        newList[i()] = { ...newList[i()], arg };
                        props.$arg({ ...props.arg, effects: newList });
                      }
                      function delEffect() {
                        const newList = [...props.arg.effects];
                        newList.splice(i(), 1);
                        props.$arg({ ...props.arg, effects: newList });
                      }
                      return (
                        <Indent>
                          <SmallButton onClick={delEffect}>
                            x
                          </SmallButton>
                          <EffectEditor
                            type={effect.type}
                            arg={effect.arg}
                            $type={$type}
                            $arg={$arg}
                            form={props.form}
                            allowSeeds={props.allowSeeds}
                          />
                        </Indent>
                      );
                    }}
                  </For>
                  <SmallButton onClick={addListEffect}>
                    +
                  </SmallButton>
                </Match>
                <Match when={props.type === 'port'}>
                  <span>to</span>
                  <Select
                    value={props.arg}
                    $value={updatePortal}
                    options={Object.entries(state.e.portals).map(
                      ([portalId, portal]) => {
                        return [portalId, turfIdToName(portal.for)];
                      },
                    )}
                  />
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
                  <div class='grow' />
                  <span>to</span>
                  <PositionInput value={props.arg} $value={props.$arg} />
                  {
                    /* <span>to x:</span>
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
                  /> */
                  }
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
                <Match when={props.type === 'seem' || props.type === 'vary'}>
                  <ListItemPicker
                    wall={props.form.type === 'wall'}
                    items={props.form.variations}
                    selected={props.arg}
                    button={(label, i, selected) => {
                      let bodyVar = i % 4;
                      if (bodyVar === 3) bodyVar = 1;
                      return (
                        <div className='relative'>
                          <ItemButton
                            onClick={() => props.$arg(i)}
                            selected={selected}
                            form={props.form}
                            variation={i}
                            playerImage={!notGarb() &&
                              `sprites/garb/body-${bodyVar}-0.png`}
                            bgImage={notGarb() &&
                              'sprites/grass.png'}
                            flipBg={i % 4 === 3}
                          />
                          <SmallButton
                            class='absolute top-1 left-1 bg-opacity-50 z-[20] pointer-events-none'
                            tabindex='-1'
                          >
                            {label}
                          </SmallButton>
                        </div>
                      );
                    }}
                  />
                </Match>
                <Match when={props.type === 'move'}>
                  <FxMoveInput value={props.arg} $value={props.$arg} />
                </Match>
              </Switch>
              <Show when={props.allowSeeds}>
                <SmallButton onClick={[props.$arg, null]}>
                  x
                </SmallButton>
              </Show>
            </>
          )}
        {/* </div> */}
      </Show>
    </>
  );
}
