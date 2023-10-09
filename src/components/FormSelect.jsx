import { createSignal, createSelector, createMemo } from 'solid-js';
import { useState } from 'stores/state.jsx';

export default function FormSelect(props) {
  const state = useState();
  const isSelected = createSelector(() => props.selectedId);
  const forms = createMemo(() => {
    let forms = (props.forms || []).map((f, i) => [i, f])
    if (props.sort) {
      forms.sort((a, b) => {
        return a[1][0].localeCompare(b[1][0]);
      });
    }
    return forms;
  });
  function previewForm(form) {
    let sprite = form.variations[0].sprite;
    if (form.type === 'wall' && form.variations.length >= 7) {
      sprite = form.variations[6].sprite;
    }
    if (sprite.frames) {
      return sprite.frames[0];
    }
    return sprite;
  }
  return (
    <div class="flex flex-wrap justify-center">
      <Index each={forms()} fallback={props.fallback || <div>Loading...</div>}>
        {(item) => {
          const i = () => item()[0];
          const j = () => item()[1];
          const id = () => j()[0];
          const form = () => j()[1];
          const [width, $width] = createSignal();
          window.width = width;
          function onImg(el) {
            el.onload = () => {
              $width(el.naturalWidth*2)
            };
          }
          return (
            <div>
              <div class={'rounded-lg p-[5px] ' + (isSelected(id()) ? 'bg-yellow-600' : '')}>
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
                    src={previewForm(form())}
                    draggable={false}
                    class="invisible w-full"
                  />
                  <button
                    class="absolute top-0 left-0 scale-[2] origin-top-left" 
                    onClick={() => props.select(id(), i())}
                  >
                    <img
                      src={previewForm(form())}
                      draggable={false}
                      class=""
                      style={{
                        'image-rendering': 'pixelated',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        }}
      </Index>
    </div>
  );
}
