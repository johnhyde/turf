export function Group(props) {
  return (
    <div
      class={'flex flex-wrap items-center gap-1' + ' ' +
        (props.class || '')}
      style={props.style}
    >
      {props.children}
    </div>
  );
}

export function Indent(props) {
  return (
    <Group
      class={'border-l border-y border-yellow-950 rounded-l-sm pl-1 py-1' +
        ' ' +
        (props.class || '')}
      style={props.style}
    >
      {props.children}
    </Group>
  );
}
