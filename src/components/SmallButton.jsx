export default function SmallButton(props) {
  const buttonClasses = 'bg-yellow-700 border-yellow-950 border rounded-sm px-1 leading-none align-super';
  return (
    <button class={buttonClasses + ' ' + props.class} onClick={props.onClick}>
      {props.children}
    </button>
  );
}
