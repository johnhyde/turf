export default function MediumButton(props) {
  const buttonClasses = 'bg-yellow-700 border-yellow-950 border-2 rounded-md px-3 py-1.5 mx-auto my-1 leading-none align-super font-semibold';
  return (
    <button class={buttonClasses + ' ' + (props.class || '')} onClick={props.onClick}>
      {props.children}
    </button>
  );
}
