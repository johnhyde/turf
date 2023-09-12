import { batch, createMemo, createSignal, createEffect, onCleanup } from 'solid-js';
import { createStore, produce, reconcile } from "solid-js/store";
import { vec2, bind, input, makeImage, isValidPath, jClone } from 'lib/utils';
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
    props.$form('form', 'variations', 0, 'sprite', url)
  }

  async function setSpriteBmp(url) {
    try {
      const imageStuff = await makeImage(url);
      $spriteBmp(imageStuff.bitmap);
    } catch (e) {
      $spriteBmp(null);
      throw e;
    }
  }

  function uploadFile(e) {
    const file = e.target.files[0];
    $file(file);
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
        try {
          await setSpriteBmp(dataUrl);
          setSprite(dataUrl);
        } catch (err) {
          e.target.onError(err);
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
    if (e.key === 'Escape' && form()) {
      cancel();
      e.stopPropagation();
    } 
  }

  root.addEventListener('keydown', onKeyDown);
  onCleanup(() => {
    root.removeEventListener('keydown', onKeyDown);
  });

  const idClash = () => !!(props.skye && formId() && props.skye[formId()]);

  let uploader;
  return (
    <Show when={form()} keyed>
      <Modal class="top-0 left-0 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700" keydown={onKeyDown}>
        <p class="font-semibold">
          Item Name
        </p>
        <input use:input
          use:bind={[
            () => form()?.name,
            (s) => props.$form('form', 'name', s)
          ]}
        />
        <p class="font-semibold">Item ID</p>
        <input use:input
          use:bind={[
            formId,
            setFormId,
          ]}
          class={idClash() ? 'bg-orange-200' : ((!idValid() && form()) ? 'bg-red-200' : '')}
          placeholder='/item/identifier'
        />
        {idClash() &&
          <p>
            ID in use: {props.skye[formId()].name}
          </p>
        }
        <p class="font-semibold">Type</p>
        <label for="tile">Tile</label>
        <input type="radio" name="type" value="tile" id="tile"
          checked={props.form?.form?.type === 'tile'}
          onInput={(e) => e.currentTarget.checked && setType('tile')}
        />
        <label for="tile">Item</label>
        <input type="radio" name="type" value="item" id="item"
          checked={props.form?.form?.type === 'item'}
          onInput={(e) => e.currentTarget.checked && setType('item')}
        />
        <p class="font-semibold">Offset</p>
        <span>x:</span>
        {/* <input type="tel" pattern="-?[0-9]+" */}
        <input type="number"
          min={-tileSize}
          max={spriteBmp()?.width || 0}
          use:input
          use:bind={[
            () => form()?.offset?.x,
            (s) => props.$form('form', 'offset', 'x', s),
          ]} />
        <span>y:</span>
        {/* <input type="tel" pattern="-?[0-9]+" */}
        <input type="number"
          min={-tileSize}
          max={spriteBmp()?.height || 0}
          use:input
          use:bind={[
            () => form()?.offset?.y,
            (s) => props.$form('form', 'offset', 'y', s),
            // (s) => setOffset(vec2(form()?.offset?.x, s))
          ]} />
        <label for="collidable">
          <p class="font-semibold">Blocks Movement</p>
        </label>
        <input type="checkbox" id="collidable"
          checked={form()?.collidable}
          onInput={(e) => props.$form('form', 'collidable', e.currentTarget.checked)}
        />
        <p class="font-semibold">Image</p>
        {!file() &&
          <div class="flex items-center space-x-2">
            <input use:input
              use:bind={[
                () => file() ? '' : sprite(),
                setSprite
              ]}
              placeholder="Image URL"
            />
            <SmallButton onClick={() => setSpriteBmp(sprite())}>
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
        {spriteBmp() &&
          <OffsetInput
            bitmap={spriteBmp()}
            offset={offset()}
            $offset={setOffset}
          />
        }
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