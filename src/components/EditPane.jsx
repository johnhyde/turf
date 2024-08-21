import { batch, createMemo, createSelector, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import { bind, input, isTextInputFocused } from 'lib/utils.js';
import { getShadeWithForm, getTile, isSpecialFormId } from 'lib/turf.js';
import Button from '@/Button.jsx';
import FormEditor from '@/FormEditor.jsx';
import ShadeEditor from '@/ShadeEditor.jsx';
import FormSelect from '@/FormSelect.jsx';
import FormInfo from '@/FormInfo.jsx';
import SmallButton from '@/SmallButton.jsx';
import MediumButton from '@/MediumButton.jsx';
import ItemButton from '@/ItemButton.jsx';
import ListItemPicker from '@/ListItemPicker.jsx';
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
  const entries = createMemo(() => {
    return Object.entries(state.e?.skye || {})
      .filter(([id, _form]) => !isSpecialFormId(id));
  });
  const formsByType = (type) => {
    return entries().filter(([_id, form]) => form.type === type);
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
      } else if ('123456789'.split('').includes(e.key)) {
        if (state.c.selectedForm) {
          state.selectVariation(
            (Number(e.key) - 1) % state.c.selectedForm.variations.length,
          );
        }
      } else {
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
        fx: [],
      },
    });
  }

  return (
    <div class='flex flex-col h-full'>
      <Show when={state.c.canEdit}>
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
      </Show>
      <Show when={state.c.selectedForm}>
        <div class='relative flex flex-col m-1 p-2 overflow-y-auto min-h-[218px] border-yellow-950 border-4 rounded-md bg-yellow-700'>
          <FormInfo formId={state.editor.selectedFormId} />
          <Show
            when={state.c.canEdit}
            fallback={
              <SmallButton
                onClick={[selectTool, null]}
                tooltip='Esc'
                class='absolute top-0 right-0 m-2'
              >
                x
              </SmallButton>
            }
          >
            <Show when={state.c.selectedForm.type === 'wall'}>
              <div class='flex justify-center items-center gap-2'>
                <label for='auto-orient'>
                  Auto-orient walls/paths:
                </label>
                <input
                  type='checkbox'
                  id='auto-orient'
                  use:input
                  checked={state.editor.autoOrientWalls}
                  onInput={(e) =>
                    state.$(
                      'editor',
                      'autoOrientWalls',
                      e.currentTarget.checked,
                    )}
                />
              </div>
            </Show>
          </Show>
          <Show
            when={!(state.c.selectedForm.type === 'wall' &&
              state.editor.autoOrientWalls) || !state.c.canEdit}
          >
            <ListItemPicker
              wall={state.c.selectedForm.type === 'wall'}
              items={state.c.selectedForm.variations}
              selected={state.editor.selectedVariation || 0}
              // onSelect={(v) => state.selectVariation(v)}
              button={(label, i, selected) => {
                return (
                  <div className='relative'>
                    <ItemButton
                      onClick={() => state.selectVariation(i)}
                      selected={selected}
                      form={state.c.selectedForm}
                      variation={i}
                      bgImage={'sprites/grass.png'}
                    />
                    <SmallButton
                      class='absolute top-1 left-1 bg-opacity-50 z-[20] pointer-events-none'
                      tabindex='-1'
                    >
                      {label}
                    </SmallButton>
                  </div>
                );
              }}
            />
          </Show>
        </div>
      </Show>
      <Show when={selectedShade()} keyed>
        {(shade) => <ShadeEditor shade={shade} />}
      </Show>
      <Show when={selectedShade() == null}>
        <div class='overflow-y-auto'>
          <Show
            when={state.e}
            fallback={props.fallback || <div>Loading...</div>}
          >
            <For each={types}>
              {(type) => (
                <div class='flex flex-wrap justify-center items-center'>
                  <FormSelect
                    forms={formsByType(type)}
                    select={(formId) =>
                      state.editor.selectedFormId === formId
                        ? selectForm(null)
                        : selectForm(formId)}
                    selectedId={state.editor.selectedFormId}
                    sort
                    fold
                  />
                </div>
              )}
            </For>
          </Show>
        </div>
      </Show>
    </div>
  );
}
