export default function Button(props) {
  return (
    <button
      class={'border-yellow-950 border-4 rounded-md p-1 m-1 ' + (props.class ? props.class : '')}
      classList={{ 'bg-yellow-700': !props.selected, 'bg-yellow-600': props.selected }}
      onClick={props.onClick}
      style={{ 'image-rendering': 'pixelated' }}
      title={props.tooltip}
      ref={props.ref}
      disabled={props.disabled === true}
    >
      <img src={props.src} draggable={false} />
    </button>
  );
}
