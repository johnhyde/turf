import { batch, createMemo, createSignal, createEffect, onCleanup, mergeProps } from 'solid-js';
import { createStore, produce, reconcile } from "solid-js/store";
import { useState } from 'stores/state.jsx';
import SmallButton from '@/SmallButton';
import Radio from '@/Radio';
import ListItemPicker from '@/ListItemPicker';
import FrameEditor from '@/FrameEditor';

export default function VariationEditor(props) {
  const state = useState();
  // const [frames, $frames] = createStore([]);
  const [currentFrame, $currentFrame] = createSignal(0);
  const simple = () => typeof props.var.sprite === 'string';
  const frames = () => props.var.sprite?.frames || [props.var.sprite];
  const $sprite = (...args) => props.$var('sprite', ...args);
  const $deep = (deep) => props.$var('deep', deep);

  // const framesMismatch = () => {
  //   let maxDims;
  //   frames().forEach((img) => {
  //     if (!maxDims) maxDims = vec2()
  //     maxDims.x = Math.max(maxDims.x, img.width);
  //     maxDims.y = Math.max(maxDims.y, img.height);
  //   });
  // }

  createEffect(() => {
    if (props.var) $currentFrame(0);
  });

  function setFrame(frame, ...args) {
    if (simple()) {
      $sprite(...args);
    } else {
      $sprite('frames', frame, ...args);
    }
  }
  
  function addFrame() {
    if (simple()) {
      $sprite({
        type: 'loop',
        frames: frames(),
      });
    }
    $sprite('frames', frames().length, '');
    $currentFrame(frames().length - 1);
  }

  function delFrame(index) {
    if (simple()) {
      $sprite('');
    } else {
      $sprite('frames', produce((frames) => frames.splice(index, 1)));
      if (currentFrame() >= frames().length) $currentFrame(frames().length - 1);
      if (frames().length === 1) {
        $sprite(frames()[0]);
      } else if (!frames().length) {
        $sprite('');
      }
    }
  }

  return (
    <>
      <SmallButton onClick={() => props.onDel?.()}>
        Delete Variation
      </SmallButton>
      <Show when={frames().length > 1}>
        <div class="flex gap-2 items-center">
          <span class="font-semibold">Frames</span>
          <ListItemPicker
            items={frames()}
            selected={currentFrame()}
            onSelect={$currentFrame}
            onAdd={addFrame}
            editing
          />
        </div>
        <div>
          <p class="break-word">
            {/* Frame dimensions do not match. Some frames will be distorted. */}
            If frame dimensions do not match,
            {/* <br/> */}
            some frames will be distorted.
          </p>
        </div>
        {/* </Show> */}
        <div class="border-b border-yellow-950" />
      </Show>
      <FrameEditor
        frame={frames()?.[currentFrame()] || ''}
        $frame={(...args) => setFrame(currentFrame(), ...args)}
        frameCount={frames().length}
        // sprite={props.var.sprite}
        $sprite={(sprite) => $sprite(sprite)}
        offset={props.offset}
        $offset={props.$offset}
        onAdd={addFrame}
        onDel={() => delFrame(currentFrame())}
      />
      <div>
        <p class="font-semibold">Relative to Player</p>
        <Radio value={props.var.deep} $value={$deep} items={[['flat', 'Under'], ['back', 'Behind'], ['fore', 'In Front']]} bg="border border-yellow-950" bgActive="border border-yellow-950 bg-yellow-600" />
      </div>
    </>
  );
};