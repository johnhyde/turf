import { bindNum, input, toPairs } from 'lib/utils.js';
import Select from '@/Select.jsx';
import PatpInput from '@/PatpInput.jsx';

const targetTypes = toPairs('this, user, item, player');

export function FxMoveInput(props) {
  return (
    <>
      <FxTargetInput
        value={props.value.target}
        $value={(t) =>
          props.$value({
            ...props.value,
            target: t,
          })}
      />
      <FxLocationInput
        value={props.value.to}
        $value={(t) =>
          props.$value({
            ...props.value,
            to: t,
          })}
      />
    </>
  );
}

export function FxTargetInput(props) {
  const type = () => props.value?.type ?? props.value;
  function $type(type) {
    switch (type) {
      case 'this':
      case 'user':
        props.$value(type);
        break;
      default: // item & player
        props.$value({
          type,
          arg: null,
        });
    }
  }

  function $arg(arg) {
    // if (type() === 'player') {
    //   if (!isValidPatp(arg)) return;
    // }
    props.$value({
      type: type(),
      arg,
    });
  }
  return (
    <>
      <Select value={type()} $value={$type} options={targetTypes} />
      <Show when={typeof props.value === 'object'}>
        <span>:</span>
        <span>{props.value.arg}</span>
      </Show>
      <Show when={type() === 'item'}>
        <input
          type='number'
          class='rounded-md pl-1'
          min='0'
          max={state.e.stuffCounter - 1}
          use:input
          use:bindNum={[
            () => props.value.arg,
            $arg,
          ]}
        />
      </Show>
      <Show when={type() === 'player'}>
        <PatpInput value={props.value.arg} $validValue={$arg} normalize />
      </Show>
    </>
  );
}

export function FxLocationInput(props) {
  return null;
}
