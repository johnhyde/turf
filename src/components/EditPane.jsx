import { createSignal, createSelector } from 'solid-js';
import { spriteName } from 'lib/pond';
import { useState } from 'stores/state.jsx';

export default function EditPane() {
  const state = useState();
  const isSelected = createSelector(() => state.editor.selectedFormId);
  function selectEraser() {
    state.selectForm(null);
    state.selectTool(state.editor.tools.ERASER);
  }
  return (
    <div>
      <p>
        Edit Mode
      </p>
      <button onClick={selectEraser}>Erase</button>
      <For each={Object.entries(state.e?.skye || {})} fallback={<div>Loading...</div>}>
        {([id, form], i) => (
          <img
            src={form.variations[0].back}
            onClick={[state.selectForm.bind(state), id]}
            style={{
              border: isSelected(id) ? '4px dashed green' : 'none',
            }}
          />
        )}
      </For>
      {/* <button onClick={state.toggleEditing.bind(state)}>Cancel</button> */}
      {/* <button onClick={state.toggleEditing.bind(state)}>Save</button> */}
      <button onClick={state.toggleEditing.bind(state)}>Done</button>
    </div>
  );
}
