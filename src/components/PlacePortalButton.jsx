import { createSelector } from 'solid-js';
import { useState } from 'stores/state.jsx';
import SmallButton from '@/SmallButton.jsx';
import portal from 'assets/icons/portal.png';
import portalNot from 'assets/icons/portal-not.png';

export function PlacePortalButton(props) {
  const state = useState();
  const placingPortal = () =>
    props.placingPortal
      ? props.placingPortal(props.portalId)
      : state.huskToPlace?.portal === props.portalId;

  function placePortal(portalId) {
    if (portalId === null) {
      state.clearHuskToPlace();
    } else {
      state.setPortalToPlace(portalId);
    }
  }

  return (
    <SmallButton
      onClick={() => placePortal(placingPortal() ? null : props.portalId)}
      class='pt-0.5'
    >
      <img src={placingPortal() ? portalNot : portal} class='w-4 h-4 my-0.5' />
    </SmallButton>
  );
}
