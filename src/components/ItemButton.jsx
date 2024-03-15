import { createSignal } from 'solid-js';

export default function ItemButton(props) {
  const [width, $width] = createSignal();

  function onImg(el) {
    el.onload = () => {
      $width(el.naturalWidth*2)
    };
  }
  function previewForm(form) {
    let variation = props.variation ?? 0;
    if (form.type === 'wall' && form.variations.length >= 7) {
      variation = props.variation ?? 6;
    }
    const sprite = form.variations[variation].sprite;
    if (sprite.frames) {
      return sprite.frames[0];
    }
    return sprite;
  }

  return (
    <div class={'rounded-lg p-[5px] ' + (props.selected ? 'bg-yellow-600' : '')}>
      <div class="relative" style={{ width: width() + 'px' }}>
        <Show when={props.background}>
          <img
            src={props.background}
            draggable={false}
            class="absolute top-0 left-0 scale-[2] origin-top-left"
            style={{
              'image-rendering': 'pixelated',
            }}
          />
        </Show>
        <img
          ref={onImg}
          src={previewForm(props.form)}
          draggable={false}
          class="invisible w-full"
        />
        <button
          class="absolute top-0 left-0 scale-[2] origin-top-left" 
          onClick={() => props.onClick?.()}
        >
          <img
            src={previewForm(props.form)}
            draggable={false}
            class=""
            style={{
              'image-rendering': 'pixelated',
            }}
          />
        </button>
      </div>
    </div>
  );
}
