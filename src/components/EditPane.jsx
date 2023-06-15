import { createSignal, createSelector } from 'solid-js';
import { useState } from 'stores/state.jsx';
import FormSelect from '@/FormSelect';

export default function EditPane() {
  const state = useState();
  const isSelected = createSelector(() => state.editor.selectedFormId);
  function selectTool(tool) {
    state.selectForm(null);
    state.selectTool(tool);
  }
  return (
    <div>
      <p>
        Edit Mode
      </p>
      {/* <button onClick={state.toggleEditing.bind(state)}>Cancel</button> */}
      {/* <button onClick={state.toggleEditing.bind(state)}>Save</button> */}
      <button onClick={state.toggleEditing.bind(state)}>Done</button>
      <p>
        <button onClick={[selectTool, state.editor.tools.ERASER]}>Erase</button>
        <button onClick={[selectTool, state.editor.tools.CYCLER]}>Cycler</button>
      </p>
      <FormSelect
        forms={Object.entries(state.e?.skye || {})}
        select={state.selectForm.bind(state)}
        selectedId={state.editor.selectedFormId}
    />
    </div>
  );
}
