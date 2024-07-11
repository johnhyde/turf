import { batch, createSignal } from 'solid-js';
import { produce, reconcile } from 'solid-js/store';
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
import { newFxMove, newFxRead, newFxTell, newReflex } from 'lib/effects.js';
import { Group, Indent } from '@/GroupIndent.jsx';
import ListItemPicker from '@/ListItemPicker.jsx';
import SmallButton from '@/SmallButton.jsx';
import ItemButton from '@/ItemButton.jsx';
import Select from '@/Select.jsx';
import PathInput from '@/PathInput.jsx';
import Radio from '@/Radio.jsx';
import { FxCondition, FxMoveInput, FxTellInput } from '@/FxInputs.jsx';

const effectTypes = toPairs(
  'list  multiple, port  teleport, read  show text, swap  replace item, ' +
    'seem  show variation, vary  change variation, move, tell  trigger item',
);

function defaultArg(type, turf) {
  switch (type) {
    case 'list':
      return {
        serial: 'simult',
        effects: [{ type: '', arg: null }],
      };
    case 'port':
      return '';
    case 'read':
      return newFxRead();
    case 'swap':
      return '/';
    case 'seem':
    case 'vary':
      return 0;
    case 'move':
      return newFxMove();
    case 'tell':
      return newFxTell();
    default:
      return null;
  }
}

export default function EffectsEditor(props) {
  // props.fx, props.$fx

  // const noEmptyEffect = () => props.fx[''] == null;

  function addEmptyEffect() {
    // if (noEmptyEffect()) {
    //   setArg('', '', null);
    // }
    props.$fx((fx) => [...fx, newReflex()]);
  }

  function setArg(index, type, arg) {
    // props.$fx(trigger, reconcile({ type, arg }));
    if (index >= props.fx.length) return;
    props.$fx(index, 'effect', () => {
      return { type, arg };
    });
  }

  return (
    <>
      <div class='flex flex-col divide-y divide-yellow-950'>
        <For each={props.fx}>
          {(reflex, i) => {
            const root = () => reflex.root;
            const effect = () => reflex.effect;

            function delReflex() {
              props.$fx(produce((fx) => fx.splice(i(), 1)));
            }

            function $root(newRoot) {
              props.$fx(i(), 'root', () => newRoot);
            }

            function $type(type) {
              setArg(i(), type, defaultArg(type, state.e));
            }

            function $arg(arg) {
              setArg(i(), effect().type, arg);
            }

            return (
              <Show when={effect() != null}>
                {/* <div class='w-full py-2 flex gap-2 items-start'> */}
                <div class='w-full py-2 flex flex-wrap items-center gap-1 mb-1'>
                  {/* <div>{JSON.stringify(root(), null, 2)}</div> */}
                  {
                    /* <div>
                  {JSON.stringify(effect(), null, 2)}
                </div> */
                  }
                  <div className='w-full flex gap-2 items-start'>
                    <div class='grow flex flex-wrap items-center gap-1 mb-1'>
                      <p>when</p>
                      <Group>
                        <FxCondition
                          condition={root()}
                          $condition={$root}
                          root
                        />
                      </Group>
                    </div>
                    <SmallButton
                      onClick={delReflex}
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
                  />
                </div>
                {/* </div> */}
              </Show>
            );
          }}
        </For>
      </div>
      <SmallButton onClick={addEmptyEffect}>New Effect</SmallButton>
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
                        serial: v,
                      })}
                    items={[
                      ['serial', 'Serial'],
                      ['simult', 'Simultaneous'],
                      ['atomic', 'Atomic'],
                    ]}
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
                      () => props.arg.note,
                      (s) => props.$arg({ ...props.arg, note: s || '' }),
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
                <Match when={props.type === 'tell'}>
                  <FxTellInput value={props.arg} $value={props.$arg} />
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
