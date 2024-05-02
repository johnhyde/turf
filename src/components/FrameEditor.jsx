import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
} from 'solid-js';
import { createStore, produce, reconcile } from 'solid-js/store';
import { autofocus, bind, makeImage, tintImageData } from 'lib/utils.js';
import { useState } from 'stores/state.jsx';
import SmallButton from '@/SmallButton.jsx';
import UploadButton from '@/UploadButton.jsx';
import OffsetInput from '@/OffsetInput.jsx';

export default function FrameEditor(props) {
  const state = useState();
  const [imgDatas, $imgDatas] = createStore({});
  const [spriteBmp, $spriteBmp] = createSignal(null);
  const frame = () => props.frame || '';
  createEffect(async () => {
    let imgData = imgDatas[frame()];
    if (!imgData) return $spriteBmp(null);
    if (props.var.tint != null) {
      imgData = tintImageData(imgData, props.var.tint);
    }
    $spriteBmp(await createImageBitmap(imgData));
  });
  const [bmpError, $bmpError] = createSignal(false);

  createEffect(() => {
    if (props.frame) clearUpload();
  });

  createEffect(() => {
    if (
      !spriteBmp() && document.activeElement !== urlInput && frame() &&
      !frame().startsWith?.('http')
    ) loadSprite();
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
      if (url.startsWith('http')) {
        const { dataUrl } = imageStuff;
        $imgDatas(dataUrl, imageStuff.imageData);
        setFrame(dataUrl);
      } else {
        $imgDatas(url, imageStuff.imageData);
      }
      return imageStuff;
    } catch (e) {
      console.error(e);
      $imgDatas(url, null);
      $bmpError(true);
      return false;
    }
  }

  function onFrameUpload(frame) {
    const frames = [frame].flat();
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
            timing: [],
            frames,
          };
        });
      }
    }
  }

  function clearUpload() {
    if (uploader) uploader.value = '';
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
      <div class='w-full flex gap-2'>
        <Show when={props.frameCount > 2 || props.frame}>
          <SmallButton onClick={() => props.onDel?.()} class='grow'>
            {props.frameCount > 1 ? 'Delete' : 'Clear'} Frame
          </SmallButton>
        </Show>
      </div>
      <div class='flex items-center space-x-2'>
        <input
          use:bind={[
            frame,
            (s) => {
              $bmpError(false);
              setFrame(s);
            },
          ]}
          placeholder='Image URL'
          ref={urlInput}
          class='rounded-md pl-1'
        />

        <Show
          when={frame() && !spriteBmp()}
          fallback={<UploadButton onFrames={onFrameUpload} multiple />}
        >
          <SmallButton onClick={loadSprite}>
            Load
          </SmallButton>
        </Show>
      </div>
      {bmpError() && <p>Could not load the image</p>}

      {
        /* {(props.type === 'tile' && (spriteBmp()?.width > 32 || spriteBmp()?.height > 32)) &&
        <p>
          This image is bigger than 32x32 pixels.
        </p>
      } */
      }

      {spriteBmp() &&
        (
          <>
            <p
              class={'text-center rounded-md ' +
                (props.type === 'tile' &&
                    (spriteBmp()?.width > 32 || spriteBmp()?.height > 32)
                  ? 'bg-red-200'
                  : '')}
            >
              {spriteBmp().width}x{spriteBmp().height}
            </p>
            <OffsetInput
              type={props.type}
              deep={props.var.deep}
              variation={props.variation}
              frame={props.frameI}
              bitmap={spriteBmp()}
              offset={props.var.offset}
              $offset={props.$offset}
            />
          </>
        )}
    </>
  );
}
