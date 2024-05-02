import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
} from 'solid-js';
import { createStore, produce, reconcile } from 'solid-js/store';
import { bind, bindNum, hexToInt, intToHex } from 'lib/utils.js';
import { getSpriteFps } from 'lib/turf.js';
import { useState } from 'stores/state.jsx';
import SmallButton from '@/SmallButton.jsx';
import UploadButton from '@/UploadButton.jsx';
import Radio from '@/Radio.jsx';
import ListItemPicker from '@/ListItemPicker.jsx';
import FrameEditor from '@/FrameEditor.jsx';

export default function VariationEditor(props) {
  const state = useState();
  const [currentFrame, $currentFrame] = createSignal(0);
  const simple = () => typeof props.var.sprite === 'string';
  const frames = () => props.var.sprite?.frames || [props.var.sprite];
  const $sprite = (...args) => props.$var('sprite', ...args);
  const $deep = (deep) => props.$var('deep', deep);
  const $offset = (...args) => props.$var('offset', ...args);
  const $tint = (tint) =>
    props.$var('tint', tint == null ? null : hexToInt(tint));
  const fps = () => Math.round(getSpriteFps(props.var.sprite));
  const $fps = (fps) =>
    props.$var('sprite', 'timing', reconcile([Math.round(1000 / fps)]));

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
        timing: [],
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

  function onFramesUpload(frames) {
    frames = frames.flat();
    if (frames.length) {
      $sprite((sprite) => {
        if (sprite) {
          if (typeof sprite === 'string') {
            frames = [sprite, ...frames];
          } else {
            frames = [...sprite.frames, ...frames];
          }
        }
        if (frames.length === 1) return frames[0];
        return {
          type: 'loop',
          timing: [],
          frames,
        };
      });
    }
  }

  return (
    <>
      <div class='flex gap-2 items-center'>
        <span class='font-semibold'>Frames</span>
        <UploadButton onFrames={onFramesUpload} multiple />
        <Show when={frames().length < 2}>
          <SmallButton onClick={addFrame}>+</SmallButton>
        </Show>
      </div>
      <Show when={frames().length > 1}>
        <div class='flex gap-2 items-center'>
          <ListItemPicker
            items={frames()}
            selected={currentFrame()}
            onSelect={$currentFrame}
            onAdd={addFrame}
            editing
          />
        </div>
        <div>
          <p class='break-word'>
            {/* Frame dimensions do not match. Some frames will be distorted. */}
            If frame dimensions do not match,&nbsp;
            {/* <br/> */}
            some frames will be distorted.
          </p>
        </div>
        <div class='border-b border-yellow-950' />
      </Show>
      <FrameEditor
        type={props.type}
        var={props.var}
        variation={props.variation}
        frameI={currentFrame()}
        frame={frames()?.[currentFrame()] || ''}
        $frame={(...args) => setFrame(currentFrame(), ...args)}
        frameCount={frames().length}
        // sprite={props.var.sprite}
        $sprite={(sprite) => $sprite(sprite)}
        $offset={$offset}
        onAdd={addFrame}
        onDel={() => delFrame(currentFrame())}
      />
      <div class='flex gap-2'>
        <span class='font-semibold'>Offset</span>
        <div>
          <span class='mr-1'>x:</span>
          <input
            type='number'
            class='rounded-md pl-1 w-12'
            min={-tileSize}
            // todo: figure out some way to do this again?
            // but there an be many bmps of different size
            // max={spriteBmp()?.width || 0}
            max='99'
            use:bindNum={[
              () => props.var.offset?.x || 0,
              (n) => $offset(vec2(n, props.var.offset?.y)),
            ]}
          />
        </div>
        <div>
          <span class='mr-1'>y:</span>
          <input
            type='number'
            class='rounded-md pl-1 w-12'
            min={-tileSize}
            // max={spriteBmp()?.height || 0}
            max='99'
            use:bindNum={[
              () => props.var.offset?.y || 0,
              (n) => $offset(vec2(props.var.offset?.x, Number(n))),
            ]}
          />
        </div>
      </div>
      <div class='flex gap-2 items-center'>
        <span class='font-semibold'>Tint</span>
        <Show
          when={props.var.tint != null}
          fallback={
            <SmallButton onClick={() => $tint('#ffffff')}>
              +
            </SmallButton>
          }
        >
          <SmallButton onClick={() => $tint(null)}>x</SmallButton>
          <input
            type='color'
            default='#ffffff'
            use:bind={[
              () => intToHex(props.var.tint),
              $tint,
            ]}
          />
        </Show>
        <Show when={frames().length > 1}>
          <span class='ml-4 font-semibold'>FPS</span>
          <input
            type='number'
            class='rounded-md pl-1 w-12'
            min='0'
            max='60'
            use:bindNum={[fps, $fps]}
          />
        </Show>
      </div>
      <p class='font-semibold'>Relative to Player</p>
      <Radio
        value={props.var.deep}
        $value={$deep}
        items={[['flat', 'Under'], ['back', 'Behind'], ['fore', 'In Front']]}
        bg='border border-yellow-950'
        bgActive='border border-yellow-950 bg-yellow-600'
      />
    </>
  );
}
