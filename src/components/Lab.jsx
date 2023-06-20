import { createEffect, createSignal, createDeferred, createResource, Show, createUniqueId, on, onCleanup } from 'solid-js';
import { leading, throttle } from "@solid-primitives/scheduled";
import { getCloset } from 'lib/api';
import { bind, intToHex } from 'lib/utils';
import { useState } from 'stores/state.jsx';
import FormSelect from '@/FormSelect';

export default function Lab() {
  const state = useState();

  const setColor = leading(throttle, (c) => {
    // $color(c);
    if (c !== avColor()) {
      state.avatar.setColor(c);
    }
  }, 500);;
  onCleanup(() => setColor.clear())

  const avatar = () => state.player?.avatar;
  const avColor = () => intToHex(avatar()?.body.color || 0);
  const things = () => {
    const av = avatar();
    if (!av) return undefined;
    return av.things.map((thing) => [thing.formId, thing.form]);
  }
  const [closet, { mutate, refetch }] = createResource(getCloset);
  // const [color, $color] = createSignal();
  // createEffect(() => {
  //   $color(avColor());
  // });
  function addThing(formId) {
    state.avatar.addThing(formId);
    console.log('add ' + formId + ' to player');
  }
  function delThing(_, i) {
    state.avatar.delThing(i);
    console.log('delete thing #' + (i + 1) + ' to player');
  }

  const pClass = 'bg-yellow-950 text-yellow-50 rounded-md px-2 py-0.5 my-1 mx-auto w-fit';
  return (
    <div class="text-black text-center space-y-2">
      <div class="flex items-center justify-center">
      {/* <div class=""> */}
        <p class={pClass + ' ml-0 mr-1'}>
          Skin Color
        </p>
        <input
          type="color"
          default={intToHex(avColor())}
          use:bind={[avColor, setColor]}
        />
      </div>
      {/* <div class="border-t"> */}
      <div class="">
        <p class={pClass}>
          Equipped Features
        </p>
        <Show when={avatar() !== undefined} fallback={'Loading Avatar'}>
            <FormSelect forms={things()} select={delThing} fallback={'No Features Equipped'} background={'sprites/garb/body-gray.png'} />
        </Show>
      </div>
      {/* <div class="border-t"> */}
      <div class="">
        <p class={pClass}>
          Closet
        </p>
        <Show when={closet() !== undefined} fallback={'Loading Closet'}>
            <FormSelect forms={Object.entries(closet() || {})} select={addThing} background={'sprites/garb/body-gray.png'} sort={true} />
        </Show>
      </div>
    </div>
  );
}
