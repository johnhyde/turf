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
    if (isValidInput(patp)) {
      $toShipValid(true);
    } else {
      $toShipValid(null);
    }
  }
  function submit() {
    const patp = toShip();
    if (isValidInput(patp)) {
      const portal = {
        ship: toShip(),
        path: '/',
      };
      if (props.shadeId !== undefined) {
        state.createBridge(props.shadeId, portal);
      } else {
        state.setPortalToPlace(portal, {
          formId: props.formId || '/portal',
          isLunk: props.isLunk === true,
        });
      }
    } else {
      $toShipValid(false);
    }
  }

  function isValidInput(patp) {
    if (!isValidPatp(patp)) return false;
    const weAreHost = our.length <= 7;
    const theyAreHost = patp.length <= 7;
    if (props.blockHigher && !weAreHost && theyAreHost) return false;
    if (props.blockLower && weAreHost && !theyAreHost) return false;
    if (props.blockSame && weAreHost == theyAreHost) return false;
    return true;
  }

  function cancel() {
    state.clearHuskToPlace();
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
      {state.huskToPlace?.portal?.ship === toShip() ?
        <SmallButton onClick={cancel}>–</SmallButton>
      :
        <SmallButton onClick={submit}>
          {props.shadeId === undefined ? '+' : '✓'}
        </SmallButton>
      }
    </div>
  );
}
