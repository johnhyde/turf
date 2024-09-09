import { splitProps } from 'solid-js';
import { useState } from 'stores/state.jsx';
import {
  autofocus,
  bind,
  bindNum,
  input,
  jClone,
  toPairs,
  vecToStr,
} from 'lib/utils.js';
import {
  newEffectArg,
  newFxAction,
  newFxCondition,
  newFxDir,
  newFxDir8,
  newFxItemTarget,
  newFxLocation,
  newFxOffset,
  newFxRootCondition,
  newFxTarget,
} from 'lib/effects.js';
import { EffectEditor } from '@/EffectsEditor.jsx';
import Select from '@/Select.jsx';
import Radio from '@/Radio.jsx';
import PatpInput from '@/PatpInput.jsx';
import PathInput from '@/PathInput.jsx';
import SmallButton from '@/SmallButton.jsx';
import ItemButton from '@/ItemButton.jsx';
import { Group, Indent } from '@/GroupIndent.jsx';
import { ShadeSelectButton } from '@/ShadeSelectButton.jsx';
import { SelectPositionButton } from '@/SelectPositionButton.jsx';
import { ShowShadeButton } from '@/ShowShadeButton.jsx';
import dir from 'assets/icons/dir.png';
import dir8 from 'assets/icons/dir8.png';

const triggerTypes = toPairs(
  'step, leave, moved, bump, interact, click, tell  item trigger, raze  item deleted',
);
const conditionTypes = [
  ...triggerTypes,
  ...toPairs(
    'eq  equals, initiator  initiator type, initiator-eq  initiated by, user-eq  user is, item-exists  item exists, variation, move-collide  moved w/ collision, move-smooth  moved smoothly, loc-eq  locations equal',
  ),
];
const targetTypes = toPairs(
  'this, user, initiator, top-shade-at-loc  item @ location, item, player',
);
const itemTargetTypes = toPairs(
  'this, initiator, top-shade-at-loc  item @ location, item',
);
const locTypes = toPairs(
  'target  entity position, offset  offset position, mover-pos  mover position, absolute  position',
);
const offsetTypes = toPairs(
  'relative  distance, direction, rotate  rotated offset, flip-x  flipped ↔, flip-y  flipped ↕, combine  combined offset, absolute  offset',
);
const dirTypes = toPairs(
  'face, relative, round, rotate, flip-x  flipped ↔, flip-y  flipped ↕, absolute',
);
const dir8Types = toPairs(
  'face, relative-8  relative, round, rotate-8  rotate, flip-x-8  flipped ↔, flip-y-8  flipped ↕, absolute-8  absolute',
);

const radioProps = {
  bg: 'border border-yellow-950',
  bgActive: 'border border-yellow-950 bg-yellow-600',
};

function make$arg(input) {
  return (arg, key) => {
    const [value, $value] = input();
    const type = value.type;
    if (key) {
      $value({ type, arg: { ...value.arg, [key]: arg } });
    } else {
      $value({ type, arg });
    }
  };
}

export function FxCondition(props) {
  const [conProps, restProps] = splitProps(props, [
    'condition',
    '$condition',
  ]);
  const groupTypes = 'or and not'.split(' ');
  const group = () => groupTypes.includes(conProps.condition.type);
  return (
    <Dynamic
      component={group() ? FxConditionGroup : FxConditionItem}
      value={conProps.condition}
      $value={conProps.$condition}
      {...restProps}
    />
  );
}

function getConditionSelector(condition) {
  if (condition.type === 'trigger') {
    if (condition.arg.type === 'move') {
      switch (condition.arg.arg.type) {
        case 'onto':
          return 'step';
        case 'off':
          return 'leave';
        case 'self':
          return 'moved';
        default:
          return 'error';
      }
    }
    return condition.arg.type;
  }
  return condition.type;
}

export function FxConditionItem(props) {
  const newCon = (...args) =>
    props.root ? newFxRootCondition(...args) : newFxCondition(...args);
  const type = () => getConditionSelector(props.value);
  function $type(type) {
    props.$value(newCon(type));
  }
  const $arg = make$arg(() => [props.value, props.$value]);

  function wrapAnd() {
    props.$value(newCon('and', props.value));
  }
  function wrapOr() {
    props.$value(newCon('or', props.value));
  }
  function wrapNot() {
    if (props.root) return;
    props.$value(newCon('not', props.value));
  }

  return (
    <>
      <Show when={props.deleteSelf}>
        <SmallButton onClick={props.deleteSelf}>
          x
        </SmallButton>
      </Show>
      <Select
        value={type()}
        $value={$type}
        options={props.root ? triggerTypes : conditionTypes}
      />
      <Switch>
        <Match when={type() === 'tell'}>
          <input
            use:input
            use:bind={[() => props.value.arg.arg.arg || '', (msg) =>
              $arg({ type: 'eq', arg: msg }, 'arg')]}
            class='rounded-input shrink min-w-0'
          />
        </Match>
        <Match when={type() === 'eq'}>
          <Indent>
            <FxCondition
              condition={props.value.arg.a}
              $condition={(con) =>
                $arg(con, 'a')}
            />
          </Indent>
          <Indent>
            <FxCondition
              condition={props.value.arg.b}
              $condition={(con) => $arg(con, 'b')}
            />
          </Indent>
        </Match>
        <Match when={type() === 'initiator'}>
          <Group>
            <Radio
              value={props.value.arg}
              $value={(v) => $arg(v)}
              items={[['item', 'Item'], ['player', 'Player']]}
              {...radioProps}
            />
          </Group>
        </Match>
        <Match when={type() === 'initiator-eq'}>
          <Group>
            <FxTargetInput value={props.value.arg} $value={$arg} />
          </Group>
        </Match>
        <Match when={type() === 'user-eq'}>
          <PatpInput value={props.value.arg} $validValue={$arg} normalize />
        </Match>
        <Match when={type() === 'item-exists'}>
          <Group>
            <FxItemTargetInput value={props.value.arg} $value={$arg} />
          </Group>
        </Match>
        <Match when={type() === 'variation'}>
          <Indent>
            <FxItemTargetInput
              value={props.value.arg.item}
              $value={(v) => $arg(v, 'item')}
            />
          </Indent>
          <Indent>
            <FxIntRel
              value={props.value.arg.con}
              $value={(v) => $arg(v, 'con')}
            />
          </Indent>
        </Match>
        <Match when={type() === 'move-collide'}>
          <Group>
            <Radio
              value={JSON.stringify(props.value.arg)}
              $value={(v) => $arg(JSON.parse(v))}
              items={[['true', 'With Collision'], ['false', 'Without']]}
              {...radioProps}
            />
          </Group>
        </Match>
        <Match when={type() === 'move-smooth'}>
          <Group>
            <Radio
              value={JSON.stringify(props.value.arg)}
              $value={(v) => $arg(JSON.parse(v))}
              items={[['true', 'Smoothly'], ['false', 'Instantly']]}
              {...radioProps}
            />
          </Group>
        </Match>
        <Match when={type() === 'loc-eq'}>
          <Indent>
            <FxLocationInput
              value={props.value.arg.a}
              $value={(v) => $arg(v, 'a')}
            />
          </Indent>
          <Indent>
            <FxLocationInput
              value={props.value.arg.b}
              $value={(v) => $arg(v, 'b')}
            />
          </Indent>
        </Match>
      </Switch>
      <Show when={!props.root && !props.dontNot}>
        <SmallButton onClick={wrapNot}>
          not
        </SmallButton>
      </Show>
      <SmallButton onClick={wrapAnd}>
        and
      </SmallButton>
      <SmallButton onClick={wrapOr}>
        or
      </SmallButton>
    </>
  );
}

export function FxConditionGroup(props) {
  const type = () => getConditionSelector(props.value);
  const groupStarter = (type) => {
    switch (type) {
      case 'or':
        return 'either';
      case 'and':
        return 'both';
      default:
        return type;
    }
  };
  // function $type(type) {
  //   props.$value(newCon(type));
  // }
  const $arg = make$arg(() => [props.value, props.$value]);
  const newCon = (...args) =>
    props.root ? newFxRootCondition(...args) : newFxCondition(...args);

  function wrapAnd() {
    props.$value(newCon('and', props.value));
  }
  function wrapOr() {
    props.$value(newCon('or', props.value));
  }

  function addCondition(rootAnd = false) {
    if (rootAnd) {
      $arg([...props.value.arg.cons, newFxCondition()], 'cons');
    } else {
      $arg([...props.value.arg, newCon()]);
    }
  }

  function deleteCondition(i, rootAnd = false) {
    const cons = rootAnd ? props.value.arg.cons : props.value.arg;
    const newCons = cons.toSpliced(i, 1);
    if (rootAnd) {
      if (newCons.length === 0) {
        props.$value(jClone(props.value.arg.root));
      } else {
        $arg(newCons, 'cons');
      }
    } else {
      if (newCons.length < 2) {
        props.$value(jClone(newCons[0]));
      } else {
        $arg(newCons);
      }
    }
  }

  function deleteSelf() {
    props.$value(jClone(props.value.arg));
  }

  return (
    <>
      <Show when={props.deleteSelf}>
        <SmallButton onClick={props.deleteSelf}>
          x
        </SmallButton>
      </Show>
      <span class='font-semibold small-caps'>{groupStarter(type())}</span>
      <Switch>
        <Match when={type() === 'and' && props.root}>
          <Indent>
            <FxCondition
              condition={props.value.arg.root}
              $condition={(newRoot) => $arg(newRoot, 'root')}
              root
            />
          </Indent>
          <Index each={props.value.arg.cons}>
            {(con, i) => {
              return (
                <>
                  <span class='font-semibold small-caps'>{type()}</span>
                  <Indent>
                    <FxCondition
                      condition={con()}
                      $condition={(newCon) => {
                        $arg(
                          props.value.arg.cons.toSpliced(i, 1, newCon),
                          'cons',
                        );
                      }}
                      deleteSelf={() => deleteCondition(i, true)}
                    />
                  </Indent>
                </>
              );
            }}
          </Index>
          <SmallButton onClick={[addCondition, true]}>
            +
          </SmallButton>
          <SmallButton onClick={wrapOr}>
            or
          </SmallButton>
        </Match>
        <Match when={type() === 'or' || (type() === 'and' && !props.root)}>
          <Index each={props.value.arg}>
            {(con, i) => {
              return (
                <>
                  <Show when={i !== 0}>
                    <span class='font-semibold small-caps'>{type()}</span>
                  </Show>
                  <Indent>
                    <FxCondition
                      condition={con()}
                      $condition={(newCon) =>
                        $arg(props.value.arg.toSpliced(i, 1, newCon))}
                      root={props.root}
                      deleteSelf={props.value.arg.length > 1
                        ? () => deleteCondition(i)
                        : null}
                    />
                  </Indent>
                </>
              );
            }}
          </Index>
          <SmallButton onClick={[addCondition, false]}>
            +
          </SmallButton>
          <Show
            when={type() === 'or'}
            fallback={
              <SmallButton onClick={wrapOr}>
                or
              </SmallButton>
            }
          >
            <SmallButton onClick={wrapAnd}>
              and
            </SmallButton>
          </Show>
        </Match>
        <Match when={type() === 'not'}>
          <SmallButton onClick={deleteSelf} class='line-through'>
            not
          </SmallButton>
          <FxCondition
            condition={props.value.arg}
            $condition={$arg}
            dontNot
          />
        </Match>
      </Switch>
    </>
  );
}

export function FxIntRel(props) {
  const $arg = make$arg(() => [props.value, props.$value]);
  return (
    <>
      equals:
      <input
        type='number'
        class='rounded-md pl-1'
        min={0}
        max={99}
        use:input
        use:bindNum={[
          () => props.value.arg,
          $arg,
        ]}
      />
    </>
  );
}

export function FxReadInput(props) {
  const state = useState();
  function addAction() {
    props.$value({
      ...props.value,
      actions: [...props.value.actions, newFxAction()],
    });
  }

  return (
    <>
      <Indent>
        <textarea
          class='rounded-input'
          use:input
          use:bind={[
            () => props.value.text,
            (s) => {
              props.$value({ ...props.value, text: s || '' });
              console.log('hm');
            },
          ]}
          placeholder='text or html (tailwind enabled)'
        />
      </Indent>
      <Indent>
        <span>actions</span>
        <Index each={props.value.actions}>
          {(action, i) => {
            function $name(name) {
              const newList = [...props.value.actions];
              newList[i] = { ...newList[i], name };
              props.$value({ ...props.value, actions: newList });
            }
            function $type(type) {
              const newList = [...props.value.actions];
              newList[i] = {
                ...newList[i],
                effect: {
                  type,
                  arg: newEffectArg(type, state.e),
                },
              };
              props.$value({ ...props.value, actions: newList });
            }
            function $arg(arg) {
              const newList = [...props.value.actions];
              newList[i] = {
                ...newList[i],
                effect: {
                  ...newList[i].effect,
                  arg,
                },
              };
              props.$value({ ...props.value, actions: newList });
            }
            function delAction() {
              const newList = [...props.value.actions];
              newList.splice(i(), 1);
              props.$value({ ...props.value, actions: newList });
            }
            return (
              <Indent>
                <Group>
                  <span>name</span>
                  <input
                    use:input
                    use:bind={[
                      () => action().name || '',
                      (name) => $name(name),
                    ]}
                    class='rounded-input shrink min-w-0'
                  />
                </Group>
                <Group>
                  <span>effect</span>
                  <SmallButton onClick={delAction}>
                    x
                  </SmallButton>
                  <EffectEditor
                    type={action().effect.type}
                    arg={action().effect.arg}
                    $type={$type}
                    $arg={$arg}
                    form={props.form}
                  />
                </Group>
              </Indent>
            );
          }}
        </Index>
        <SmallButton onClick={addAction}>
          +
        </SmallButton>
      </Indent>
    </>
  );
}

export function FxMoveInput(props) {
  return (
    <>
      <Group>
        <Radio
          value={JSON.stringify(props.value.smooth)}
          $value={(v) =>
            props.$value({ ...props.value, smooth: JSON.parse(v) })}
          items={[['true', 'Smoothly'], ['false', 'Instantly']]}
          {...radioProps}
        />
      </Group>
      <Group>
        <Radio
          value={JSON.stringify(props.value.collide)}
          $value={(v) =>
            props.$value({ ...props.value, collide: JSON.parse(v) })}
          items={[['true', 'With Collision'], ['false', 'Without']]}
          {...radioProps}
        />
      </Group>
      <Indent>
        <FxTargetInput
          value={props.value.target}
          $value={(t) =>
            props.$value({
              ...props.value,
              target: t,
            })}
        />
      </Indent>
      {/* <Break /> */}
      <Indent>
        <span>to</span>
        <FxLocationInput
          value={props.value.to}
          $value={(t) =>
            props.$value({
              ...props.value,
              to: t,
            })}
        />
      </Indent>
    </>
  );
}

export function FxTellInput(props) {
  return (
    <>
      <Indent>
        <FxItemTargetInput
          value={props.value.target}
          $value={(target) => props.$value({ ...props.value, target })}
        />
      </Indent>
      <Indent>
        message:
        <input
          use:input
          use:bind={[() => props.value.msg || '', (msg) =>
            props.$value({ ...props.value, msg })]}
          class='rounded-input shrink min-w-0'
        />
      </Indent>
    </>
  );
}

export function FxYellInput(props) {
  return (
    <>
      <Indent>
        <span>at</span>
        <FxLocationInput
          value={props.value.loc}
          $value={(loc) => props.$value({ ...props.value, loc })}
        />
      </Indent>
      <Indent>
        message:
        <input
          use:input
          use:bind={[() => props.value.msg || '', (msg) =>
            props.$value({ ...props.value, msg })]}
          class='rounded-input shrink min-w-0'
        />
      </Indent>
    </>
  );
}

export function FxMakeInput(props) {
  return (
    <>
      <Indent>
        <span>item id</span>
        <FormIdInput
          value={props.value.formId}
          $value={(formId) => props.$value({ ...props.value, formId })}
        />
      </Indent>
      <Indent>
        <span>variation</span>
        <input
          type='number'
          class='rounded-md pl-1'
          min={0}
          max={99}
          use:input
          use:bindNum={[
            () => props.value.variation,
            (variation) => props.$value({ ...props.value, variation }),
          ]}
        />
      </Indent>
      <Indent>
        <span>at</span>
        <FxLocationInput
          value={props.value.loc}
          $value={(loc) => props.$value({ ...props.value, loc })}
        />
      </Indent>
    </>
  );
}

export function FxFlowInput(props) {
  return (
    <>
      <Indent>
        <FxItemTargetInput
          value={props.value.target}
          $value={(target) => props.$value({ ...props.value, target })}
        />
      </Indent>
      <Indent>
        <span>collision</span>
        <Radio
          value={JSON.stringify(props.value.collidable)}
          $value={(collidable) =>
            props.$value({
              ...props.value,
              collidable: JSON.parse(collidable),
            })}
          items={[
            ['null', 'Default'],
            ['true', 'On'],
            ['false', 'Off'],
          ]}
          {...radioProps}
        />
      </Indent>
    </>
  );
}

export function FxTargetInput(props) {
  const type = () => props.value?.type ?? props.value;
  function $type(type) {
    props.$value(newFxTarget(type));
  }

  const $arg = make$arg(() => [props.value, props.$value]);
  return (
    <>
      <Select value={type()} $value={$type} options={targetTypes} />
      <Show when={typeof props.value === 'object'}>
        <span>:</span>
      </Show>
      <Show when={type() === 'top-shade-at-loc'}>
        <FxLocationInput value={props.value.arg} $value={$arg} />
      </Show>
      <Show when={type() === 'item'}>
        <ShadeIdInput value={props.value.arg} $value={$arg} />
      </Show>
      <Show when={type() === 'player'}>
        <span>{props.value.arg}</span>
        <PatpInput value={props.value.arg} $validValue={$arg} normalize />
      </Show>
    </>
  );
}

export function FxItemTargetInput(props) {
  const type = () => props.value?.type ?? props.value;
  function $type(type) {
    props.$value(newFxItemTarget(type));
  }

  const $arg = make$arg(() => [props.value, props.$value]);
  return (
    <>
      <Select value={type()} $value={$type} options={itemTargetTypes} />
      <Show when={typeof props.value === 'object'}>
        <span>:</span>
      </Show>
      <Show when={type() === 'top-shade-at-loc'}>
        <FxLocationInput value={props.value.arg} $value={$arg} />
      </Show>
      <Show when={type() === 'item'}>
        <ShadeIdInput value={props.value.arg} $value={$arg} />
      </Show>
    </>
  );
}

export function FxLocationInput(props) {
  const type = () => props.value?.type;
  function $type(type) {
    return props.$value(newFxLocation(type));
  }

  const $arg = make$arg(() => [props.value, props.$value]);
  return (
    <>
      <Select value={type()} $value={$type} options={locTypes} />
      <span>:</span>
      <Switch>
        <Match when={type() === 'target'}>
          <FxTargetInput value={props.value?.arg} $value={$arg} />
        </Match>
        <Match when={type() === 'offset'}>
          <Indent>
            <span>from</span>
            <FxLocationInput
              value={props.value?.arg.loc}
              $value={(v) => $arg(v, 'loc')}
            />
          </Indent>
          <Indent>
            <span>by</span>
            <FxOffsetInput
              value={props.value?.arg.offset}
              $value={(v) => $arg(v, 'offset')}
            />
          </Indent>
        </Match>
        <Match when={type() === 'mover-pos'}>
          <Select
            value={props.value?.arg}
            $value={$arg}
            options={toPairs('start, end')}
          />
        </Match>
        <Match when={type() === 'absolute'}>
          <PositionInput value={props.value?.arg} $value={$arg} />
        </Match>
      </Switch>
    </>
  );
}

export function FxOffsetInput(props) {
  const type = () => props.value?.type;
  function $type(type) {
    return props.$value(newFxOffset(type));
  }
  const $arg = make$arg(() => [props.value, props.$value]);
  return (
    <>
      <Select value={type()} $value={$type} options={offsetTypes} />
      <span>:</span>

      <Switch>
        <Match when={type() === 'relative'}>
          <Indent>
            <span>from</span>
            <FxLocationInput
              value={props.value.arg.from}
              $value={(v) => $arg(v, 'from')}
            />
          </Indent>
          <Indent>
            <span>to</span>
            <FxLocationInput
              value={props.value.arg.to}
              $value={(v) => $arg(v, 'to')}
            />
          </Indent>
        </Match>
        <Match when={type() === 'direction'}>
          <Indent>
            <span>distance</span>
            <input
              type='number'
              class='rounded-md pl-1'
              min='0'
              max={Math.max(state.e.size.x, state.e.size.y) - 1}
              use:input
              use:bindNum={[
                () => props.value.arg.distance,
                (distance) => $arg({ ...props.value.arg, distance }),
              ]}
            />
          </Indent>
          <Indent>
            <FxDir8Input
              value={props.value.arg.dir}
              $value={(v) => $arg(v, 'dir')}
            />
          </Indent>
        </Match>
        <Match when={type() === 'rotate'}>
          <Indent>
            <FxOffsetInput
              value={props.value.arg.offset}
              $value={(v) => $arg(v, 'offset')}
            />
          </Indent>
          <Indent>
            <span>by</span>
            <FxDirInput
              value={props.value.arg.rotation}
              $value={(v) => $arg(v, 'rotation')}
            />
          </Indent>
        </Match>
        <Match when={type().startsWith('flip')}>
          {
            /* <FxOffsetInput
            value={props.value.arg}
            $value={$arg}
          />
        </Match>
        <Match when={type() === 'flip-y'}> */
          }
          <FxOffsetInput
            value={props.value.arg}
            $value={$arg}
          />
        </Match>
        <Match when={type() === 'combine'}>
          <Indent>
            <span>#1</span>
            <FxOffsetInput
              value={props.value.arg.a}
              $value={(v) => $arg(v, 'a')}
            />
          </Indent>
          <Indent>
            <span>#2</span>
            <FxOffsetInput
              value={props.value.arg.b}
              $value={(v) => $arg(v, 'b')}
            />
          </Indent>
        </Match>
        <Match when={type() === 'absolute'}>
          <TileOffsetInput value={props.value.arg} $value={$arg} />
        </Match>
      </Switch>
    </>
  );
}

export function FxDirInput(props) {
  const type = () => props.value?.type;
  function $type(type) {
    return props.$value(newFxDir(type));
  }
  const $arg = make$arg(() => [props.value, props.$value]);
  return (
    <>
      <img src={dir} class='w-4 h-4 my-0.5' />
      <Select value={type()} $value={$type} options={dirTypes} />
      <span>:</span>

      <Switch>
        <Match when={type() === 'face'}>
          <FxTargetInput value={props.value?.arg} $value={$arg} />
        </Match>
        <Match when={type() === 'relative'}>
          <Indent>
            <span>round diagonals</span>
            <Select
              value={props.value.arg.round}
              $value={(v) => $arg(v, 'round')}
              options={toPairs('ud  up-down, lr  left-right')}
            />
          </Indent>
          <Indent>
            <span>from</span>
            <FxLocationInput
              value={props.value.arg.from}
              $value={(v) => $arg(v, 'from')}
            />
          </Indent>
          <Indent>
            <span>to</span>
            <FxLocationInput
              value={props.value.arg.to}
              $value={(v) => $arg(v, 'to')}
            />
          </Indent>
        </Match>
        <Match when={type() === 'round'}>
          <FxRoundDir8 value={props.value} $value={props.$value} />
        </Match>
        <Match when={type() === 'rotate'}>
          <Indent>
            <FxDirInput
              value={props.value.arg.a}
              $value={(v) => $arg(v, 'a')}
            />
          </Indent>
          <Indent>
            <span>by</span>
            <FxDirInput
              value={props.value.arg.b}
              $value={(v) => $arg(v, 'b')}
            />
          </Indent>
        </Match>
        <Match when={type() === 'flip-x' || type() === 'flip-y'}>
          <FxDirInput
            value={props.value.arg}
            $value={$arg}
          />
        </Match>
        <Match when={type() === 'absolute'}>
          <Select
            value={props.value.arg}
            $value={$arg}
            options={toPairs('down, right, up, left')}
          />
        </Match>
      </Switch>
    </>
  );
}

export function FxRoundDir8(props) {
  const $arg = make$arg(() => [props.value, props.$value]);
  return (
    <>
      <Indent>
        <span>round diagonals</span>
        <Select
          value={props.value.arg.round}
          $value={(v) => $arg(v, 'round')}
          options={toPairs('ud  up-down, lr  left-right')}
        />
      </Indent>
      <Indent>
        <FxDir8Input
          value={props.value.arg.dir}
          $value={(v) => $arg(v, 'dir')}
        />
      </Indent>
    </>
  );
}

export function FxDir8Input(props) {
  const type = () => props.value?.type;
  function $type(type) {
    return props.$value(newFxDir8(type));
  }
  const $arg = make$arg(() => [props.value, props.$value]);
  return (
    <>
      <img src={dir8} class='w-4 h-4 my-0.5' />
      <Select value={type()} $value={$type} options={dir8Types} />
      <span>:</span>

      <Switch>
        <Match when={type() === 'face'}>
          <FxTargetInput value={props.value.arg} $value={$arg} />
        </Match>
        <Match when={type() === 'relative-8'}>
          <Indent>
            <span>from</span>
            <FxLocationInput
              value={props.value.arg.from}
              $value={(v) => $arg(v, 'from')}
            />
          </Indent>
          <Indent>
            <span>to</span>
            <FxLocationInput
              value={props.value.arg.to}
              $value={(v) => $arg(v, 'to')}
            />
          </Indent>
        </Match>
        <Match when={type() === 'round'}>
          <FxRoundDir8 value={props.value} $value={props.$value} />
        </Match>
        <Match when={type() === 'rotate-8'}>
          <Indent>
            <FxDir8Input
              value={props.value.arg.a}
              $value={(v) => $arg(v, 'a')}
            />
          </Indent>
          <Indent>
            <span>by</span>
            <FxDir8Input
              value={props.value.arg.b}
              $value={(v) => $arg(v, 'b')}
            />
          </Indent>
        </Match>
        <Match when={type() === 'flip-x-8' || type() === 'flip-y-8'}>
          <FxDir8Input
            value={props.value.arg}
            $value={$arg}
          />
        </Match>
        <Match when={type() === 'absolute-8'}>
          <Select
            value={props.value.arg}
            $value={$arg}
            options={toPairs(
              'down, dr  down-right, right, ur  up-right, up, ul  up-left, left, dl  down-left',
            )}
          />
        </Match>
      </Switch>
    </>
  );
}

export function ShadeIdInput(props) {
  const state = useState();
  return (
    <>
      <input
        type='number'
        class={'rounded-md pl-1' +
          (!state.e.cave[props.value] ? ' bg-orange-200' : '')}
        min='0'
        max={state.e.stuffCounter - 1}
        use:input
        use:bindNum={[
          () => props.value,
          props.$value,
        ]}
      />
      <ShadeSelectButton onShadeId={props.$value} />
      <ShowShadeButton id={props.value} showByDefault />
    </>
  );
}

export function FormIdInput(props) {
  const state = useState();
  return (
    <>
      <PathInput
        value={props.value}
        $validValue={(p) => props.$value(p)}
        warn={!state.e.skye[props.value]}
      />
      <Show when={state.e.skye[props.value]}>
        <ItemButton form={state.e.skye[props.value]} />
      </Show>
    </>
  );
}

export function PositionInput(props) {
  const state = useState();

  return (
    <>
      <Group>
        <span>x:</span>
        <input
          type='number'
          class='rounded-md pl-1'
          min={state.e.offset.x}
          max={state.e.offset.x + state.e.size.x - 1}
          use:input
          use:bindNum={[
            () => props.value.x,
            (n) => props.$value(vec2(n, props.value.y)),
          ]}
        />
      </Group>
      <Group>
        <span>y:</span>
        <input
          type='number'
          class='rounded-md pl-1'
          min={state.e.offset.y}
          max={state.e.offset.y + state.e.size.y - 1}
          use:input
          use:bindNum={[
            () => props.value.y,
            (n) => props.$value(vec2(props.value.x, n)),
          ]}
        />
      </Group>
      <SelectPositionButton onPos={props.$value} />
      <ShowShadeButton id={vecToStr(props.value)} showByDefault />
    </>
  );
}

export function TileOffsetInput(props) {
  return (
    <>
      <Group>
        <span>x:</span>
        <input
          type='number'
          class='rounded-md pl-1'
          min={1 - state.e.size.x}
          max={state.e.size.x - 1}
          use:input
          use:bindNum={[
            () => props.value.x,
            (n) => props.$value(vec2(n, props.value.y)),
          ]}
        />
      </Group>
      <Group>
        <span>y:</span>
        <input
          type='number'
          class='rounded-md pl-1'
          min={1 - state.e.size.y}
          max={state.e.size.y - 1}
          use:input
          use:bindNum={[
            () => props.value.y,
            (n) => props.$value(vec2(props.value.x, n)),
          ]}
        />
      </Group>
    </>
  );
}
