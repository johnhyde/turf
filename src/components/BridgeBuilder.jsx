import { createSignal } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { isValidPatp } from 'urbit-ob';
import { bind, isTextInputFocused, input, normalizeId } from 'lib/utils';
import SmallButton from '@/SmallButton';

export default function BridgeBuilder(props) {
  const state = useState();

  const validBg = () => {
    if (toShipValid()) {
      return 'bg-green-100';
    } else if (toShipValid() === false) {
      return 'bg-red-200';
    } else {
      return '';
    }
  }

  const [toShipValid, $toShipValid] = createSignal(null);

  const [toShip, $toShip] = createSignal('');


  function updateToShip(ship) {
    let patp = normalizeId(ship);
    $toShip(patp);
    if (isValidPatp(patp)) {
      $toShipValid(true);
    } else {
      $toShipValid(null);
    }
  }
  function submit() {
    const patp = toShip();
    if (isValidPatp(patp)) {
      const portal = {
        ship: toShip(),
        path: '/',
      };
      if (props.shadeId !== undefined) {
        state.createBridge(props.shadeId, portal);
      } else {
        state.startPlacingPortal(portal, {
          formId: props.formId,
          isLunk: props.isLunk === true,
        });
      }
    } else {
      $toShipValid(false);
    }
  }

  function cancel() {
    state.startPlacingPortal(null);
  }

  function bridge() {
    state.createBridge()
  }

  function shipKeyDown(e) {
    if (e.key === 'Enter') {
      submit();
    }
    if (e.key === 'Escape') {
      e.target.blur();
    }
  }

  return (
    <div class="flex justify-center items-center space-x-2">
      <input
          class={"rounded-input max-w-[175px] " + validBg()}
          use:input
          autofocus
          use:bind={[
            toShip,
            updateToShip,
          ]}
          onKeyDown={shipKeyDown}
      />
      {state.portalToPlace?.portal?.ship === toShip() ?
        <SmallButton onClick={cancel}>–</SmallButton>
      :
        <SmallButton onClick={submit}>
          {props.shadeId === undefined ? '+' : '✓'}
        </SmallButton>
      }
    </div>
  );
}
