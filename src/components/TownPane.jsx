import {
  createMemo,
  createSelector,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { useState } from 'stores/state.jsx';
import { getTownHost, isLunkApproved } from 'lib/turf';
import { bind, input, isTextInputFocused, normalizeId } from 'lib/utils';
import { isValidPatp } from 'urbit-ob';
import SmallButton from '@/SmallButton.jsx';
import MediumButton from '@/MediumButton.jsx';
import Heading from '@/Heading.jsx';
import Radio from '@/Radio.jsx';
import BridgeBuilder from '@/BridgeBuilder.jsx';

export default function TownPane() {
  const state = useState();
  const weAreHost = our.length <= 7;
  const thisIsTown = () => state.c.host.length <= 7;
  const thisHost = createMemo(() => state.portals.lunk?.for?.ship);
  const hostEstranged = () =>
    state.portals.lunk?.pending === false && state.portals.lunk?.at == null;
  const gateExists = () => state.e?.gate != null && state.e.cave[state.e.gate];
  const dinks = () => state.portals.dinks;
  const ourDink = createMemo(() =>
    [...dinks().confirmed, ...dinks().housed].find((dink) => {
      return dink.for.ship === our;
    })
  );
  const ourHomeTown = () => !!ourDink();
  const weAreHoused = () => !!ourDink()?.outlet;
  const movingGate = () =>
    state.huskToPlace?.shade === state.e?.gate &&
    state.e?.gate != null;

  const summary = () => {
    const isUs = state.thisIsUs;
    let a = '', b = '';
    if (thisIsTown()) {
      const count = state.portals.dinks.housed.length;
      a = isUs ? 'Your Town' : state.c.name;
      b = `has ${count} housed resident${count === 1 ? '' : 's'}.`;
    } else {
      const resident = state.c.host;
      if (thisHost()) {
        if (isLunkApproved(state.e)) {
          a = isUs ? 'Your' : resident + "'s";
          b = 'home Town is ' + thisHost() + '.';
        } else {
          if (isUs && hostEstranged()) {
            a = 'You have been';
            b = 'denied admission to ' + thisHost() + '.';
          } else {
            a = isUs ? 'You are' : resident + ' is';
            b = 'awaiting admission to ' + thisHost() + '.';
          }
        }
      } else {
        a = isUs ? 'You have' : resident + ' has';
        b = 'no home Town.';
      }
    }
    return a + ' ' + b;
  };

  const isHomeTownText = () => {
    if (weAreHost) return null;
    if (thisIsTown()) {
      return `This is${ourHomeTown() ? ' ' : ' not '}your home Town.`;
    } else {
      return null;
    }
  };

  function leaveHost() {
    if (thisHost()) {
      state.discardPortal(state.portals.lunk.id);
    }
  }

  function reviveHost() {
    if (thisHost()) {
      state.revivePortal(state.portals.lunk.id);
    }
  }

  function approveDink(portalId) {
    state.confirmPortal(Number.parseInt(portalId));
  }

  function discardDink(portalId) {
    state.discardPortal(Number.parseInt(portalId));
  }

  function placeGate() {
    const gateId = gateExists() ? state.e?.gate : undefined;
    const portal = state.e?.lunk;
    if (gateId == null) {
      state.setHuskToPlace({
        formId: '/gate',
        isGate: true,
      }, portal);
    } else {
      state.setHuskToPlace(gateId, portal);
    }
  }

  function placeHouse() {
    const id = ourDink()?.id;
    if (id === undefined) return;
    state.setPortalToPlace(id, { formId: '/portal/house' });
  }

  const pClass = 'm-1 p-4 space-y-4 bg-yellow-950 rounded-lg text-yellow-50';

  return (
    <div class='flex flex-col h-full overflow-y-auto'>
      <Show when={state.thisIsUs}>
        <p class={pClass}>
          Your Gate is where you enter your turf.{' '}
          {!weAreHost && 'It is also how you travel to your home Town.'}
        </p>
        <MediumButton onClick={placeGate} enabled={!movingGate()}>
          {gateExists() ? (movingGate() ? 'Moving' : 'Move') : 'Place'} Gate
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
      <Show when={state.thisIsUs && weAreHost}>
        <Heading>Confirm Residents</Heading>
        <Radio
          value={JSON.stringify(!!state.e?.autoconfirmDinks)}
          $value={(v) => state.setAutoconfirmDinks(JSON.parse(v))}
          items={[['true', 'Automatically'], ['false', 'Manually']]}
          class='justify-center'
          bg='border border-yellow-950 bg-yellow-700'
          bgActive='border border-yellow-950 bg-yellow-600'
        />
      </Show>
      <Show when={ourHomeTown() && !weAreHoused()}>
        <MediumButton onClick={placeHouse}>
          Place House
        </MediumButton>
      </Show>
      <Show when={state.thisIsUs && !weAreHost}>
        <Show when={thisHost()}>
          <MediumButton onClick={leaveHost}>
            Leave {thisHost()}
          </MediumButton>
          <Show when={hostEstranged()}>
            <MediumButton onClick={reviveHost}>
              Resend Request
            </MediumButton>
          </Show>
        </Show>
        <p class={'mb-2 ' + pClass}>
          Pick a {thisHost() ? 'new' : ''}{' '}
          star to request admission to its Town.
          <br />
          (try ~pandux, it's open)
        </p>
        <BridgeBuilder
          formId='/gate'
          isGate={true}
          shadeId={state.e?.gate}
          blockLower
          blockSame
          placeholder='~pandux'
        />
      </Show>
      <Show when={state.thisIsUs}>
        <Show when={state.portals.dinks.pending.length > 0}>
          <div class='my-2'>
            <Heading>
              Pending Requests
            </Heading>
            <For each={state.portals.dinks.pending}>
              {(portal) => {
                return (
                  <Dink
                    portal={portal}
                    approve={approveDink}
                    discard={discardDink}
                  />
                );
              }}
            </For>
          </div>
        </Show>
        <Show when={state.portals.dinks.confirmed.length > 0}>
          <div class='my-2'>
            <Heading>
              Confirmed Residents
            </Heading>
            <For each={state.portals.dinks.confirmed}>
              {(portal) => {
                return (
                  <Dink
                    portal={portal}
                    approve={approveDink}
                    discard={discardDink}
                  />
                );
              }}
            </For>
          </div>
        </Show>
      </Show>
      <Show when={state.portals.dinks.housed.length > 0}>
        <div class='my-2'>
          <Heading>
            Housed Residents
          </Heading>
          <For each={state.portals.dinks.housed}>
            {(portal) => {
              return (
                <Dink
                  portal={portal}
                  approve={approveDink}
                  discard={discardDink}
                />
              );
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
    <div class='flex px-1.5 py-1 m-1 space-x-2 items-center border-yellow-950 border-4 rounded-md bg-yellow-700'>
      <div class='flex flex-wrap space-x-2 items-center flex-grow'>
        <span class='font-bold text-sm font-mono'>
          {props.portal.for.ship}
        </span>
      </div>
      <Switch fallback='✓'>
        <Match when={props.portal.pending}>
          {state.thisIsUs && (
            <SmallButton onClick={[props.approve, props.portal.id]}>
              ✓
            </SmallButton>
          )}
        </Match>
        <Match when={props.portal.outlet == null}>
          ...
        </Match>
      </Switch>
      {state.thisIsUs && (
        <SmallButton onClick={[props.discard, props.portal.id]}>x</SmallButton>
      )}
    </div>
  );
}
