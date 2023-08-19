import { createSignal, createSelector, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import { bind, isTextInputFocused, input } from 'lib/utils';
import { getShadeWithForm } from 'lib/turf';
import Button from '@/Button';
import ShadeEditor from '@/ShadeEditor';
import FormSelect from '@/FormSelect';
import point from 'assets/icons/point.png';
import erase from 'assets/icons/delete.png';
import cycle from 'assets/icons/cycle.png';
import resize from 'assets/icons/resize.png';

export default function PortalsPane() {
  const state = useState();
  const [toShip, $toShip] = createSignal('');
  function createPortal() {
    state.createPortal(toShip(), '/');
  }
  function discardPortal(portalId) {
    state.discardPortal(Number.parseInt(portalId));
  }
  // const onKeyDown = (e) => {
  //   if (!e.defaultPrevented && !isTextInputFocused() && !e.metaKey) {
  //     switch (e.key) {
  //       case 'Enter':
  //         selectTool(null);
  //         break;
  //       case 'Delete':
  //       case 'Backspace':
  //         selectTool(tools.ERASER);
  //         break;
  //       case 'c':
  //         selectTool(tools.CYCLER);
  //       break;
  //       case 'r':
  //         selectTool(tools.RESIZER);
  //       break;
  //       default:
  //     }
  //   }
  // };

  // document.addEventListener('keydown', onKeyDown);
  // onCleanup(() => {
  //   document.removeEventListener('keydown', onKeyDown);
  // });

  return (
    <div>
      <p>
        Create a new Portal
      </p>
      <div>
        <input
            use:input
            use:bind={[
              toShip,
              $toShip,
            ]} />
        <button onClick={createPortal}>Create</button>
      </div>
      <For each={Object.entries(state.e?.portals || {})} >
        {([portalId, portal]) => {
          return (<div>
            <pre>
              {portalId}: {JSON.stringify(portal, null, 2)}
            </pre>
            <button onClick={[discardPortal, portalId]}>Delete</button>
          </div>);
        }}
      </For>
    </div>
  );
}
