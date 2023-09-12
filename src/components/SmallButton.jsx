export default function SmallButton(props) {
  const buttonClasses = 'bg-yellow-700 border-yellow-950 border rounded-md px-1 pb-0.5 leading-none align-super font-semibold disabled:opacity-50';
  return (
    <button class={buttonClasses + ' ' + (props.class || '')} onClick={props.onClick} disabled={props.disabled ?? false}>
      {props.children}
    </button>
  );
}
