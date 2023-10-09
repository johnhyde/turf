export default function Radio(props) {
  return (
    <div class="mb-1 flex flex-wrap items-justify gap-2 text-black">
      <For each={props.items}>
        {([value, label]) => 
          <button class={'px-1 rounded-md ' + (props.value === value ? (props.bgActive || 'bg-yellow-600') : (props.bg || 'bg-yellow-700'))} onClick={[props.$value, value]}>{label}</button>
        }
      </For>
    </div>
  );
}
