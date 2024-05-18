import { useState } from 'stores/state.jsx';
import { bindNum, input, toPairs, vecToStr } from 'lib/utils.js';
import {
  newFxDir,
  newFxDir8,
  newFxLocation,
  newFxOffset,
  newFxTarget,
} from 'lib/effects.js';
import Select from '@/Select.jsx';
import PatpInput from '@/PatpInput.jsx';
// import SmallButton from '@/SmallButton.jsx';
import { ShadeSelectButton } from '@/ShadeSelectButton.jsx';
import { SelectPositionButton } from '@/SelectPositionButton.jsx';
import { ShowShadeButton } from '@/ShowShadeButton.jsx';

const targetTypes = toPairs('this, user, item, player');
const locTypes = toPairs(
  'target  entity position, offset  offset position, absolute  position',
);
const offsetTypes = toPairs(
  'relative  distance, direction, rotate  rotated offset, flip-x  flipped ↔, flip-y  flipped ↕, combine  combined offset, absolute  offset',
);
const dirTypes = toPairs(
  'face, relative, round, rotate, flip-x, flip-y, absolute',
);
const dir8Types = toPairs(
  'relative-8, rotate-8, flip-x-8, flip-y-8, absolute-8',
);

function Break() {
  return <span class='w-full' />;
}

function Group(props) {
  return (
    <div
      class={'flex flex-wrap gap-1' + ' ' +
        (props.class || '')}
      style={props.style}
    >
      {props.children}
    </div>
  );
}

function Indent(props) {
  return (
    <Group
      class={'border-l border-yellow-950 rounded-l-sm pl-1' + ' ' +
        (props.class || '')}
      style={props.style}
    >
      {props.children}
    </Group>
  );
}

export function FxMoveInput(props) {
  return (
    <>
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

export function FxTargetInput(props) {
  const type = () => props.value?.type ?? props.value;
  function $type(type) {
    props.$value(newFxTarget(type));
  }

  function $arg(arg) {
    props.$value({ type: type(), arg });
  }
  return (
    <>
      <Select value={type()} $value={$type} options={targetTypes} />
      <Show when={typeof props.value === 'object'}>
        <span>:</span>
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

export function FxLocationInput(props) {
  const type = () => props.value?.type;
  function $type(type) {
    return props.$value(newFxLocation(type));
  }

  function $arg(arg) {
    props.$value({ type: type(), arg });
  }
  function $offset(offset) {
    $arg({
      ...props.value.arg,
      offset,
    });
  }
  function $loc(loc) {
    $arg({
      ...props.value.arg,
      loc,
    });
  }
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
            <FxLocationInput value={props.value?.arg.loc} $value={$loc} />
          </Indent>
          <Indent>
            <span>by</span>
            <FxOffsetInput value={props.value?.arg.offset} $value={$offset} />
          </Indent>
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
  function $arg(arg) {
    props.$value({ type: type(), arg });
  }
  return (
    <>
      <Select value={type()} $value={$type} options={offsetTypes} />
      <span>:</span>

      <Switch>
        <Match when={type() === 'relative'}>
        </Match>
        <Match when={type() === 'direction'}>
          <Indent>
            <FxDirInput
              value={props.value.arg.dir}
              $value={(dir) => $arg({ ...props.value.arg, dir })}
            />
          </Indent>
          <Indent>
            <input
              type='number'
              class='rounded-md pl-1'
              min='0'
              max={Math.max(state.e.size.x, state.e.size.y) - 1}
              use:input
              use:bindNum={[
                () => props.value.arg.distance,
                (distance) => props.$arg({ ...props.value.arg, distance }),
              ]}
            />
          </Indent>
        </Match>
        <Match when={type() === 'rotate'}>
          <Indent>
            <FxOffsetInput
              value={props.value.arg.offset}
              $value={(offset) => $arg({ ...props.value.arg, offset })}
            />
          </Indent>
          <Indent>
            <span>by rotation</span>
            <FxDirInput
              value={props.value.arg.rotation}
              $value={(rotation) => $arg({ ...props.value.arg, rotation })}
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
            <span>
              #1
            </span>
            <FxOffsetInput
              value={props.value.arg.a}
              $value={(a) => $arg({ ...props.value.arg, a })}
            />
          </Indent>
          <Indent>
            <span>
              #2
            </span>
            <FxOffsetInput
              value={props.value.arg.b}
              $value={(b) => $arg({ ...props.value.arg, b })}
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
  function $arg(arg) {
    props.$value({ type: type(), arg });
  }
  return (
    <>
      <Select value={type()} $value={$type} options={dirTypes} />
      <span>:</span>

      <Switch>
        <Match when={type() === 'face'}>
        </Match>
        <Match when={type() === 'relative'}>
        </Match>
        <Match when={type() === 'round'}>
        </Match>
        <Match when={type() === 'rotate'}>
        </Match>
        <Match when={type() === 'flip-x'}>
        </Match>
        <Match when={type() === 'flip-y'}>
        </Match>
        <Match when={type() === 'absolute'}>
        </Match>
      </Switch>
    </>
  );
}

export function FxDir8Input(props) {
  const type = () => props.value?.type;
  function $type(type) {
    return props.$value(newFxDir8(type));
  }
  function $arg(arg) {
    props.$value({ type: type(), arg });
  }
  return (
    <>
      <Select value={type()} $value={$type} options={dir8Types} />
      <span>:</span>

      <Switch>
        <Match when={type() === 'relative-8'}>
        </Match>
        <Match when={type() === 'rotate-8'}>
        </Match>
        <Match when={type() === 'flip-x-8'}>
        </Match>
        <Match when={type() === 'flip-y-8'}>
        </Match>
        <Match when={type() === 'absolute-8'}>
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
