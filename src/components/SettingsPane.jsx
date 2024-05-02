import {
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  onCleanup,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import { leading, throttle } from '@solid-primitives/scheduled';
import {
  autofocus,
  bind,
  hexToInt,
  input,
  intToHex,
  makeImage,
} from 'lib/utils.js';
import SmallButton from '@/SmallButton.jsx';
import Heading from '@/Heading.jsx';
import Radio from '@/Radio.jsx';
import UploadButton from '@/UploadButton.jsx';

export default function SettingsPane() {
  const state = useState();

  const [name, $name] = createSignal('');
  const [backType, $backType] = createSignal('');
  const [sprite, $sprite] = createSignal('');
  createEffect(() => {
    if (state.e?.name) $name(state.e.name);
  });
  createEffect(() => {
    if (state.e?.back) $backType(Object.keys(state.e.back)[0]);
  });
  createEffect(() => {
    if (state.e?.back?.sprite) $sprite(state.e.back.sprite);
  });

  function saveName() {
    state.setName(name());
  }

  const $color = leading(throttle, (c) => {
    state.setBack('color', hexToInt(c));
  }, 500);
  onCleanup(() => $color.clear());

  async function $backSprite(sprite) {
    if (!sprite.startsWith('data:')) {
      sprite = (await makeImage(sprite)).dataUrl;
    }
    state.setBack('sprite', sprite);
  }

  return (
    <Show when={state.e}>
      <div class='flex flex-col space-y-2 items-center h-full overflow-y-auto m-1 mt-0'>
        <Heading>
          Turf Name
        </Heading>
        <div className='flex justify-center items-center space-x-2 w-full'>
          <input
            use:input={{ onSubmit: saveName }}
            use:bind={[name, $name]}
            use:autofocus
            class='rounded-input shrink min-w-0'
          />
          <SmallButton onClick={saveName}>
            Set
          </SmallButton>
        </div>
        <Heading>Background</Heading>
        <Radio
          value={backType()}
          $value={$backType}
          items={[['color', 'Color'], ['sprite', 'Image']]}
          bg='border border-yellow-950 bg-yellow-700'
          bgActive='border border-yellow-950 bg-yellow-600'
        />
        <Show when={backType() == 'color'}>
          <input
            type='color'
            default='#ffffff'
            use:bind={[
              () =>
                state.e.back.color != null
                  ? intToHex(state.e.back.color)
                  : '#a6e4e8',

              $color,
            ]}
          />
        </Show>
        <Show when={backType() == 'sprite'}>
          <div class='flex items-center space-x-2 w-full'>
            <input
              use:input={{ onSubmit: () => $backSprite(sprite()) }}
              use:bind={[
                sprite,
                $sprite,
              ]}
              class='rounded-input shrink min-w-0'
              placeholder='Image URL'
            />
            <Show
              when={sprite() !== state.e.back.sprite}
            >
              <SmallButton onClick={() => $backSprite(sprite())}>
                Load
              </SmallButton>
            </Show>
          </div>
          <div class='self-start'>
            <UploadButton
              onFrame={$backSprite}
            />
          </div>
        </Show>
      </div>
    </Show>
  );
}
