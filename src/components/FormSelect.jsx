import { createSelector, createMemo } from 'solid-js';
import ItemButton from '@/ItemButton';
import SmallButton from '@/SmallButton';

export default function FormSelect(props) {
  const isSelected = createSelector(() => props.selectedId);
  const forms = createMemo(() => {
    let forms = (props.forms || []).map((f, i) => [i, f])
    if (props.sort) {
      forms.sort((a, b) => {
        return a[1][0].localeCompare(b[1][0]);
      });
    }
    return forms;
  });

  return (
    <div class="flex flex-wrap justify-center">
      <Index each={forms()} fallback={props.fallback || <div>Loading...</div>}>
        {(item) => {
          const i = () => item()[0];
          const j = () => item()[1];
          const id = () => j()[0];
          const form = () => j()[1];
          const onSelect = () => {
            props.select(id(), i());
          }
          return (
            <div class="relative group">
              <ItemButton onClick={onSelect} selected={isSelected(id())} form={form()} bgImage={props.bgImage} />
              <div class="absolute top-0 left-0 w-full h-full z-[15] flex flex-wrap gap-1 justify-center items-center pointer-events-none invisible group-hover:visible">
                <For each={props.buttons}>
                  {([label, buttonName]) => (
                    <SmallButton onClick={() => props.onButton?.(buttonName, id(), i())} class="pointer-events-auto !bg-[#A1620780]">
                    {/* A16207 */}
                      {label}
                    </SmallButton>
                  )}
                </For>
              </div>
            </div>
          );
        }}
      </Index>
    </div>
  );
}
