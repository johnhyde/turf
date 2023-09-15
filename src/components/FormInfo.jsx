import { batch, createMemo, createSelector, mergeProps } from 'solid-js';
import { createStore, produce, reconcile } from "solid-js/store";
import { jClone } from 'lib/utils';
import { useState } from 'stores/state.jsx';
import Heading from '@/Heading';
import SmallButton from '@/SmallButton';
import FormEditor from '@/FormEditor';

export default function ShadeEditor(props) {
  const state = useState();
  const form = () => state.e?.skye?.[props.formId];

  const [newForm, $newForm] = createStore({});
  function importForm() {
    if (props.formId && form()) $newForm(jClone({
      formId: props.formId,
      form: form(),
    }));
  }

  return (
    <Show when={props.formId && form()}>
        <Heading>{form().name}</Heading>
        {state.c.id !== ourPond && 
          <>
            <SmallButton onClick={importForm} class="mx-auto">
              Import Item
            </SmallButton>
            <FormEditor form={newForm} $form={$newForm} addFn={state.importForm.bind(state)}/>
          </>
        }
        <p class="text-center">
          Item ID: {props.formId}
        </p>
    </Show>
  );
};
