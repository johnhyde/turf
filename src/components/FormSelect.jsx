import { createMemo, createSelector, splitProps } from 'solid-js';
import set from 'lodash/set';
import { useState } from 'stores/state.jsx';
import { splitPath } from 'lib/utils.js';
import ItemButton from '@/ItemButton.jsx';
import SmallButton from '@/SmallButton.jsx';

export default function FormSelect(props) {
  const [_props, passThru] = splitProps(props, [
    'forms',
    'convertedForms',
    'id',
    'fallback',
  ]);
  const [buttonProps, _rest] = splitProps(passThru, [
    'playerImage',
    'bgImage',
    'buttons',
    'onButton',
  ]);
  const state = useState();
  const isSelected = createSelector(() => props.selectedId ?? NaN);
  function convertFormObj(obj) {
    const forms = Object.entries(obj);
    if (props.sort) {
      forms.sort(([a, _fA], [b, _fB]) => {
        return a.localeCompare(b);
      });
    }
    // .sort(([a, _formA], [b, _formB]) => {
    //   return a > b ? 1 : (a < b ? -1 : 0);
    // })
    return forms.map(([id, obj]) => {
      const form = obj.form || null;
      delete obj.form;
      return {
        id,
        form,
        children: convertFormObj(obj),
      };
    });
  }
  const forms = createMemo(() => {
    if (props.convertedForms) return props.convertedForms;
    const obj = {};
    props.forms.forEach(([id, form]) => {
      const path = props.fold ? splitPath(id) : [id];
      set(obj, [...path, 'form'], form);
    });
    return convertFormObj(obj);
  });

  return (
    <Index each={forms()} fallback={props.fallback}>
      {(item, index) => {
        const i = () => index;
        const j = item;
        const id = () => (props.id ?? '') + j().id;
        const form = () => j().form;
        const children = () => j().children;
        const preview = () => {
          function previewForm(f) {
            if (f.form) return f.form;
            return previewForm(f.children[0]);
          }
          return previewForm(j());
        };
        const solo = () => {
          if (form()) return children().length === 0;
          return children().length === 1;
        };
        const collapse = () => {
          state.toggleCollapseForm(id());
        };
        const onSelect = () => {
          props.select(id(), i());
        };
        const Button = (props) => {
          return (
            <div class='relative group'>
              <ItemButton
                onClick={props.onClick}
                selected={isSelected(props.id)}
                form={props.form}
                playerImage={props.playerImage}
                bgImage={props.bgImage}
              />
              <div class='absolute top-0 left-0 w-full h-full z-[15] flex flex-wrap gap-1 justify-center items-center pointer-events-none invisible group-hover:visible'>
                <For each={props.buttons}>
                  {([label, buttonName]) => (
                    <SmallButton
                      onClick={() =>
                        props.onButton?.(buttonName, props.id, props.i)}
                      class='pointer-events-auto !bg-[#A1620780]'
                    >
                      {/* A16207 */}
                      {label}
                    </SmallButton>
                  )}
                </For>
              </div>
            </div>
          );
        };
        return (
          <>
            <Show
              when={solo() || state.editor.collapseForm[id()]}
              fallback={
                <Button
                  form={preview()}
                  onClick={collapse}
                  playerImage={props.playerImage}
                  bgImage={props.bgImage}
                  buttons={[[j().id, '']]}
                  onButton={collapse}
                >
                </Button>
              }
            >
              <Show when={!solo()}>
                <SmallButton onClick={collapse}>
                  {id()}
                </SmallButton>
              </Show>
              <Show when={form()}>
                <Button
                  form={form()}
                  id={id()}
                  i={i()}
                  onClick={onSelect}
                  {...buttonProps}
                />
              </Show>
              <Show when={children().length}>
                <FormSelect
                  convertedForms={children()}
                  id={id()}
                  {...passThru}
                />
              </Show>
            </Show>
          </>
        );
      }}
    </Index>
  );
}
