import { splitProps } from 'solid-js';

export default function SmallButton(props) {
  const [porps, passThru] = splitProps(props, [
    'children',
    'selected',
    'class',
    'disabled',
    'tooltip',
    'lowercase',
  ]);
  const buttonClasses =
    'border-yellow-950 border rounded-md px-1 pb-0.5 leading-none align-super font-semibold disabled:opacity-50 active:bg-yellow-800 ';
  return (
    <button
      class={buttonClasses +
        (porps.selected ? ' bg-yellow-600' : ' bg-yellow-700') + ' ' +
        (porps.class || '') + ' ' +
        (porps.lowercase ? '' : 'small-caps')}
      disabled={porps.disabled ?? false}
      title={porps.tooltip}
      {...passThru}
    >
      {porps.children}
    </button>
  );
}
