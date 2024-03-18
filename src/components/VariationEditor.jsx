import { batch, createMemo, createSignal, createEffect, onCleanup, mergeProps } from 'solid-js';
import { createStore, produce, reconcile } from "solid-js/store";
import { vec2, bind, input, autofocus, makeImage, jClone } from 'lib/utils';
import { useState } from 'stores/state.jsx';
import SmallButton from '@/SmallButton';
import Radio from '@/Radio';
import OffsetInput from '@/OffsetInput';

export default function VariationEditor(props) {
  const state = useState();
  const [bmps, $bmps] = createStore({});
  const sprite = () => props.var.sprite || '';
  const spriteBmp = () => bmps[sprite()];
  const [file, $file] = createSignal(null);
  const [bmpError, $bmpError] = createSignal(false);

  createEffect(() => {
    if (props.var) clearUpload();
  });

  onCleanup(() => {
    clearUpload();
  });

  function setSprite(url) {
    props.$var('sprite', url);
  }
  
  function setDeep(deep) {
    props.$var('deep', deep);
  }

  function loadSprite() {
    setSpriteBmp(sprite());
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

  function uploadFile(e) {
    const file = e.target.files[0];
    $file(file);
    $bmpError(false);
    if (!file) {
      setSprite('');
    } else {
      if (!file.type.startsWith("image/")) {
        console.log('file not an image: ', file.type);
        clearUpload();
        return;
      }
  
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        const imageStuff = await setSpriteBmp(dataUrl);
        if (imageStuff) {
          setSprite(dataUrl);
        } else {
          e.target.onError();
        }
      };
      reader.onError = () => {
        console.log('could not import image: ', file.name);
        clearUpload();
      };
      reader.readAsDataURL(file);
    }
  }

  function clearUpload() {
    uploader.value = '';
    $file(null);
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
      <SmallButton onClick={() => props.onDel?.()}>
        Delete Variation
      </SmallButton>
      {!file() &&
        <div class="flex items-center space-x-2">
          <input
            use:bind={[
              () => file() ? '' : sprite(),
              (s) => { $bmpError(false); setSprite(s); }
            ]}
            placeholder="Image URL"
            ref={urlInput}
          />
          <SmallButton onClick={loadSprite}>
            Load
          </SmallButton>
        </div>
      }
      <div class="flex items-center space-x-2">
        <SmallButton onClick={() => uploader.click()}>
          Upload
        </SmallButton>
        {file() && <>
          <span>
            {file().name}
          </span>
          <SmallButton onClick={clearUpload}>
            x
          </SmallButton>
        </>}
        <input type="file" onInput={uploadFile} ref={uploader} class="hidden"/>
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
      <div>
        <p class="font-semibold">Relative to Player</p>
        <Radio value={props.var.deep} $value={setDeep} items={[['flat', 'Under'], ['back', 'Behind'], ['fore', 'In Front']]} bg="border border-yellow-950" bgActive="border border-yellow-950 bg-yellow-600" />
      </div>
    </>
  );
};