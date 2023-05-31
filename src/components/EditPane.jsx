import { createSignal, createSelector } from 'solid-js';
import { spriteName } from 'lib/pond';
import { useState } from 'stores/state.jsx';

export default function EditPane() {
  const state = useState();
  const isSelected = createSelector(() => state.editor.selectedItemId);
  return (
    <div>
      <p>
        Edit Mode
      </p>
      <For each={Object.entries(state.current.turf?.library || {})} fallback={<div>Loading...</div>}>
        {([id, item], i) => (
          <img
            src={item.variations[0].back}
            onClick={[state.selectItem, id]}
            style={{
              border: isSelected(id) ? '4px dashed green' : 'none',
            }}
          />
        )}
      </For>
      <button onClick={state.toggleEditing.bind(state)}>Cancel</button>
      <button onClick={state.toggleEditing.bind(state)}>Save</button>
    </div>
  );
}
