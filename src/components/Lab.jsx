import { createResource, mapArray, onCleanup } from 'solid-js';
import { leading, throttle } from "@solid-primitives/scheduled";
import { bind, intToHex } from 'lib/utils';
import { useState } from 'stores/state.jsx';
import FormSelect from '@/FormSelect';
import Heading from '@/Heading';

export default function Lab() {
  const state = useState();

  const setColor = leading(throttle, (c) => {
    if (c !== avColor()) {
      state.mist.setColor(c);
    }
  }, 500);;
  onCleanup(() => setColor.clear())

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

  const pClass = 'bg-yellow-950 text-yellow-50 rounded-md px-2 py-0.5 my-1 mx-auto w-fit';
  return (
    <div class="text-black text-center space-y-2 h-full overflow-y-auto">
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
            <FormSelect forms={things()()} select={delThing} fallback={'No Features Equipped'} background={'sprites/garb/body-gray.png'} />
        </Show>
      </div>
      <div class="">
        <Heading>
          Closet
        </Heading>
        <Show when={state.mist.closet !== undefined} fallback={'Loading Closet'}>
            <FormSelect forms={Object.entries(state.mist.closet || {})} select={addThing} background={'sprites/garb/body-gray.png'} sort={true} />
        </Show>
      </div>
    </div>
  );
}
