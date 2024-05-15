import { createEffect, createSignal } from 'solid-js';
import { isValidPatp } from 'urbit-ob';
import { bind, input, normalizeId } from 'lib/utils.js';

export default function PatpInput(props) {
  const [patp, $patp] = createSignal(props.value || '');
  createEffect(() => {
    if (typeof props.value === 'string') $patp(props.value);
  });
  const setPatp = (p) => {
    if (props.normalize) p = normalizeId(p);
    $patp(p);
    props.$value?.(p);
    if (isValidPatp(p)) props.$validValue?.(p);
  };
  const inputColor = () => {
    if (props.invalid || !isValidPatp(patp())) return 'bg-red-200';
    return props.warn ? 'bg-orange-200' : '';
  };
  return (
    <input
      class={'rounded-input ' + inputColor()}
      use:input
      autofocus={props.autofocus}
      use:bind={[
        patp,
        setPatp,
      ]}
      placeholder={props.placeholder ?? ''}
    />
  );
}
