import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
} from 'solid-js';
import { createStore, produce, reconcile, unwrap } from 'solid-js/store';
import {
  autofocus,
  bind,
  hexToInt,
  input,
  isValidPath,
  jClone,
  processImageFiles,
  vec2,
} from 'lib/utils.js';
import { isSpecialFormId } from 'lib/turf.js';
import mapValues from 'lodash/mapValues';
import { useState } from 'stores/state.jsx';
import Heading from '@/Heading.jsx';
import SmallButton from '@/SmallButton.jsx';
import ItemButton from '@/ItemButton.jsx';
import UploadButton from '@/UploadButton.jsx';
import Radio from '@/Radio.jsx';
import PathInput from '@/PathInput.jsx';
import Modal from '@/Modal.jsx';
import EffectsEditor from '@/EffectsEditor.jsx';
import ListItemPicker from '@/ListItemPicker.jsx';
import VariationEditor from '@/VariationEditor.jsx';

export default function FormEditor(props) {
  const state = useState();
  const [newForm, $newForm] = createStore({});
  createEffect(() => {
    $newForm(reconcile(jClone(props.form)));
  });
  createEffect(() => {
    if (!props.form.form) {
      $idValid(null);
      $currentVar(0);
      $globalTint(null);
    }
  });
  const formDef = mergeProps(props.form, newForm);
  const formId = () => formDef.formId;
  const form = () => formDef.form;
  const fx = () => form().fx;
  const $fx = (...args) => $newForm('form', 'fx', ...args);
  const notGarb = () => form()?.type !== 'garb';
  const [idValid, $idValid] = createSignal(null);
  const [currentVar, $currentVar] = createSignal(0);
  const [globalTint, $globalTint] = createSignal(null);
  const idChanged = () => props.editing && formId() !== props.form?.formId;
  const idClash = () => {
    if (props.editing && !idChanged()) return false;
    return !!(props.skye && formId() && props.skye[formId()]);
  };
  // const idInputColor = () => {
  //   if (form() && !idValid()) return 'bg-red-200';
  //   return idClash() ? 'bg-orange-200' : '';
  // };
  const readyToSave = () => {
    if (!idValid()) return false;
    return (form().variations.length && form().variations.every((v) => {
      if (!v.sprite) return false;
      if (typeof v.sprite === 'string') return true;
      if (!v.sprite.frames) return false;
      return v.sprite.frames.every((f) => f);
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
      addFn()(
        {
          formId: formId(),
          form: jClone(form()),
        },
        idChanged() ? props.form?.formId : undefined,
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
      props.form?.formId,
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

  function setVariation(...args) {
    $newForm('form', 'variations', currentVar(), ...args);
  }

  function addVariation() {
    $newForm('form', 'variations', form().variations.length, {
      deep: notGarb() ? 'back' : 'fore',
      offset: { x: 0, y: 0 },
      tint: null,
      sprite: '',
    });
    $currentVar(form().variations.length - 1);
  }

  function delVariation(index) {
    $newForm('form', 'variations', produce((vars) => vars.splice(index, 1)));
    if (currentVar() >= form().variations.length) {
      $currentVar(form().variations.length - 1);
    }
  }

  function swapVariations(i) {
    $newForm('form', 'variations', (vars) => {
      const vi = vars[i];
      const vj = vars[i + 1];
      return [...vars.slice(0, i), vj, vi, ...vars.slice(i + 2)];
    });
  }

  function applyGlobalTint() {
    const tint = globalTint() ? hexToInt(globalTint()) : null;
    batch(() => {
      form().variations.forEach((_v, i) => {
        $newForm('form', 'variations', i, 'tint', tint);
      });
    });
  }

  function onFramesUpload(frames) {
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
          timing: [],
          frames: f,
        });
      }
    }
  }

  return (
    <Show when={props.form?.form} keyed>
      <Portal mount={document.getElementById('modals')}>
        <Modal class='top-0 left-0 !max-w-full flex flex-col space-y-2 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700 text-left'>
          <div class='flex'>
            <div class='flex flex-col space-y-2 p-2 max-w-[220px] border-r border-yellow-950 pr-4 mr-2'>
              {/* <div class='flex flex-col space-y-2 p-2 max-w-[220px]'> */}
              <div>
                <p class='font-semibold'>
                  Item Name
                </p>
                <input
                  use:bind={[
                    () => form()?.name,
                    (s) => $newForm('form', 'name', s),
                  ]}
                  use:autofocus
                  class='rounded-input'
                />
              </div>
              <div>
                <p class='font-semibold'>Item ID</p>
                <PathInput
                  value={formId()}
                  $value={setFormId}
                  invalid={form() && !idValid()}
                  warn={idClash()}
                />
                {
                  /* <input
                use:bind={[
                  formId,
                  setFormId,
                ]}
                class={'rounded-input ' + idInputColor()}
                placeholder='/item/identifier'
              /> */
                }
                {idValid() && idClash() &&
                  (
                    <p>
                      ID in use: {props.skye[formId()].name}
                    </p>
                  )}
                {idChanged() && props.form?.formId &&
                  (
                    <p>
                      ID will be changed from {props.form.formId}
                    </p>
                  )}
              </div>
              <Show when={notGarb()}>
                <div class='flex gap-2'>
                  <span class='font-semibold'>Type</span>
                  <Radio
                    value={form()?.type}
                    $value={setType}
                    items={[['tile', 'Tile'], ['item', 'Item'], [
                      'wall',
                      'Wall',
                    ]]}
                    bg='border border-yellow-950'
                    bgActive='border border-yellow-950 bg-yellow-600'
                  />
                </div>
              </Show>
              <Show when={form().variations.length > 1}>
                <span class='font-semibold'>Tint Override</span>
                <div class='flex gap-2 items-center'>
                  <Show
                    when={globalTint()}
                    fallback={
                      <SmallButton onClick={() => $globalTint('#ffffff')}>
                        +
                      </SmallButton>
                    }
                  >
                    <SmallButton onClick={() => $globalTint(null)}>
                      x
                    </SmallButton>
                    <input
                      type='color'
                      default='#ffffff'
                      use:bind={[globalTint, $globalTint]}
                    />
                  </Show>
                  <SmallButton onClick={applyGlobalTint}>
                    {globalTint() ? 'Set' : 'Clear'} All
                  </SmallButton>
                </div>
              </Show>
              <Show when={notGarb()}>
                <div class='flex items-center'>
                  <label for='collidable' class='font-semibold mr-2'>
                    Blocks Movement
                  </label>
                  <input
                    type='checkbox'
                    id='collidable'
                    checked={form()?.collidable}
                    onInput={(e) =>
                      $newForm('form', 'collidable', e.currentTarget.checked)}
                  />
                </div>
                <div>
                  <label class='font-semibold mr-2'>
                    Effects
                  </label>
                  <EffectsEditor
                    fx={fx()}
                    $fx={$fx}
                    form={form()}
                  />
                </div>
              </Show>
            </div>
            <div class='max-w-md flex flex-col space-y-2 p-2'>
              {
                /*<p>
                Tiles are 32x32 pixels. GIF uploads OK.
              </p>*/
              }
              <div class='flex gap-2 items-center'>
                <span class='font-semibold'>Variations</span>
                <UploadButton onFrames={onFramesUpload} multiple />
                <Show when={form().variations.length < 2}>
                  <SmallButton onClick={addVariation}>+</SmallButton>
                </Show>
              </div>
              <Show when={form().variations.length > 1}>
                <ListItemPicker
                  wall={form().type === 'wall'}
                  items={form().variations}
                  selected={currentVar()}
                  onAdd={addVariation}
                  editing
                  addButtonClass='w-[42px] h-[74px]'
                  button={(label, i, selected) => {
                    let bodyVar = i % 4;
                    if (bodyVar === 3) bodyVar = 1;
                    return (
                      <div className='relative'>
                        <ItemButton
                          onClick={() => $currentVar(i)}
                          selected={selected}
                          form={form()}
                          variation={i}
                          playerImage={!notGarb() &&
                            `sprites/garb/body-${bodyVar}-0.png`}
                          bgImage={notGarb() &&
                            'sprites/grass.png'}
                          flipBg={i % 4 === 3}
                        />
                        <SmallButton
                          class='absolute top-1 left-1 bg-opacity-50 z-[20] pointer-events-none'
                          tabindex='-1'
                        >
                          {label}
                        </SmallButton>
                        <SmallButton
                          class='absolute top-1 right-1 bg-opacity-50 z-[20]'
                          onClick={() => delVariation(i)}
                        >
                          x
                        </SmallButton>
                        <Show when={i !== 0}>
                          <SmallButton
                            class='absolute bottom-1 left-1 bg-opacity-50 z-[20]'
                            onClick={() => swapVariations(i - 1)}
                          >
                            {'<'}
                          </SmallButton>
                        </Show>
                        <Show when={i !== form().variations.length - 1}>
                          <SmallButton
                            class='absolute bottom-1 right-1 bg-opacity-50 z-[20]'
                            onClick={() => swapVariations(i)}
                          >
                            {'>'}
                          </SmallButton>
                        </Show>
                      </div>
                    );
                  }}
                />
              </Show>
              <div class='border-b border-yellow-950' />
              <Show when={form().variations[currentVar()]}>
                <VariationEditor
                  type={form().type}
                  var={form().variations[currentVar()]}
                  variation={currentVar()}
                  $var={setVariation}
                  onDel={() => delVariation(currentVar())}
                />
              </Show>
            </div>
            {
              /* {dev &&
            <div class="break-all">
              {JSON.stringify(form(), (_, v) => {
                if (typeof v === 'string') return v.substring(0,40);
                return v;
              }, 2)}
            </div>
          } */
            }
          </div>
          <div class='flex justify-center space-x-2'>
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
      </Portal>
    </Show>
  );
}
