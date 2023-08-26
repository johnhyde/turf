export default function Heading(props) {
  const pClass = 'bg-yellow-950 text-yellow-50 rounded-md px-2 py-0.5 my-1 mx-auto w-fit';
  return (
    <p class={pClass + ' ' + (props.class || '')}>
      {props.children}
    </p>
  );
}
