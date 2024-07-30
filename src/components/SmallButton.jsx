export default function SmallButton(props) {
  const buttonClasses =
    'border-yellow-950 border rounded-md px-1 pb-0.5 leading-none align-super font-semibold small-caps disabled:opacity-50 ';
  return (
    <button
      class={buttonClasses +
        (props.selected ? ' bg-yellow-600' : ' bg-yellow-700') + ' ' +
        (props.class || '')}
      style={props.style}
      onClick={props.onClick}
      disabled={props.disabled ?? false}
      tabindex={props.tabindex}
      title={props.tooltip}
    >
      {props.children}
    </button>
  );
}
