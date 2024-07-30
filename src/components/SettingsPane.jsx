import {
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  onCleanup,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import { leadingAndTrailing, throttle } from '@solid-primitives/scheduled';
import {
  autofocus,
  bind,
  hexToInt,
  input,
  intToHex,
  makeImage,
  toPairs,
} from 'lib/utils.js';
import SmallButton from '@/SmallButton.jsx';
import Heading from '@/Heading.jsx';
import Radio from '@/Radio.jsx';
import Select from '@/Select.jsx';
import UploadButton from '@/UploadButton.jsx';
import PatpInput from '@/PatpInput.jsx';

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

  const $color = leadingAndTrailing(throttle, (c) => {
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
    <Show when={state.e && state.c.canAdmin}>
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
        <Heading tooltip='Set whether anyone can join this turf and edit'>
          Turf Access
        </Heading>
        {
          /* <p>
          Visitors can:
        </p> */
        }
        <Radio
          value={state.e.perms.default}
          $value={(p) => state.setDefaultPerm(p)}
          // items={toPairs('n  Get Lost, in  Explore, add  Edit, take  Claim Land, admin  Do Anything')}
          items={toPairs('n  Closed, in  Explore, add  Edit')}
          bg='border border-yellow-950 bg-yellow-700'
          bgActive='border border-yellow-950 bg-yellow-600'
        />
        {
          /* <p>
          Except:
        </p> */
        }
        <Heading>Special Permissions</Heading>
        <PermExceptions />
      </div>
    </Show>
  );
}

function PermExceptions() {
  const state = useState();
  const [patp, $patp] = createSignal('');
  const exceptions = createMemo(() => {
    return Object.entries(state.e.perms.except)
      .sort(([shipA, permA], [shipB, permB]) => {
        if (permA.length < permB.length) {
          return 1;
        } else if (permA.length > permB.length) {
          return -1;
        } else {
          return shipA.localeCompare(shipB);
        }
      });
  });
  function addException() {
    state.setPlayerPerm(patp(), state.e.perms.default);
  }

  return (
    <>
      <div className='flex justify-center items-center space-x-2 w-full'>
        <PatpInput
          value={patp()}
          $validValue={$patp}
          onSubmit={addException}
          normalize
          emptyOk
          placeholder='@p to permission'
        />
        <SmallButton onClick={addException}>+</SmallButton>
      </div>
      <For each={exceptions()}>
        {([ship, perm], i) => (
          <div class='w-full flex px-1.5 py-1 my-1 space-x-2 items-center border-yellow-950 border-4 rounded-md bg-yellow-700'>
            <div class='flex flex-wrap space-x-2 items-center flex-grow'>
              <span class='font-bold text-sm font-mono'>
                {ship}
              </span>
            </div>
            <Select
              value={perm}
              $value={(p) => state.setPlayerPerm(ship, p)}
              options={toPairs(
                'n  Banned, in  Visitor, add  Editor, admin  Admin',
              )}
            />
            {state.c.canAdmin && (
              <SmallButton onClick={() => state.delPlayerPerm(ship)}>
                x
              </SmallButton>
            )}
          </div>
        )}
      </For>
    </>
  );
}
