import { createSignal, createSelector } from 'solid-js';
import { useState } from 'stores/state.jsx';

export default function FormSelect(props) {
  const state = useState();
  const isSelected = createSelector(() => props.selectedId);
  const forms = () => {
    return (props.forms || []).map((f, i) => [i, f]).sort((a, b) => {
      return a[1][0].localeCompare(b[1][0]);
    });
  };
  return (
    <div class="flex flex-wrap">
      <For each={forms()} fallback={props.fallback || <div>Loading...</div>}>
        {([i, [id, form]]) => (
          <div style={{ position: 'relative' }}>
            <Show when={props.background}>
              <img
                src={props.background}
                class="absolute top-0"
                style={{
                  'image-rendering': 'pixelated',
                  // position: 'absolute',
                  // top: 0,
                  // 'margin-bottom': '-100%',
                }}
              />
            </Show>
            <img
              src={form.variations[0].sprite}
              style={{
                visibility: 'hidden',
              }}
            />
            <img
              src={form.variations[0].sprite}
              onClick={() => props.select(id, i)}
              style={{
                border: isSelected(id) ? '4px dashed green' : 'none',
                'image-rendering': 'pixelated',
                position: 'absolute',
                top: 0,
              }}
            />
            {/* <p>
              {form.name}
            </p> */}
          </div>
        )}
      </For>
    </div>
  );
}
