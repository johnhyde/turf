import { batch, createMemo, createSelector, mergeProps } from 'solid-js';
import SmallButton from '@/SmallButton';

export default function VariationPicker(props) {
  const varSelected = createSelector(() => props.variation);
  const variationButtons = () => {
    const len = props.variations.length;
    const numbers = 'a'.repeat(len).split('').map((_, i) => i + 1);
    if (props.type === "wall") {
      return '▪ ╻ ╺ ╹ ╸ ┃ ━ ┏ ┗ ┛ ┓ ┣ ┻ ┫ ┳ ╋'.split(' ').slice(0, len).concat(numbers.slice(16));
    }
    return numbers;
  };

  return <div class="my-1 flex flex-wrap justify-center gap-1">
    <Index each={variationButtons()}>
      {(label, i) => {
        return <SmallButton onClick={() => props.onSelect?.(i)}
          selected={varSelected(i)}
          class="!py-1">
          {label()}
        </SmallButton>;
      }}
    </Index>
    <Show when={props.editing}>
      <SmallButton onClick={() => props.onAdd?.()} class="!py-1">
        +
      </SmallButton>
    </Show>
  </div>;
}
