export default function SmallButton(props) {
  const buttonClasses = 'bg-yellow-700 border-yellow-950 border rounded-md px-1 pb-0.5 leading-none align-super font-semibold';
  return (
    <button class={buttonClasses + ' ' + (props.class || '')} onClick={props.onClick}>
      {props.children}
    </button>
  );
}
