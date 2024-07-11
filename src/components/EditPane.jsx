import { batch, createMemo, createSelector, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import { bind, isTextInputFocused } from 'lib/utils.js';
import { getShadeWithForm, getTile, isSpecialFormId } from 'lib/turf.js';
import Button from '@/Button.jsx';
import FormEditor from '@/FormEditor.jsx';
import ShadeEditor from '@/ShadeEditor.jsx';
import FormSelect from '@/FormSelect.jsx';
import FormInfo from '@/FormInfo.jsx';
import MediumButton from '@/MediumButton.jsx';
import point from 'assets/icons/point.png';
import erase from 'assets/icons/delete.png';
import dropper from 'assets/icons/dropper.png';
import resize from 'assets/icons/resize.png';

export default function EditPane() {
  const state = useState();
  const tools = state.editor.tools;
  const buttons = {
    point: null,
    erase: null,
    dropper: null,
    resize: null,
  };

  const isToolSelected = createSelector(() => state.editor.selectedTool);
  function selectTool(tool) {
    state.selectForm(null);
    state.selectTool(tool);
    if (tool == null) state.selectShade(null);
  }
  function selectForm(formId) {
    state.selectForm(formId);
    if (formId === null) state.selectTool(null);
  }
  const entries = () => Object.entries(state.e?.skye || {});
  const formsByType = (type) => {
    const specialFormIds = ['/portal', '/portal/house', '/gate'];
    return entries()
      .filter(([id, form]) => form.type === type && !isSpecialFormId(id))
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
        if (
          null != (state.editor.selectedTool ?? state.editor.selectedShadeId)
        ) {
          batch(() => {
            selectTool(null);
          });
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
        case 'i':
          selectTool(tools.DROPPER);
          if (buttons.dropper) buttons.dropper.focus();
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
          offset: { x: 0, y: 0 },
          tint: null,
          sprite: '',
        }],
        collidable: false,
        effects: {},
        seeds: {},
      },
    });
  }

  return (
    <div class='flex flex-col h-full'>
      <div class='flex flex-wrap justify-evenly content-evenly'>
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
          onClick={[selectTool, tools.DROPPER]}
          src={dropper}
          selected={isToolSelected(tools.DROPPER)}
          tooltip='I'
          ref={buttons.dropper}
        />
        <Button
          onClick={[selectTool, tools.RESIZER]}
          src={resize}
          selected={isToolSelected(tools.RESIZER)}
          tooltip='R'
          ref={buttons.resize}
        />
      </div>
      <MediumButton onClick={initNewForm}>
        Create Item
      </MediumButton>
      <FormEditor form={newForm} $form={$newForm} skye={state.e?.skye} />
      <Show when={state.c.selectedForm}>
        <div class='flex flex-col m-1 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700'>
          <FormInfo formId={state.editor.selectedFormId} />
        </div>
      </Show>
      <Show when={selectedShade()} keyed>
        {(shade) => <ShadeEditor shade={shade} />}
      </Show>
      <Show when={selectedShade() == null}>
        <div class='overflow-y-auto'>
          <For each={types}>
            {(type) => (
              <FormSelect
                forms={formsByType(type)}
                select={(formId) =>
                  state.editor.selectedFormId === formId
                    ? selectForm(null)
                    : selectForm(formId)}
                selectedId={state.editor.selectedFormId}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
