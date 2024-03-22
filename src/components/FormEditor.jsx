import { batch, createMemo, createSignal, createEffect, onCleanup, mergeProps } from 'solid-js';
import { createStore, produce, reconcile, unwrap } from "solid-js/store";
import { vec2, bind, input, autofocus, processImageFiles, isValidPath, jClone } from 'lib/utils';
import { isSpecialFormId } from 'lib/turf';
import mapValues from 'lodash/mapValues';
import { useState } from 'stores/state.jsx';
import Heading from '@/Heading';
import SmallButton from '@/SmallButton';
import Radio from '@/Radio';
import Modal from '@/Modal';
import ListItemPicker from '@/ListItemPicker';
import VariationEditor from '@/VariationEditor';

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
  const notGarb = () => form()?.type !== 'garb';
  const [idValid, $idValid] = createSignal(null);
  const [currentVar, $currentVar] = createSignal(0);
  const idChanged = () => props.editing && formId() !== props.form?.formId;
  const idClash = () => {
    if (props.editing && !idChanged()) return false;
    return !!(props.skye && formId() && props.skye[formId()]);
  }
  const idInputColor = () => {
    if (form() && !idValid()) return 'bg-red-200';
    return idClash() ? 'bg-orange-200' : '';
  }
  const readyToSave = () => {
    if (!idValid()) return false;
    return (form().variations.length && form().variations.every((v) => {
      if (!v.sprite) return false;
      if (typeof v.sprite === 'string') return true;
      if (!v.sprite.frames) return false;
      return v.sprite.frames.every(f => f);
    }));
  };
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

  function setVariation(...args) {
    $newForm('form', 'variations', currentVar(), ...args);
  }

  function addVariation() {
    $newForm('form', 'variations', form().variations.length, {
      deep: (form().type === 'garb') ? 'fore' : 'back',
      sprite: '',
    });
    $currentVar(form().variations.length - 1);
  }

  function delVariation(index) {
    $newForm('form', 'variations', produce((vars) => vars.splice(index, 1)));
    if (currentVar() >= form().variations.length) $currentVar(form().variations.length - 1);
  }

  async function uploadFiles(e) {
    const [frames, _errors] = await processImageFiles(e.target.files);
    for (const f of frames) {
      // if sprite is empty, overwrite rather than adding
      $currentVar(form().variations.length - 1);
      if (form().variations[currentVar()]?.sprite) {
        addVariation();
      }
      if (typeof f === 'string') {
        setVariation('sprite', f);
      } else {
        setVariation('sprite', {
          type: 'loop',
          frames: f,
        });
      }
    };
    uploader.value = '';
  }

  let uploader;
  return (
    <Show when={props.form?.form} keyed>
      <Modal
        class="top-0 left-0 !max-w-full flex flex-col space-y-2 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700"
        onClose={cancel}
      >
        <div class="flex">
          <div class="flex flex-col space-y-2 p-2">
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
            <Show when={notGarb()}>
              <div class="flex gap-2">
                <span class="font-semibold">Type</span>
                <Radio value={form()?.type} $value={setType} items={[['tile', 'Tile'], ['item', 'Item'], ['wall', 'Wall']]} bg="border border-yellow-950" bgActive="border border-yellow-950 bg-yellow-600" />
              </div>
            </Show>
            <div class="flex gap-2">
              <span class="font-semibold">Offset</span>
              <div>
                <span class="mr-1">x:</span>
                <input type="number"
                  class="rounded-md pl-1 w-12"
                  min={-tileSize}
                  // todo: figure out some way to do this again?
                  // but there an be many bmps of different size
                  // max={spriteBmp()?.width || 0}
                  max="99"
                  use:bind={[
                    () => form()?.offset?.x,
                    (s) => $newForm('form', 'offset', 'x', Number(s)),
                  ]} />
              </div>
              <div>
                <span class="mr-1">y:</span>
                <input type="number"
                  class="rounded-md pl-1 w-12"
                  min={-tileSize}
                  // max={spriteBmp()?.height || 0}
                  max="99"
                  use:bind={[
                    () => form()?.offset?.y,
                    (s) => $newForm('form', 'offset', 'y', Number(s)),
                  ]} />
              </div>
            </div>
            <Show when={notGarb()}>
              <div class="flex items-center">
                <label for="collidable" class="font-semibold mr-2">
                  Blocks Movement
                </label>
                <input type="checkbox" id="collidable"
                  checked={form()?.collidable}
                  onInput={(e) => $newForm('form', 'collidable', e.currentTarget.checked)}
                />
              </div>
            </Show>
          </div>
          <div class="max-w-md flex flex-col space-y-2 p-2">
            <p class="font-semibold">Image</p>
            <div class="flex flex-col space-y-2">
              <p>
                Tiles are 32x32 pixels. GIF uploads OK.
              </p>
              <div class="flex gap-2 items-center">
                <span class="font-semibold">Variations</span>
                <ListItemPicker
                  wall={form().type === 'wall'}
                  items={form().variations}
                  selected={currentVar()}
                  onSelect={$currentVar}
                  onAdd={addVariation}
                  editing
                />
                <div class="flex items-center space-x-2">
                  <SmallButton onClick={() => uploader.click()}>
                    Upload
                  </SmallButton>
                  <input type="file" accept="image/*" multiple onInput={uploadFiles} ref={uploader} class="hidden"/>
                </div>
              </div>
              <Show when={form().variations[currentVar()]}>
                <div class="border-b border-yellow-950" />
                <VariationEditor
                  type={form().type}
                  var={form().variations[currentVar()]}
                  $var={setVariation}
                  offset={offset()}
                  $offset={setOffset}
                  onDel={() => delVariation(currentVar())}
                />
              </Show>
            </div>
          </div>
          {/* {dev &&
            <div class="break-all">
              {JSON.stringify(form(), (_, v) => {
                if (typeof v === 'string') return v.substring(0,40);
                return v;
              }, 2)}
            </div>
          } */}
        </div>
        <div class="flex justify-center space-x-2">
          <SmallButton onClick={save} disabled={!readyToSave()}>
            Save
          </SmallButton>
          <SmallButton onClick={cancel}>
            Cancel
          </SmallButton>
          <Show when={props.editing}>
            <SmallButton onClick={deleteForm}>
              Delete
            </SmallButton>
          </Show>
        </div>
      </Modal>
    </Show>
  );
};