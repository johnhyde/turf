export default function Select(props) {
  return (
    <select
      value={props.value}
      onChange={(e) => props.$value(e.target.value)}
      class='rounded-md'
    >
      <For each={props.options}>
        {([value, label]) => {
          return (
            <option value={value}>
              {label}
            </option>
          );
        }}
      </For>
    </select>
  );
}
