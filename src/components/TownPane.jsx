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
  const dinks = () => state.portals.dinks;
  const ourDink = createMemo(() => [...dinks().approved, ...dinks().confirmed].find((dink) => {
    return dink.for.ship === our;
  }));
  const ourHomeTown = () => !!ourDink();
  const ourConfirmedHomeTown = () => !!ourDink()?.shadeId;
  const movingGate = () => state.huskToPlace?.shade === state.e?.lunk?.shadeId && state.e?.lunk?.shadeId !== undefined;

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

  const isHomeTownText = () => {
    if (weAreHost) return null;
    if (thisIsTown()) {
      return `This is${ourHomeTown() ? ' ' : ' not '}your home Town.`
    } else {
      return null;
    }
  }

  function leaveHost() {
    if (thisHost()) {
      state.discardPortal(state.portals.lunk.id);
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
      state.setHuskToPlace({
        formId: '/gate',
        isLunk: true,
      });
    } else {
      state.setHuskToPlace(gateId);
    }
  }

  function placeHouse() {
    const id = ourDink()?.id;
    if (id === undefined) return;
    state.setPortalToPlace(id, { formId: '/portal/house' });
  }

  const pClass = 'm-1 p-4 space-y-4 bg-yellow-950 rounded-lg text-yellow-50';

  return (
    <div class="flex flex-col h-full overflow-y-auto">
      <Show when={state.thisIsUs}>
        <p class={pClass}>
          Your Gate is where you enter your turf. {!weAreHost && 'It is also how you travel to your home Town.'}
        </p>
        <MediumButton onClick={placeGate} enabled={!movingGate()}>
            {state.e?.lunk ? (movingGate() ? 'Moving' : 'Move') : 'Place'} Gate
          </MediumButton>
      </Show>
      <Show when={isHomeTownText()}>
        <p class={pClass}>
        {isHomeTownText()}
        </p>
      </Show>
      <p class={pClass}>
        {summary()}
      </p>
      <Show when={ourHomeTown() && !ourConfirmedHomeTown()}>
        <MediumButton onClick={placeHouse}>
          Place House
        </MediumButton>
      </Show>
      <Show when={state.thisIsUs && !weAreHost}>
        {thisHost() &&
          <MediumButton onClick={leaveHost}>
            Leave {thisHost()}
          </MediumButton>
        }
        <p class={'mb-2 ' + pClass}>
          Pick a {thisHost() ? 'new' : ''} star to request admission to its Town.
          <br/>
          (try ~pandux, it's open)
        </p>
        <BridgeBuilder formId='/gate' isLunk={true} shadeId={state.e?.lunk?.shadeId} blockLower
          placeholder="~pandux"
        />
      </Show>
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
  const state = useState();
  return (
    <div class="flex px-1.5 py-1 m-1 space-x-2 items-center border-yellow-950 border-4 rounded-md bg-yellow-700">
      <div class="flex flex-wrap space-x-2 items-center flex-grow">
        <span class="font-bold text-sm font-mono">
          {props.portal.for.ship}
        </span>
      </div>
      <Switch fallback="✓">
        <Match when={!props.portal.approved}>
          {state.thisIsUs && <SmallButton onClick={[props.approve, props.portal.id]}>✓</SmallButton>}
        </Match>
        <Match when={props.portal.shadeId === null}>
          ...
        </Match>
      </Switch>
      {(state.thisIsUs || props.portal.for.ship === our) && <SmallButton onClick={[props.discard, props.portal.id]}>x</SmallButton>}
    </div>
  );
}