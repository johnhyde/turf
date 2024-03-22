import { createSignal, mapArray, onCleanup } from 'solid-js';
import { createStore, produce, reconcile, unwrap } from "solid-js/store";
import { leading, throttle } from "@solid-primitives/scheduled";
import { bind, jClone, intToHex } from 'lib/utils';
import { useState } from 'stores/state.jsx';
import MediumButton from '@/MediumButton';
import FormEditor from '@/FormEditor';
import FormSelect from '@/FormSelect';
import Heading from '@/Heading';

export default function Lab() {
  const state = useState();
  const [editing, $editing] = createSignal(false);

  const setColor = leading(throttle, (c) => {
    if (c !== avColor()) {
      state.mist.setColor(c);
    }
  }, 500);;
  onCleanup(() => setColor.clear());


  const [newForm, $newForm] = createStore({});
  function initNewForm() {
    $editing(false);
    $newForm({
      formId: '',
      form: {
        name: 'Custom Garb',
        type: 'garb',
        variations: [
          {
            deep: 'fore',
            sprite: '',
          },
          {
            deep: 'fore',
            sprite: '',
          },
          {
            deep: 'back',
            sprite: '',
          },
          {
            deep: 'fore',
            sprite: '',
          },
        ],
        offset: {
          x: 0, y: 0,
        },
        collidable: false,
        effects: {},
        seeds: {},
      },
    });
  }

  function editThing(formId, copying = false) {
    const form = state.mist.closet[formId];
    if (form) {
      $editing(!copying);
      $newForm({
        formId: formId + (copying ? '/copy' : ''),
        form: jClone(form),
      })
    }
  }

  const avatar = () => state.v?.avatar;
  const avColor = () => intToHex(avatar()?.body.color || 0);
  const things = () => {
    const av = avatar();
    if (!av) return undefined;
    return mapArray(() => av.things, (thing) => {
      return [thing.formId, thing.form];
    });
  }
  function addThing(formId) {
    state.mist.addThing(formId);
    console.log('add ' + formId + ' to player');
  }
  function delThing(_, i) {
    state.mist.delThing(i);
    console.log('delete thing #' + (i + 1) + ' to player');
  }

  function onEquippedButton(buttonName, formId, i) {
    switch (buttonName) {
      case 'del': {
        delThing(formId, i);
        break;
      }
      case 'edit': {
        editThing(formId);
        break;
      }
      default: break;
    }
  }

  function onClosetButton(buttonName, formId, i) {
    switch (buttonName) {
      case 'add': {
        addThing(formId);
        break;
      }
      case 'edit': {
        editThing(formId);
        break;
      }
      case 'copy': {
        editThing(formId, true);
        break;
      }
      default: break;
    }
  }

  const bodyImage = () => {
    if (!state.m) return null;
    const sprite = state.m.avatar.body.thing.form.variations[0].sprite;
    if (typeof sprite === 'string') return sprite;
    return sprite.frames[0];
  }

  const pClass = 'bg-yellow-950 text-yellow-50 rounded-md px-2 py-0.5 my-1 mx-auto w-fit';
  return (
    <div class="text-black text-center space-y-2 h-full overflow-y-auto">
      <MediumButton onClick={initNewForm}>
        Create Garb
      </MediumButton>
      <FormEditor form={newForm} $form={$newForm}
        skye={state.mist.closet}
        addFn={state.closet.addForm.bind(state.closet)}
        editing={editing()}
      />
      <div class="flex items-center justify-center">
        <Heading class="ml-0 mr-1">
          Skin Color
        </Heading>
        <input
          type="color"
          default={intToHex(avColor())}
          use:bind={[avColor, setColor]}
        />
      </div>
      <div class="">
        <Heading>
          Equipped Features
        </Heading>
        <Show when={avatar() !== undefined} fallback={'Loading Avatar'}>
          <FormSelect
            forms={things()()}
            select={delThing}
            buttons={[['Delete', 'del'], ['Edit', 'edit']]}
            onButton={onEquippedButton}
            fallback={'No Features Equipped'}
            bgImage={bodyImage()}
            bgOffset
          />
        </Show>
      </div>
      <div class="">
        <Heading>
          Closet
        </Heading>
        <Show when={state.mist.closet !== undefined} fallback={'Loading Closet'}>
            <FormSelect 
              forms={Object.entries(state.mist.closet || {})}
              select={addThing}
              buttons={[['Add', 'add'], ['Edit', 'edit'], ['Copy', 'copy']]}
              onButton={onClosetButton}
              bgImage={bodyImage()}
              sort={true}
            />
        </Show>
      </div>
    </div>
  );
}
