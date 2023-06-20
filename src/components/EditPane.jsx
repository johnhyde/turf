import { createSignal, createSelector } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import { bind } from 'lib/utils';
import Button from '@/Button';
import FormSelect from '@/FormSelect';
import point from 'assets/icons/point.png';
import erase from 'assets/icons/delete.png';
import cycle from 'assets/icons/cycle.png';
import resize from 'assets/icons/resize.png';

export default function EditPane() {
  const state = useState();
  const tools = state.editor.tools;

  const isToolSelected = createSelector(() => state.editor.selectedTool);
  function selectTool(tool) {
    state.selectForm(null);
    state.selectTool(tool);
  }
  const entries = () => Object.entries(state.e?.skye || {});
  const formsByType = (type) => entries().filter(([id, form]) => form.type === type);
  const types = ['tile', 'item', 'wall'];
  return (
    <div>
      <Button onClick={[selectTool, null]} src={point} selected={isToolSelected(null)} />
      <Button onClick={[selectTool, tools.ERASER]} src={erase} selected={isToolSelected(tools.ERASER)} />
      <Button onClick={[selectTool, tools.CYCLER]} src={cycle} selected={isToolSelected(tools.CYCLER)} />
      <Button onClick={[selectTool, tools.RESIZER]} src={resize} selected={isToolSelected(tools.RESIZER)} />
      <div>
        <For each={types}>
          {(type) => (

            <FormSelect
              forms={formsByType(type)}
              select={state.selectForm.bind(state)}
              selectedId={state.editor.selectedFormId}
            />
          )}
        </For>
        {/* <FormSelect
          forms={Object.entries(state.e?.skye || {})}
          select={state.selectForm.bind(state)}
          selectedId={state.editor.selectedFormId}
        /> */}
      </div>
    </div>
  );
}
