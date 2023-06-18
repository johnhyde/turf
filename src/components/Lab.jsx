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
  return (
    <div>
      {/* <input type="color" default={intToHex(avatar.body.color)} use:bind={[() => intToHex(avatar.body.color), state.setColor.bind(state)]} /> */}
      {/* <button onClick={state.toggleLab.bind(state)}>Done</button> */}
      <div class="border">
        <input type="color" default={intToHex(avColor())} use:bind={[avColor, setColor]} />
        <p>
          Equipped Features
        </p>
        <Show when={avatar() !== undefined} fallback={'Loading Avatar'}>
            <FormSelect forms={things()} select={delThing} fallback={'No Features Equipped'} background={'sprites/garb/body-gray.png'} />
        </Show>
        <p>
          Closet
        </p>
        <Show when={closet() !== undefined} fallback={'Loading Closet'}>
            <FormSelect forms={Object.entries(closet() || {})} select={addThing} background={'sprites/garb/body-gray.png'} sort={true} />
        </Show>
      </div>
    </div>
  );
}
