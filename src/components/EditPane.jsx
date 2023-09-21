import { createMemo, createSelector, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import { bind, isTextInputFocused } from 'lib/utils';
import { getShadeWithForm } from 'lib/turf';
import Button from '@/Button';
import FormEditor from '@/FormEditor';
import ShadeEditor from '@/ShadeEditor';
import FormSelect from '@/FormSelect';
import FormInfo from '@/FormInfo';
import MediumButton from '@/MediumButton';
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
  function selectForm(formId) {
    state.selectForm(formId);
    if (formId === null) state.selectTool(null);
  }
  const entries = () => Object.entries(state.e?.skye || {});
  const formsByType = (type) => {
    return entries()
      .filter(([id, form]) => form.type === type && id !== '/portal')
      .sort(([a, formA], [b, formB]) => {
        return a > b ? 1 : (a < b ? -1 : 0);
      });
  };
  const types = ['tile', 'item', 'wall'];

  const selectedShade = createMemo(() => {
    if (!state.e) return undefined;
    return getShadeWithForm(state.e, state.editor.selectedShadeId);
  });

  const onKeyDown = (e) => {
    if (!e.defaultPrevented && !isTextInputFocused() && !e.metaKey) {
      if (e.key === 'Escape') {
        if (state.editor.selectedTool || state.editor.selectedShadeId) {
          selectTool(null);
          if (buttons.point) buttons.point.focus();
          e.stopPropagation();
        }
      } 
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

  document.body.addEventListener('keydown', onKeyDown);
  onCleanup(() => {
    document.body.removeEventListener('keydown', onKeyDown);
  });

  const [newForm, $newForm] = createStore({});
  function initNewForm() {
    $newForm({
      formId: '',
      form: {
        name: 'Custom Item',
        type: 'item',
        variations: [{
          deep: 'back',
          sprite: '',
        }],
        offset: {
          x: 0, y: 0,
        },
        collidable: false,
        effects: {},
        seeds: {},
      },
    });
  }

  function delSelectedForm() {
    state.delForm(state.editor.selectedFormId)
    selectTool(null);
  }

  return (
    <div class="flex flex-col h-full">
      <div class="flex flex-wrap justify-evenly content-evenly">
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
      </div>
      {state.editor.selectedFormId ?
        <>
          <MediumButton onClick={delSelectedForm}>
            Delete Item
          </MediumButton>
        </>
      :
        <MediumButton onClick={initNewForm}>
          Create Item
        </MediumButton>
      }
      <FormEditor form={newForm} $form={$newForm} skye={state.e?.skye} />
      <Show when={state.editor.selectedFormId}>
        <div class="flex flex-col m-1 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700">
          <FormInfo formId={state.editor.selectedFormId} />
        </div>
      </Show>
      <Show when={selectedShade()} keyed>
        {(shade) => <ShadeEditor shade={shade} />}
      </Show>
      <div class="h-full overflow-y-auto">
        <For each={types}>
          {(type) => (

            <FormSelect
              forms={formsByType(type)}
              select={(formId) => state.editor.selectedFormId === formId ? selectForm(null) : selectForm(formId)}
              selectedId={state.editor.selectedFormId}
            />
          )}
        </For>
      </div>
    </div>
  );
}
