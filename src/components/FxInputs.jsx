import { toPairs } from 'lib/utils.js';
import Select from '@/Select.jsx';

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
  return (
    <>
      <Select value={type()} $value={$type} options={targetTypes} />
      <Show when={type() === 'item'}>
      </Show>
      <Show when={type() === 'player'}>
      </Show>
    </>
  );
}

export function FxLocationInput(props) {
  return null;
}
