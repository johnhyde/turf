import { onMount, onCleanup } from 'solid-js';

export default function Modal(props) {
  onMount(() => {
    document.body.addEventListener('keydown', onKeyDown, true);
    if (window.game) {
      game.input.enabled = false;
      game.input.keyboard.enabled = false;
    }
  });
  onCleanup(() => {
    document.body.removeEventListener('keydown', onKeyDown, true);
    if (window.game) {
      game.input.enabled = true;
      game.input.keyboard.enabled = true;
    }
  });

  function onKeyDown(e) {
    if (e.key === 'Escape' && props.onClose) {
      props.onClose();
      e.stopPropagation();
    }
  }


  return (<>
    <div class="absolute top-0 left-0 w-full h-full z-20 bg-gray-500 opacity-30">
    </div>
    <div class="absolute top-0 left-0 w-full h-full flex z-20" onClick={(e) => props.onClose?.(e)} on:keydown={onKeyDown}>
      <div class={"m-auto max-w-md max-h-md p-4 rounded-2xl " + (props.class || '')} onClick={e => e.stopPropagation()}>
        {props.children}
      </div>
    </div>
  </>);
}
