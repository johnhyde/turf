import { onMount, onCleanup } from 'solid-js';

export default function Modal(props) {
  onMount(() => {
    game.input.enabled = false;
    game.input.keyboard.enabled = false;
  });
  onCleanup(() => {
    game.input.enabled = true;
    game.input.keyboard.enabled = true;
  });

  return (<>
    <div class="absolute top-0 left-0 w-full h-full z-20 bg-gray-500 opacity-30">
    </div>
    <div class="absolute top-0 left-0 w-full h-full flex z-20">
      <div class={"m-auto max-w-md max-h-md p-4 rounded-2xl " + (props.class || '')}>
        {props.children}
      </div>
    </div>
  </>);
}
