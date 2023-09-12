import { createSignal, createMemo, createSelector, onMount, onCleanup } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { bind, isTextInputFocused, input, normalizeId } from 'lib/utils';
import { isValidPatp } from 'urbit-ob';
import SmallButton from '@/SmallButton';
import Heading from '@/Heading';
import portalFrom from 'assets/icons/portal-from.png';
import portalTo from 'assets/icons/portal-to.png';
import portalWith from 'assets/icons/portal-with.png';
import resize from 'assets/icons/resize.png';

export default function PortalsPane() {
  const state = useState();
  const placingPortal = createSelector(() => state.portalToPlace);
  const [toShipValid, $toShipValid] = createSignal(null);
  const validBg = () => {
    if (toShipValid()) {
      return 'bg-green-100';
    } else if (toShipValid() === false) {
      return 'bg-red-200';
    } else {
      return '';
    }
  }
  const portals = createMemo(() => {
    const sort = (p1, p2) => { return p1.id - p2.id; };
    const portalsDraft = [];
    const portalsTo = [];
    const portalsFrom = [];
    const portalsWith = [];
    Object.entries(state.e?.portals || {}).forEach(([portalId, portal]) => {
      const portalObj = {
        id: Number.parseInt(portalId),
        ...portal
      };
      if (portal.shadeId !== null) {
        if (portal.at !== null) {
          portalsWith.push(portalObj);
        } else {
          portalsTo.push(portalObj);
        }
      } else {
        if (portal.at !== null) {
          portalsFrom.push(portalObj);
        } else {
          portalsDraft.push(portalObj);
        }
      }
    });
    return {
      draft: portalsDraft.sort(sort),
      to: portalsTo.sort(sort),
      from: portalsFrom.sort(sort),
      with: portalsWith.sort(sort),
    };
  });

  const [toShip, $toShip] = createSignal('');
  function goHome() {
    state.mist.goHome();
  }
  function updateToShip(ship) {
    let patp = normalizeId(ship);
    $toShip(patp);
    if (isValidPatp(patp)) {
      $toShipValid(true);
    } else {
      $toShipValid(null);
    }
  }
  function placeNewPortal() {
    const patp = toShip();
    if (isValidPatp(patp)) {
      state.startPlacingPortal({
        ship: toShip(),
        path: '/',
      });
    } else {
      $toShipValid(false);
    }
  }
  function discardPortal(portalId) {
    state.discardPortal(Number.parseInt(portalId));
  }
  function placePortal(portalId) {
    if (portalId === null) {
      state.startPlacingPortal(null);
    } else {
      state.startPlacingPortal(Number.parseInt(portalId))
    }
  }
  const onKeyDown = (e) => {
    if (e.key === 'Escape' && state.portalToPlace) {
      placePortal(null);
      e.preventDefault();
    }
  }

  document.body.addEventListener('keydown', onKeyDown);
  onCleanup(() => {
    document.body.removeEventListener('keydown', onKeyDown);
  });

  function shipKeyDown(e) {
    if (e.key === 'Enter') {
      placeNewPortal();
    }
    if (e.key === 'Escape') {
      e.target.blur();
    }
  }

  return (
    <div class="flex flex-col">
      <Show when={state.c.id !== ourPond}>
        <SmallButton onClick={goHome} class="!px-3 !py-1.5 !rounded-md !mx-auto my-1 !border-2">Go Home</SmallButton>
      </Show>
      <Show when={state.c.id === ourPond}>
        <Heading>
          Create a Portal to:
        </Heading>
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
          {state.portalToPlace?.ship === toShip() ?
            <SmallButton onClick={[placePortal, null]}>–</SmallButton>
          :
            <SmallButton onClick={placeNewPortal}>+</SmallButton>
          }
        </div>
        <Show when={portals().draft.length > 0}>
          <div class="my-2">
            <Heading>
              Portal Drafts
            </Heading>
            <For each={portals().draft} >
              {(portal) => {
                return <Portal icon={portalTo} label="DRAFT TO" portal={portal} placingPortal={placingPortal} place={placePortal} discard={discardPortal}/>;
              }}
            </For>
          </div>
        </Show>
        <Show when={portals().from.length > 0}>
          <div class="my-2">
            <Heading>
              Incoming Portal Requests
            </Heading>
            <For each={portals().from} >
              {(portal) => {
                return <Portal icon={portalFrom} label="FROM" portal={portal} placingPortal={placingPortal} place={placePortal} discard={discardPortal}/>;
              }}
            </For>
          </div>
        </Show>
        <Show when={portals().to.length > 0}>
          <div class="my-2">
            <Heading>
              Outgoing Portal Requests
            </Heading>
            <For each={portals().to} >
              {(portal) => {
                return <Portal icon={portalTo} label="TO" portal={portal} placingPortal={placingPortal} place={placePortal} discard={discardPortal}/>;
              }}
            </For>
          </div>
        </Show>
        <Show when={portals().with.length > 0}>
          <div class="my-2">
            <Heading>
              Active Portals
            </Heading>
            <For each={portals().with} >
              {(portal) => {
                return <Portal icon={portalWith} label="WITH" portal={portal} placingPortal={placingPortal} place={placePortal} discard={discardPortal}/>;
              }}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
}

function Portal(props) {
  return (
    <div class="flex px-1.5 py-1 m-1 space-x-2 items-center border-yellow-950 border-4 rounded-md bg-yellow-700">
      <div class="flex flex-wrap space-x-2 items-center flex-grow">
        <img class="" src={props.icon} draggable={false} style={{ 'image-rendering': 'pixelated' }} />
        <span class="font-bold text-xs">
          {/* [{props.portal.id}] {props.label} */}
          {props.label}
        </span>
        <span class="font-bold text-sm font-mono">
          {props.portal.for.ship}
        </span>
      </div>
      <Switch fallback="✓">
        <Match when={props.portal.shadeId === null}>
          {props.placingPortal(props.portal.id) ?          
            <SmallButton onClick={[props.place, null]}>–</SmallButton>
          :
            <SmallButton onClick={[props.place, props.portal.id]}>+</SmallButton>
          }
        </Match>
        <Match when={props.portal.at === null}>
          ...
        </Match>
      </Switch>
      <SmallButton onClick={[props.discard, props.portal.id]}>x</SmallButton>
    </div>
  );
}
