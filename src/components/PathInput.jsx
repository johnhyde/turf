import { createEffect, createSignal } from 'solid-js';
import { bind, input, isValidPath } from 'lib/utils.js';

export default function PathInput(props) {
  const [path, $path] = createSignal(props.value);
  createEffect(() => {
    if (typeof props.value === 'string') $path(props.value);
  });
  const setPath = (p) => {
    $path(p);
    props.$value?.(p);
    if (isValidPath(p)) props.$validValue?.(p);
  };
  const inputColor = () => {
    if (props.invalid || !isValidPath(path())) return 'bg-red-200';
    return props.warn ? 'bg-orange-200' : '';
  };
  return (
    <input
      use:input
      use:bind={[
        path,
        setPath,
      ]}
      class={'rounded-input ' + inputColor()}
      placeholder={props.placeholder ?? '/item/identifier'}
    />
  );
}
