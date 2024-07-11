import { createSignal } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { isValidPatp } from 'urbit-ob';
import { bind, input, isTextInputFocused, normalizeId } from 'lib/utils';
import SmallButton from '@/SmallButton';
import portal from 'assets/icons/portal.png';
import portalNot from 'assets/icons/portal-not.png';

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
  };

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
        ship: patp,
        path: '/',
      };
      if (props.shadeId !== undefined) {
        state.createBridge(props.shadeId, portal);
        updateToShip('');
      } else {
        state.setPortalToPlace(portal, {
          formId: props.formId || '/portal',
          isGate: props.isGate === true,
        });
        // state.createPortal(toShip(), '/');
      }
    } else {
      $toShipValid(false);
    }
  }

  function addPortal() {
    const patp = toShip();
    if (isValidInput(patp)) {
      state.createPortal(patp, '/');
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

  return (
    <div class='flex justify-center items-center space-x-2'>
      <input
        class={'rounded-input max-w-[175px] ' + validBg()}
        use:input={{ onSubmit: submit }}
        autofocus
        use:bind={[
          toShip,
          updateToShip,
        ]}
        placeholder={props.placeholder || ''}
      />
      {state.huskToPlace?.portal?.ship === toShip()
        ? (
          <SmallButton onClick={cancel}>
            <img src={portalNot} class='w-4 h-4 my-0.5' />
          </SmallButton>
        )
        : (
          <SmallButton onClick={submit}>
            {props.shadeId === undefined
              ? <img src={portal} class='w-4 h-4 my-0.5' />
              : '✓'}
          </SmallButton>
        )}
      <Show when={props.shadeId == null}>
        <SmallButton onClick={addPortal}>
          ✓
        </SmallButton>
      </Show>
    </div>
  );
}
