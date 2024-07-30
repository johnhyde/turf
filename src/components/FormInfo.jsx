import { batch, createMemo, createSignal, mergeProps } from 'solid-js';
import { createStore, produce, reconcile } from 'solid-js/store';
import { jClone } from 'lib/utils.js';
import { isSpecialFormId } from 'lib/turf.js';
import { useState } from 'stores/state.jsx';
import Heading from '@/Heading.jsx';
import SmallButton from '@/SmallButton.jsx';
import FormEditor from '@/FormEditor.jsx';

export default function FormInfo(props) {
  const state = useState();
  const [mode, $mode] = createSignal(null);
  const importing = () => mode() === 'import';
  const editing = () => mode() === 'edit';
  const special = () => isSpecialFormId(props.formId);

  const form = () => state.e?.skye?.[props.formId];

  const [newForm, $newForm] = createStore({});
  function fillNewForm(newMode) {
    $mode(newMode);
    if (props.formId && form()) {
      $newForm(jClone({
        formId: props.formId + (newMode === 'copy' ? '/copy' : ''),
        form: form(),
      }));
    }
  }

  function deleteForm() {
    state.delForm(props.formId);
  }

  return (
    <Show when={props.formId && form()}>
      <Heading>{form().name}</Heading>
      <p class='text-center'>
        {form().type === 'tile' ? 'Tile' : 'Item'} ID: {props.formId}
      </p>
      <div class='my-1 flex flex-wrap justify-center gap-1'>
        {!state.thisIsUs &&
          (
            <>
              <SmallButton
                onClick={[fillNewForm, 'import']}
                tooltip="Add this item to your own turf's library"
              >
                Take Home
              </SmallButton>
              <FormEditor
                form={newForm}
                $form={$newForm}
                addFn={state.importForm.bind(state)}
              />
            </>
          )}
        <Show when={state.c.canEdit}>
          {!special() && (
            <SmallButton onClick={[fillNewForm, 'edit']}>
              Edit
            </SmallButton>
          )}
          <SmallButton onClick={[fillNewForm, 'copy']}>
            Copy
          </SmallButton>
          {!special() && (
            <SmallButton onClick={deleteForm}>
              Delete from Library
            </SmallButton>
          )}
        </Show>
      </div>
      <FormEditor
        form={newForm}
        $form={$newForm}
        skye={!importing() ? state.e?.skye : undefined}
        editing={editing()}
        addFn={importing() ? state.importForm.bind(state) : undefined}
      />
    </Show>
  );
}
