import { createSelector, createMemo } from 'solid-js';
import ItemButton from '@/ItemButton';

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
            <div>
              <ItemButton onClick={onSelect} selected={isSelected(id())} form={form()} background={props.background} />
            </div>
          );
        }}
      </Index>
    </div>
  );
}
