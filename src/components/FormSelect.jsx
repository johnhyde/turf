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
            //{/* <div class="relative inline-block scale-[2] origin-top-left"> */}
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
                        // position: 'absolute',
                        // top: 0,
                        // 'margin-bottom': '-100%',
                      }}
                    />
                  </Show>
                  <img
                    ref={onImg}
                    src={form.variations[0].sprite}
                    draggable={false}
                    class="invisible w-full"
                  />
                  <button
                    class="absolute top-0 left-0 scale-[2] origin-top-left" 
                    onClick={() => props.select(id, i)}
                  >
                    <img
                      src={form.variations[0].sprite}
                      draggable={false}
                      class=""
                      style={{
                        // border: isSelected(id) ? '4px dashed green' : 'none',
                        'image-rendering': 'pixelated',
                      }}
                    />
                  </button>
                  {/* <p>
                    {form.name}
                  </p> */}
                </div>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}
