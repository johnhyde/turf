import { createEffect, createSignal } from 'solid-js';
import { maxV } from 'lib/utils.js';
import voidUrl from 'assets/sprites/void.png';

export default function ItemButton(props) {
  const [width, $width] = createSignal(0);
  const [height, $height] = createSignal(0);
  const [bgWidth, $bgWidth] = createSignal(0);
  const [bgHeight, $bgHeight] = createSignal(0);

  createEffect(() => {
    if (!previewForm()) {
      $width(0);
      $height(0);
    }
  });
  function onImg(el) {
    el.onload = () => {
      $width(el.naturalWidth);
      $height(el.naturalHeight);
    };
  }
  function onBg(el) {
    el.onload = () => {
      $bgWidth(el.naturalWidth);
      $bgHeight(el.naturalHeight);
    };
  }
  const variationI = () => {
    if (props.variation != null) return props.variation;
    if (props.form.type === 'wall' && props.form.variations.length >= 7) {
      return 6;
    }
    return 0;
  };

  const variation = () => props.form.variations[variationI()];
  const previewForm = () => {
    const sprite = variation()?.sprite;
    if (!sprite) return '';
    if (sprite.frames) {
      return sprite.frames[0];
    }
    return sprite;
  };

  const formOffset = () => variation().offset || vec2();
  const scale = () =>
    Math.min(
      totalWidth() ? 64 / totalWidth() : 1,
      totalHeight() ? 64 / totalHeight() : 1,
    );

  const bgMargin = () => {
    return maxV(vec2(), vec2(formOffset()));
  };

  const formMargin = () => {
    if (!props.bgImage) return vec2();
    return maxV(vec2(), vec2().subtract(formOffset()));
  };

  const totalWidth = () => {
    return Math.max(bgMargin().x + bgWidth(), formMargin().x + width());
  };

  const totalHeight = () => {
    return Math.max(bgMargin().y + bgHeight(), formMargin().y + height());
  };

  const centeringOffset = () => {
    return vec2(
      (64 - totalWidth() * scale()) / 2,
      (64 - totalHeight() * scale()) / 2,
    );
  };

  return (
    <button
      class={'rounded-lg p-[5px] w-[74px] h-[74px] flex justify-center items-center' +
        (props.selected ? ' bg-yellow-600' : '')}
      onClick={() => props.onClick?.()}
    >
      <div
        class='relative pointer-events-none'
        style={{
          width: '64px',
          height: '64px',
          // width: Math.round(totalWidth() * scale()) + 'px',
          // height: Math.round(totalHeight() * scale()) + 'px',
        }}
      >
        <Show when={props.playerImage || props.bgImage}>
          <img
            ref={onBg}
            src={props.playerImage || props.bgImage}
            draggable={false}
            class='absolute top-0 left-0 origin-top-left opacity-50'
            style={{
              'image-rendering': 'pixelated',
              'object-fit': 'none',
              'object-position': 'left top',
              'overflow': 'visible',
              // 'margin-left': bgMargin().x * scale() + 'px',
              // 'margin-top': bgMargin().y * scale() + 'px',
              'transform':
                `translate(${bgMargin().x * scale() + centeringOffset().x}px, ${
                  bgMargin().y * scale() + centeringOffset().y
                }px)` +
                ` scale(${scale()})`,
              'z-index': props.playerImage ? 5 : 0,
            }}
          />
        </Show>
        <img
          ref={onImg}
          src={previewForm()}
          draggable={false}
          class='absolute top-0 left-0 origin-top-left pointer-events-auto'
          style={{
            'image-rendering': 'pixelated',
            'object-fit': 'none',
            'object-position': 'left top',
            'overflow': 'visible',
            'z-index': (variation().deep === 'fore') ? 10 : 3,
            'transform':
              `translate(${formMargin().x * scale() + centeringOffset().x}px, ${
                formMargin().y * scale() + centeringOffset().y
              }px)` +
              ` scale(${scale()})`,
          }}
        />
      </div>
    </button>
  );
}
