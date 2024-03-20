import { batch, createMemo, createSignal, createEffect, onCleanup, mergeProps } from 'solid-js';
import { createStore, produce, reconcile } from "solid-js/store";
import { parseGIF, decompressFrames } from 'gifuct-js';
import { vec2, bind, input, autofocus, makeImage, convertGifFramesToDataUrls, processImageFiles, jClone } from 'lib/utils';
import { useState } from 'stores/state.jsx';
import SmallButton from '@/SmallButton';
import Radio from '@/Radio';
import OffsetInput from '@/OffsetInput';

export default function FrameEditor(props) {
  const state = useState();
  const [bmps, $bmps] = createStore({});
  const frame = () => props.frame || '';
  const spriteBmp = () => bmps[frame()];
  const [bmpError, $bmpError] = createSignal(false);

  createEffect(() => {
    if (props.frame) clearUpload();
  });

  createEffect(() => {
    if (!spriteBmp() && frame()?.startsWith?.('data:')) loadSprite();
  });

  onCleanup(() => {
    clearUpload();
  });

  function setFrame(url) {
    props.$frame(url);
  }

  function loadSprite() {
    setSpriteBmp(frame());
  }

  async function setSpriteBmp(url) {
    try {
      const imageStuff = await makeImage(url);
      $bmps(url, imageStuff.bitmap);
      return imageStuff;
    } catch (e) {
      console.error(e);
      $bmps(url, null);
      $bmpError(true);
      return false;
    }
  }

  async function uploadFiles(e) {
    let [frames, _errors] = await processImageFiles(e.target.files);
    frames = frames.flat();
    if (frames.length) {
      if (frames.length === 1) {
        setFrame(frames[0]);
      } else {
        props.$sprite((sprite) => {
          if (sprite) {
            if (typeof sprite === 'string') {
              frames = [sprite, ...frames];
            } else {
              frames = [...sprite.frames, ...frames];
            }
          }
          return {
            type: 'loop',
            frames,
          };
        })
      }
    }
    uploader.value = '';
  }

  function clearUpload() {
    uploader.value = '';
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      if (urlInput === document.activeElement) {
        loadSprite();
        e.stopPropagation();
      }
    }
  }

  root.addEventListener('keydown', onKeyDown);
  onCleanup(() => {
    root.removeEventListener('keydown', onKeyDown);
  });


  let urlInput, uploader;
  return (
    <>
      <div class="w-full flex gap-2">
        <Show when={props.frameCount <= 1 && props.frame}>
          <SmallButton onClick={() => props.onAdd?.()} class="grow">
            Add Frame
          </SmallButton>
        </Show>
        <Show when={props.frameCount > 1 || props.frame}>
          <SmallButton onClick={() => props.onDel?.()} class="grow">
            {props.frameCount > 1 ? 'Delete' : 'Clear'} Frame
          </SmallButton>
        </Show>
      </div>
      <div class="flex items-center space-x-2">
        <input
          use:bind={[
            () => file() ? '' : frame(),
            (s) => { $bmpError(false); setFrame(s); }
          ]}
          placeholder="Image URL"
          ref={urlInput}
          class="rounded-md pl-1"
        />
        <Show when={!spriteBmp()}>
          <SmallButton onClick={loadSprite}>
            Load
          </SmallButton>
        </Show>
      </div>
      <div class="flex items-center space-x-2">
        <SmallButton onClick={() => uploader.click()}>
          Upload Frames
        </SmallButton>
        <input type="file" accept="image/*" multiple onInput={uploadFiles} ref={uploader} class="hidden"/>
      </div>
      {bmpError() && <p>Could not load the image</p>}
      {/* {(props.type === 'tile' && (spriteBmp()?.width > 32 || spriteBmp()?.height > 32)) &&
        <p>
          This image is bigger than 32x32 pixels.
        </p>
      } */}
      {spriteBmp() &&
        <>
          <p class={'text-center rounded-md ' + (props.type === 'tile' && (spriteBmp()?.width > 32 || spriteBmp()?.height > 32) ? 'bg-red-200' : '')}>
            {spriteBmp().width}x{spriteBmp().height}
          </p>
          <OffsetInput
            bitmap={spriteBmp()}
            offset={props.offset}
            $offset={props.$offset}
          />
        </>
      }
    </>
  );
};