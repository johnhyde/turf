import { createMemo, createSelector, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import { bind, isTextInputFocused } from 'lib/utils';
import { getShadeWithForm } from 'lib/turf';
import Button from '@/Button';
import ShadeEditor from '@/ShadeEditor';
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
  const formsByType = (type) => entries().filter(([id, form]) => form.type === type && id !== '/portal');
  const types = ['tile', 'item', 'wall'];

  const selectedShade = createMemo(() => {
    if (!state.e) return undefined;
    return getShadeWithForm(state.e, state.editor.selectedShadeId);
  });

  const onKeyDown = (e) => {
    if (e.key === 'Esc' && state.editor.selectedTool) {
      selectTool(null);
      e.preventDefault();
    }
    if (!e.defaultPrevented && !isTextInputFocused() && !e.metaKey) {
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          selectTool(tools.ERASER);
          break;
        case 'c':
          selectTool(tools.CYCLER);
        break;
        case 'r':
          selectTool(tools.RESIZER);
        break;
        default:
      }
    }
  };

  document.addEventListener('keydown', onKeyDown);
  onCleanup(() => {
    document.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div>
      <Button
        onClick={[selectTool, null]}
        src={point}
        selected={isToolSelected(null)}
        tooltip='Esc'
      />
      <Button
        onClick={[selectTool, tools.ERASER]}
        src={erase}
        selected={isToolSelected(tools.ERASER)}
        tooltip='Delete'
      />
      <Button
        onClick={[selectTool, tools.CYCLER]}
        src={cycle}
        selected={isToolSelected(tools.CYCLER)}
        tooltip='C'
      />
      <Button
        onClick={[selectTool, tools.RESIZER]}
        src={resize}
        selected={isToolSelected(tools.RESIZER)}
        tooltip='R'
      />
      <Show when={selectedShade()} keyed >
        {(shade) => <ShadeEditor shade={shade} />}
      </Show>
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
      </div>
    </div>
  );
}
