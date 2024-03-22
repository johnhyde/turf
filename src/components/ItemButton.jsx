import { createSignal } from 'solid-js';
import { maxV } from 'lib/utils';
import voidUrl from 'assets/sprites/void.png';

export default function ItemButton(props) {
  const [width, $width] = createSignal();

  function onImg(el) {
    el.onload = () => {
      $width(el.naturalWidth*2)
    };
  }
  const variationI = () => {
    if (props.variation != null) return props.variation;
    if (props.form.type === 'wall' && props.form.variations.length >= 7) {
      return 6;
    }
    return 0;
  }

  const variation = () => props.form.variations[variationI()];
  const previewForm = () => {
    const sprite = variation()?.sprite;
    if (!sprite) return voidUrl;
    if (sprite.frames) {
      return sprite.frames[0];
    }
    return sprite;
  };


  const formOffset = () => props.form.offset;

  const bgMargin = () => {
    return maxV(vec2(), vec2(formOffset()).scale(2));
  }
  
  const formMargin = () => {
    if (!props.bgImage) return vec2();
    return maxV(vec2(), vec2().subtract(formOffset()));
  }

  return (
    <div class={'rounded-lg p-[5px] ' + (props.selected ? 'bg-yellow-600' : '')}>
      <div class="relative pointer-events-none" style={{ width: width() + 'px' }}>
        <Show when={props.bgImage}>
          <img
            src={props.bgImage}
            draggable={false}
            class="absolute top-0 left-0 scale-[2] origin-top-left z-[5] opacity-50"
            style={{
              'image-rendering': 'pixelated',
              'margin-left': bgMargin().x + 'px',
              'margin-top': bgMargin().y + 'px',
            }}
          />
        </Show>
        <img
          ref={onImg}
          src={previewForm()}
          draggable={false}
          class="invisible w-full"
          style={{
            'margin-right': formMargin().x*2 + 'px',
            'margin-bottom': formMargin().y*2 + 'px',
          }}
        />
        <button
          class="absolute top-0 left-0 scale-[2] origin-top-left pointer-events-auto" 
          onClick={() => props.onClick?.()}
          style={{
            'z-index': (variation().deep === 'fore') ? 10 : 0,
          }}
        >
          <img
            src={previewForm()}
            draggable={false}
            class=""
            style={{
              'image-rendering': 'pixelated',
              'margin-left': formMargin().x + 'px',
              'margin-top': formMargin().y + 'px',
            }}
          />
        </button>
      </div>
    </div>
  );
}
