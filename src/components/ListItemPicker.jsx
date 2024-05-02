import { batch, createMemo, createSelector, mergeProps } from 'solid-js';
import SmallButton from '@/SmallButton.jsx';

export default function ListItemPicker(props) {
  const selected = createSelector(() => props.selected);
  const buttons = () => {
    const len = props.items.length;
    const numbers = 'a'.repeat(len).split('').map((_, i) => i + 1);
    if (props.wall) {
      return '▪ ╻ ╺ ╹ ╸ ┃ ━ ┏ ┗ ┛ ┓ ┣ ┻ ┫ ┳ ╋'.split(' ').slice(0, len).concat(
        numbers.slice(16),
      );
    }
    return numbers;
  };

  return (
    <div class='my-1 flex flex-wrap justify-center gap-1'>
      <Index each={buttons()}>
        {(label, i) => {
          return (
            <Show
              when={props.button}
              fallback={
                <SmallButton
                  onClick={() => props.onSelect?.(i)}
                  selected={selected(i)}
                  class='!py-1'
                >
                  {label()}
                </SmallButton>
              }
            >
              {props.button(label, i, selected(i))}
            </Show>
          );
        }}
      </Index>
      <Show when={props.editing}>
        <SmallButton
          onClick={() => props.onAdd?.()}
          class={'!py-1 ' + props.addButtonClass}
        >
          +
        </SmallButton>
      </Show>
    </div>
  );
}
