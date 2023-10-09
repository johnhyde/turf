import { batch, createMemo, createSignal, createEffect, onCleanup, mergeProps } from 'solid-js';
import { createStore, produce, reconcile } from "solid-js/store";
import { vec2, bind, input, autofocus, makeImage, isValidPath, jClone } from 'lib/utils';
import { isSpecialFormId } from 'lib/turf';
import mapValues from 'lodash/mapValues';
import { useState } from 'stores/state.jsx';
import Heading from '@/Heading';
import SmallButton from '@/SmallButton';
import Radio from '@/Radio';
import Modal from '@/Modal';
import OffsetInput from '@/OffsetInput';

export default function FormEditor(props) {
  const state = useState();
  const [newForm, $newForm] = createStore({});
  createEffect(() => {
    $newForm(reconcile(jClone(props.form)));
  });
  const formDef = mergeProps(props.form, newForm);
  const formId = () => formDef.formId;
  const form = () => formDef.form;
  const offset = () => form().offset;
  const sprite = () => form()?.variations?.[0]?.sprite || '';
  const [file, $file] = createSignal(null);
  const [idValid, $idValid] = createSignal(null);
  const [spriteBmp, $spriteBmp] = createSignal(null);
  const [bmpError, $bmpError] = createSignal(false);
  const idChanged = () => props.editing && formId() !== props.form?.formId;
  const idClash = () => {
    if (props.editing && !idChanged()) return false;
    return !!(props.skye && formId() && props.skye[formId()]);
  }
  const idInputColor = () => {
    if (form() && !idValid()) return 'bg-red-200';
    return idClash() ? 'bg-orange-200' : '';
  }
  const readyToSave = () => idValid() && sprite();
  const addFn = () => props.addFn ?? state.addForm.bind(state);

  function isValidFormId(id) {
    if (isSpecialFormId(id)) return false;
    return isValidPath(id);
  }

  createEffect(() => {
    $idValid(isValidFormId(formId()));
  });

  function save() {
    if (readyToSave()) {
      $newForm('form', 'offset', (offset) => vec2(offset));
      addFn()(
        jClone(formDef),
        idChanged() ? props.form?.formId : undefined
      );
      cancel();
    }
  }
  
  function cancel() {
    clearUpload();
    props.$form(reconcile({}));
  }

  function deleteForm() {
    addFn()(
      undefined,
      props.form?.formId
    );
    cancel();
  }

  function setFormId(id) {
    id = id.trim();
    if (isValidFormId(id)) {
      $newForm('formId', id);
      $idValid(true);
    } else {
      $idValid(false);
    }
  }

  function setType(type) {
    $newForm('form', 'type', type);
  }
  
  function setOffset(offset) {
    batch(() => {
      $newForm('form', 'offset', 'x', offset.x);
      $newForm('form', 'offset', 'y', offset.y);
    });
  }

  function setSprite(url) {
    $newForm('form', 'variations', 0, 'sprite', url);
  }
  
  function setDeep(deep) {
    $newForm('form', 'variations', 0, 'deep', deep);
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


  let urlInput, uploader;
  return (
    <Show when={props.form?.form} keyed>
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
              (s) => $newForm('form', 'name', s)
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
          {idChanged() && props.form?.formId &&
            <p>
              ID will be changed from {props.form.formId}
            </p>
          }
        </div>
        <div class="flex space-x-2">
          <span class="font-semibold">Type</span>
          <Radio value={form()?.type} $value={setType} items={[['tile', 'Tile'], ['item', 'Item']]} bg="border border-yellow-950" bgActive="border border-yellow-950 bg-yellow-600" />
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
                (s) => $newForm('form', 'offset', 'x', s),
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
                (s) => $newForm('form', 'offset', 'y', s),
              ]} />
          </div>
        </div>
        <div class="flex items-center">
          <label for="collidable" class="font-semibold mr-2">
            Blocks Movement
          </label>
          <input type="checkbox" id="collidable"
            checked={form()?.collidable}
            onInput={(e) => $newForm('form', 'collidable', e.currentTarget.checked)}
          />
        </div>
        <div>
          <p class="font-semibold">Image</p>
          <div class="flex flex-col space-y-2">
            <p>
              Tiles are 32x32 pixels.
            </p>
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
            {/* {(form()?.type === 'tile' && (spriteBmp()?.width > 32 || spriteBmp()?.height > 32)) &&
              <p>
                This image is bigger than 32x32 pixels.
              </p>
            } */}
            {spriteBmp() &&
              <>
                <p class={'text-center rounded-md ' + (form()?.type === 'tile' && (spriteBmp()?.width > 32 || spriteBmp()?.height > 32) ? 'bg-red-200' : '')}>
                  {spriteBmp().width}x{spriteBmp().height}
                </p>
                <OffsetInput
                  bitmap={spriteBmp()}
                  offset={offset()}
                  $offset={setOffset}
                />
              </>
            }
          </div>
        </div>
        <div>
          <p class="font-semibold">Relative to Player</p>
          <Radio value={form()?.variations?.[0]?.deep} $value={setDeep} items={[['flat', 'Under'], ['back', 'Behind'], ['fore', 'In Front']]} bg="border border-yellow-950" bgActive="border border-yellow-950 bg-yellow-600" />
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