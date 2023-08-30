import { useState } from 'stores/state.jsx';
import Heading from '@/Heading';

export default function Overlay() {
  const state = useState();
  return (
    <div class="absolute w-full flex justify-center">
      <Show when={state.c.id}>
        <Heading class="text-xl mt-3">
          {state.c.name}
        </Heading>
      </Show>
    </div>
  );
}
