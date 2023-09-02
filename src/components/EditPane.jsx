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
  const buttons = {
    point: null,
    erase: null,
    cycle: null,
    resize: null,
  };

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
    if (e.key === 'Escape' && (state.editor.selectedTool || state.editor.selectedShadeId)) {
      selectTool(null);
      if (buttons.point) buttons.point.focus();
      e.preventDefault();
    }
    if (!e.defaultPrevented && !isTextInputFocused() && !e.metaKey) {
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          selectTool(tools.ERASER);
          if (buttons.erase) buttons.erase.focus();
          break;
        case 'c':
          selectTool(tools.CYCLER);
          if (buttons.cycle) buttons.cycle.focus();
        break;
        case 'r':
          selectTool(tools.RESIZER);
          if (buttons.resize) buttons.resize.focus();
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
        tooltip='Escape'
        ref={buttons.point}
      />
      <Button
        onClick={[selectTool, tools.ERASER]}
        src={erase}
        selected={isToolSelected(tools.ERASER)}
        tooltip='Delete'
        ref={buttons.erase}
      />
      <Button
        onClick={[selectTool, tools.CYCLER]}
        src={cycle}
        selected={isToolSelected(tools.CYCLER)}
        tooltip='C'
        ref={buttons.cycle}
      />
      <Button
        onClick={[selectTool, tools.RESIZER]}
        src={resize}
        selected={isToolSelected(tools.RESIZER)}
        tooltip='R'
        ref={buttons.resize}
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
