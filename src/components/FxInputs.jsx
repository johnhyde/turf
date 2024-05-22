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
import { Group, Indent } from '@/GroupIndent.jsx';
import { ShadeSelectButton } from '@/ShadeSelectButton.jsx';
import { SelectPositionButton } from '@/SelectPositionButton.jsx';
import { ShowShadeButton } from '@/ShowShadeButton.jsx';
import dir from 'assets/icons/dir.png';
import dir8 from 'assets/icons/dir8.png';

const targetTypes = toPairs('this, user, item, player');
const locTypes = toPairs(
  'target  entity position, offset  offset position, absolute  position',
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

  const $arg = make$arg(() => [props.value, props.$value]);
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
              $value={(v) => $arg(v, a)}
            />
          </Indent>
          <Indent>
            <span>#2</span>
            <FxOffsetInput
              value={props.value.arg.b}
              $value={(v) => $arg(v, b)}
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
