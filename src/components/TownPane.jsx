import { createSignal, createMemo, createSelector, onMount, onCleanup } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { getTownHost, isLunkApproved } from 'lib/turf';
import { bind, isTextInputFocused, input, normalizeId } from 'lib/utils';
import { isValidPatp } from 'urbit-ob';
import SmallButton from '@/SmallButton';
import MediumButton from '@/MediumButton';
import Heading from '@/Heading';
import BridgeBuilder from '@/BridgeBuilder';
import portalFrom from 'assets/icons/portal-from.png';
import portalTo from 'assets/icons/portal-to.png';
import portalWith from 'assets/icons/portal-with.png';
import resize from 'assets/icons/resize.png';

export default function TownPane() {
  const state = useState();
  const weAreHost = our.length <= 7;
  const thisIsTown = () => state.c.name.length <= 7;
  const thisHost = createMemo(() => state.portals.lunk?.for?.ship);
  // const thisHost = createMemo(() => getTownHost(state.e));
  const ourHost = createMemo(() => state.thisIsUs ? thisHost() : null);
  const dinks = () => state.portals.dinks;
  const ourDink = createMemo(() => [...dinks().approved, ...dinks().confirmed].find((dink) => {
    return dink.for.ship === our;
  }));
  const ourHomeTown = () => !!ourDink();
  const ourConfirmedHomeTown = () => !!ourDink()?.shadeId;
  const movingGate = () => state.editor.movingShadeId === state.e?.lunk?.shadeId && state.e?.lunk?.shadeId !== undefined;
  // const ourHomeTown = createMemo(() => [...dinks().approved, ...dinks().confirmed].some((dink) => {
  //   return dink.for.ship === our;
  // }));
  // const ourConfirmedHomeTown = createMemo(() => dinks().confirmed.some((dink) => {
  //   return dink.for.ship === our;
  // }));

  const summary = () => {
    const isUs = state.thisIsUs;
    let a = '', b = '';
    if (thisIsTown()) {
      const count = state.portals.dinks.confirmed.length;
      a = isUs ? 'Your Town' : state.c.name;
      b = `has ${count} housed resident${count === 1 ? '' : 's'}.`;
    } else {
      const resident = state.c.name;
      if (thisHost()) {
        if (isLunkApproved(state.e)) {
          a = isUs ? 'Your' : resident + "'s"
          b = 'home Town is ' + thisHost() + '.';
        } else {
          a = isUs ? 'You are' : resident + " is"
          b = 'awaiting admission to ' + thisHost() + '.';
        }
      } else {
        a = isUs ? 'You have' : resident + ' has';
        b = 'no home Town.';
      }
    }
    return a + ' ' + b;
  }

  const detail = () => {
    if (weAreHost) return null;
    if (thisIsTown()) {
      return `This is${ourHomeTown() ? ' ' : ' not '}your home Town.`
    } else if (state.thisIsUs) {
      return `Pick a star to request admission to its Town.`;
    } else {
      return null;
    }
  }

  function approveDink(portalId) {
    state.approveDink(Number.parseInt(portalId));
  }

  function discardDink(portalId) {
    state.discardPortal(Number.parseInt(portalId));
  }

  function placeGate() {
    const gateId = state.e?.lunk?.shadeId;
    if (gateId === undefined) {

    } else {
      state.setMovingShadeId(gateId);
      // state.startPlacingPortal(Number.parseInt(id), { formId: '/portal/house' });
    }
  }

  function placeHouse() {
    const id = ourDink()?.id;
    if (id === undefined) return;
    state.startPlacingPortal(Number.parseInt(id), { formId: '/portal/house' });
  }

  return (
    <div class="flex flex-col h-full overflow-y-auto">
      <Show when={state.thisIsUs}>
        <p>
          Your Gate is where you enter your turf. {!weAreHost && 'It is also how you travel to your home Town.'}
        </p>
        <MediumButton onClick={placeGate} enabled={!movingGate()}>
            {state.e?.lunk ? (movingGate() ? 'Moving' : 'Move') : 'Place'} Gate
          </MediumButton>
      </Show>
      <p>
        {summary()}
      </p>
      <Show when={detail()}>
        {detail()}
      </Show>
      <Show when={ourHomeTown() && !ourConfirmedHomeTown()}>
        <MediumButton onClick={placeHouse}>
          Place House
        </MediumButton>
      </Show>
      <Show when={state.thisIsUs && !weAreHost}>
        <BridgeBuilder formId='/gate' isLunk={true} shadeId={state.e?.lunk?.shadeId}/>
      </Show>
      {/* <Show when={state.c.id !== ourPond}>
        <SmallButton onClick={goHome} class="!px-3 !py-1.5 !rounded-md !mx-auto my-1 !border-2">Go Home</SmallButton>
      </Show> */}
        {/* <Heading>
          Create a Portal to:
        </Heading> */}
        {/* <div class="flex justify-center items-center space-x-2">
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
            <SmallButton onClick={[placePortal, null]}>–</SmallButton>
          :
            <SmallButton onClick={placeNewPortal}>+</SmallButton>
          }
        </div> */}
        {/* <Show when={state.portals.draft.length > 0}>
          <div class="my-2">
            <Heading>
              Portal Drafts
            </Heading>
            <For each={state.portals.draft} >
              {(portal) => {
                return <Portal icon={portalTo} label="DRAFT TO" portal={portal} placingPortal={placingPortal} place={placePortal} discard={discardPortal}/>;
              }}
            </For>
          </div>
        </Show> */}
      <Show when={state.thisIsUs}>
          <Show when={state.portals.dinks.pending.length > 0}>
            <div class="my-2">
              <Heading>
                Pending Requests
              </Heading>
              <For each={state.portals.dinks.pending} >
                {(portal) => {
                  return <Dink icon={portalFrom} label="PENDING" portal={portal} approve={approveDink} discard={discardDink}/>;
                }}
              </For>
            </div>
          </Show>
          <Show when={state.portals.dinks.approved.length > 0}>
            <div class="my-2">
              <Heading>
                Approved Residents
              </Heading>
              <For each={state.portals.dinks.approved} >
                {(portal) => {
                  return <Dink icon={portalTo} label="APPROVED" portal={portal} approve={approveDink} discard={discardDink}/>;
                }}
              </For>
            </div>
          </Show>
        </Show>
        <Show when={state.portals.dinks.confirmed.length > 0}>
          <div class="my-2">
            <Heading>
              Current Residents
            </Heading>
            <For each={state.portals.dinks.confirmed} >
              {(portal) => {
                return <Dink icon={portalWith} label="CONFIRMED" portal={portal} approve={approveDink} discard={discardDink}/>;
              }}
            </For>
          </div>
        </Show>
    </div>
  );
}

function Dink(props) {
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
        <Match when={!props.portal.approved}>
          <SmallButton onClick={[props.approve, props.portal.id]}>✓</SmallButton>
        </Match>
        <Match when={props.portal.shadeId === null}>
          ...
        </Match>
      </Switch>
      <SmallButton onClick={[props.discard, props.portal.id]}>x</SmallButton>
    </div>
  );
}