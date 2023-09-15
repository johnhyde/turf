import { batch, createMemo, createSignal, createEffect, onCleanup } from 'solid-js';
import { createStore, produce, reconcile } from "solid-js/store";
import { vec2, bind, input, autofocus, makeImage, isValidPath, jClone } from 'lib/utils';
import mapValues from 'lodash/mapValues';
import { useState } from 'stores/state.jsx';
import Heading from '@/Heading';
import SmallButton from '@/SmallButton';
import Modal from '@/Modal';
import OffsetInput from '@/OffsetInput';

export default function FormEditor(props) {
  const state = useState();
  const formId = () => props.form?.formId;
  const form = () => props.form?.form;
  const offset = () => form().offset;
  const sprite = () => form()?.variations?.[0]?.sprite || '';
  const [file, $file] = createSignal(null);
  const [idValid, $idValid] = createSignal(null);
  const [spriteBmp, $spriteBmp] = createSignal(null);
  const [bmpError, $bmpError] = createSignal(false);
  const idInputColor = () => {
    if (form() && !idValid()) return 'bg-red-200';
    return idClash() ? 'bg-orange-200' : '';
  }
  const readyToSave = () => idValid() && sprite();

  function isValidFormId(id) {
    if (id === '/portal') return false;
    return isValidPath(id);
  }

  createEffect(() => {
    $idValid(isValidFormId(formId()));
  });

  function save() {
    if (readyToSave()) {
      props.$form('form', 'offset', (offset) => vec2(offset));
      (props.addFn ?? state.addForm.bind(state))(jClone(props.form));
      cancel();
    }
  }
  
  function cancel() {
    clearUpload();
    props.$form(reconcile({}));
  }

  function setFormId(id) {
    id = id.trim();
    if (isValidFormId(id)) {
      props.$form('formId', id);
      $idValid(true);
    } else {
      $idValid(false);
    }
  }

  function setType(type) {
    props.$form('form', 'type', type);
  }
  
  function setOffset(offset) {
    batch(() => {
      props.$form('form', 'offset', 'x', offset.x);
      props.$form('form', 'offset', 'y', offset.y);
    });
  }

  function setSprite(url) {
    props.$form('form', 'variations', 0, 'sprite', url);
  }

  function loadSprite() {
    setSpriteBmp(sprite());
  }

  async function setSpriteBmp(url) {
    try {
      const imageStuff = await makeImage(url);
      $spriteBmp(imageStuff.bitmap);
      return imageStuff;
    } catch (e) {
      $spriteBmp(null);
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
    setSprite('');
    $spriteBmp(null);
    $file(null);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && form()) {
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

  const idClash = () => !!(props.skye && formId() && props.skye[formId()]);

  let urlInput, uploader;
  return (
    <Show when={form()} keyed>
      <Modal
        class="top-0 left-0 flex flex-col space-y-2 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700"
        onClose={cancel}
      >
        <div>
          <p class="font-semibold">
            Item Name
          </p>
          <input
            use:bind={[
              () => form()?.name,
              (s) => props.$form('form', 'name', s)
            ]}
            use:autofocus
            class="rounded-input"
          />
        </div>
        <div>
          <p class="font-semibold">Item ID</p>
          <input
            use:bind={[
              formId,
              setFormId,
            ]}
            class={'rounded-input ' + idInputColor()}
            placeholder='/item/identifier'
          />
          {idValid() && idClash() &&
            <p>
              ID in use: {props.skye[formId()].name}
            </p>
          }
        </div>
        <div class="flex space-x-2">
          <span class="font-semibold">Type</span>
          <div>
            <label for="tile" class="mr-1">Tile</label>
            <input type="radio" name="type" value="tile" id="tile"
              checked={props.form?.form?.type === 'tile'}
              onInput={(e) => e.currentTarget.checked && setType('tile')}
            />
          </div>
          <div>
            <label for="tile" class="mr-1">Item</label>
            <input type="radio" name="type" value="item" id="item"
              checked={props.form?.form?.type === 'item'}
              onInput={(e) => e.currentTarget.checked && setType('item')}
            />
          </div>
        </div>
        <div class="flex space-x-2">
          <span class="font-semibold">Offset</span>
          <div>
            <span class="mr-1">x:</span>
            <input type="number"
              class="rounded-md pl-1"
              min={-tileSize}
              max={spriteBmp()?.width || 0}
              use:bind={[
                () => form()?.offset?.x,
                (s) => props.$form('form', 'offset', 'x', s),
              ]} />
          </div>
          <div>
            <span class="mr-1">y:</span>
            <input type="number"
              class="rounded-md pl-1"
              min={-tileSize}
              max={spriteBmp()?.height || 0}
              use:bind={[
                () => form()?.offset?.y,
                (s) => props.$form('form', 'offset', 'y', s),
              ]} />
          </div>
        </div>
        <div class="flex items-center">
          <label for="collidable" class="font-semibold mr-2">
            Blocks Movement
          </label>
          <input type="checkbox" id="collidable"
            checked={form()?.collidable}
            onInput={(e) => props.$form('form', 'collidable', e.currentTarget.checked)}
          />
        </div>
        <div>
          <p class="font-semibold">Image</p>
          <div class="flex flex-col space-y-2">
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
            {spriteBmp() &&
              <OffsetInput
                bitmap={spriteBmp()}
                offset={offset()}
                $offset={setOffset}
              />
            }
          </div>
        </div>
        <div class="flex justify-center space-x-2">
          <SmallButton onClick={save} disabled={!readyToSave()}>
            Save
          </SmallButton>
          <SmallButton onClick={cancel}>
            Cancel
          </SmallButton>
        </div>
      </Modal>
    </Show>
  );
};