import { createSignal, createSelector } from 'solid-js';
import { useState } from 'stores/state.jsx';

export default function FormSelect(props) {
  const state = useState();
  const isSelected = createSelector(() => props.selectedId);
  const forms = () => {
    let forms = (props.forms || []).map((f, i) => [i, f])
    if (props.sort) {
      forms.sort((a, b) => {
        return a[1][0].localeCompare(b[1][0]);
      });
    }
    return forms;
  };
  function previewForm(form) {
    const sprite = form.variations[0].sprite;
    if (sprite.frames) {
      return sprite.frames[0];
    }
    return sprite;
  }
  return (
    <div class="flex flex-wrap justify-center">
      <For each={forms()} fallback={props.fallback || <div>Loading...</div>}>
        {([i, [id, form]]) => {
          const [width, $width] = createSignal();
          window.width = width;
          function onImg(el) {
            el.onload = () => {
              $width(el.clientWidth*2)
            };
          }
          return (
            <div>
              <div class={'rounded-lg p-[5px] ' + (isSelected(id) ? 'bg-yellow-600' : '')}>
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
                    src={previewForm(form)}
                    draggable={false}
                    class="invisible w-full"
                  />
                  <button
                    class="absolute top-0 left-0 scale-[2] origin-top-left" 
                    onClick={() => isSelected(id) ? props.select(null) : props.select(id)}
                  >
                    <img
                      src={previewForm(form)}
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
      </For>
    </div>
  );
}
