import { createSignal, createMemo, createSelector, onMount, onCleanup } from 'solid-js';
import { createStore } from "solid-js/store";
import { useState } from 'stores/state.jsx';
import { bind, input, autofocus, normalizeTermIsh, uuidv4 } from 'lib/utils';
import SmallButton from '@/SmallButton';
import Heading from '@/Heading';
import Modal from '@/Modal';
import BridgeBuilder from '@/BridgeBuilder';
import portalFrom from 'assets/icons/portal-from.png';
import portalTo from 'assets/icons/portal-to.png';
import portalWith from 'assets/icons/portal-with.png';
import resize from 'assets/icons/resize.png';

export default function PortalsPane() {
  const state = useState();
  const placingPortal = createSelector(() => state.huskToPlace?.portal);
  const [inviteDialog, $inviteDialog] = createSignal(false);
  const [now, $now] = createSignal(Date.now());
  setInterval(() => $now(Date.now()), 5000);

  const activeInvites = createMemo(() => {
    if (!state.e) return [];
    return Object.entries(state.e.invites || [])
      .map(([id, invite]) => ({ ...invite, id }))
      .filter((invite) => invite.till > now());
  });

  function goHome() {
    state.mist.goHome();
  }
  function discardPortal(portalId) {
    state.discardPortal(Number.parseInt(portalId));
  }
  function placePortal(portalId) {
    if (portalId === null) {
      state.clearHuskToPlace();
    } else {
      state.setPortalToPlace(portalId);
    }
  }
  const onKeyDown = (e) => {
    if (e.key === 'Escape' && state.huskToPlace) {
      state.clearHuskToPlace();
      e.preventDefault();
    }
  }

  document.body.addEventListener('keydown', onKeyDown);
  onCleanup(() => {
    document.body.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div class="flex flex-col h-full overflow-y-auto">
      <Show when={!state.thisIsUs}>
        <SmallButton onClick={goHome} class="!px-3 !py-1.5 !rounded-md !mx-auto my-1 !border-2">Go Home</SmallButton>
      </Show>
      <Show when={state.thisIsUs}>
        <SmallButton onClick={[$inviteDialog, true]} class="!px-3 !py-1.5 !rounded-md !mx-auto my-1 !border-2">Host an Event</SmallButton>
        <Show when={inviteDialog()} keyed>
          <InviteDialog close={() => $inviteDialog(false)} />
        </Show>
      </Show>
      <Show when={activeInvites().length > 0}>
        <div class="my-2">
          <Heading>
            Events
          </Heading>
          <For each={activeInvites()} >
            {(invite) => {
              return <Invite invite={invite} discard={() => state.delInvite(invite.id)} />;
            }}
          </For>
        </div>
      </Show>
      <Show when={state.thisIsUs}>
        <Heading>
          Create a Portal to:
        </Heading>
        <BridgeBuilder blockHigher blockLower />
        <Show when={state.portals.draft.length > 0}>
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
        </Show>
        <Show when={state.portals.from.length > 0}>
          <div class="my-2">
            <Heading>
              Incoming Portal Requests
            </Heading>
            <For each={state.portals.from} >
              {(portal) => {
                return <Portal icon={portalFrom} label="FROM" portal={portal} placingPortal={placingPortal} place={placePortal} discard={discardPortal}/>;
              }}
            </For>
          </div>
        </Show>
        <Show when={state.portals.to.length > 0}>
          <div class="my-2">
            <Heading>
              Outgoing Portal Requests
            </Heading>
            <For each={state.portals.to} >
              {(portal) => {
                return <Portal icon={portalTo} label="TO" portal={portal} placingPortal={placingPortal} place={placePortal} discard={discardPortal}/>;
              }}
            </For>
          </div>
        </Show>
        <Show when={state.portals.with.length > 0}>
          <div class="my-2">
            <Heading>
              Active Portals
            </Heading>
            <For each={state.portals.with} >
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

function Invite(props) {
  const state = useState();
  const code = () => props.invite.id ? state.c.name + '/' + props.invite.id : null;
  const command = () => '/join ' + code();
  const [copied, $copied] = createSignal(null);

  async function copyCommand() {
    await navigator.clipboard.writeText(command());
    $copied('copied!');
    setTimeout(() => $copied(null), 1000);
  }

  return (
    <div class="flex px-1.5 py-1 m-1 space-x-2 items-center border-yellow-950 border-4 rounded-md bg-yellow-700">
      <span class="font-bold text-sm font-mono flex-grow">
        {props.invite.name}
        <span class="mx-2 font-normal">
          {copied()}
        </span>
      </span>
      <SmallButton onClick={copyCommand} class="ml-2 !font-bold text-lg">
        ⎘
      </SmallButton>
      {(state.thisIsUs && props.discard) && <SmallButton onClick={[props.discard, props.invite.id]}>x</SmallButton>}
    </div>
  );
}

function InviteDialog(props) {
  const [invite, $invite] = createStore({
    id: '',
    name: '',
    long: 30, // minutes
  });
  const code = () => invite.id ? our + '/' + invite.id : null;
  const command = () => '/join ' + code();
  const [copied, $copied] = createSignal(null);

  function create() {
    $invite('id', normalizeTermIsh(invite.name + '-' + uuidv4().substring(0,4)));
    state.addInvite({
      id: invite.id,
      name: invite.name,
      till: Date.now() + invite.long*60*1000,
    });
  }

  async function copyCommand() {
    await navigator.clipboard.writeText(command());
    $copied('copied!');
    setTimeout(() => $copied(null), 1000);
  }

  return (
    <Modal
      class="top-0 left-0 flex flex-col space-y-2 p-2 border-yellow-950 border-4 rounded-md bg-yellow-700"
      onClose={props.close}
    >
      <p class="text-xl text-center">
        New Event
      </p>
      <p class="text-center">
        Anyone with the event code will be able to join your turf for the duration of the event.
        The event will be shared in the %portal app if you have it installed.
      </p>
      <p class="font-semibold">
        Event Name
      </p>
      <input
        use:bind={[
          () => invite.name,
          (s) => $invite('name', s)
        ]}
        use:autofocus
        class="rounded-input"
        disabled={code()}
      />

      <p class="font-semibold">
        Duration (minutes)
      </p>
      <input type="number"
        class="rounded-md pl-1"
        min="1"
        max={invite.long * 10}
        use:bind={[
          () => invite.long,
          (s) => $invite('long', Number(s)),
        ]}
        disabled={code()}
      />
      <Show when={code()}>
        <p>
          People can join your turf by pasting this command in chat.
        </p>
        <div class="flex justify-center space-x-2">
          {copied() || command()}
          <SmallButton onClick={copyCommand} class="ml-2 !font-bold text-lg">
            ⎘
          </SmallButton>
        </div>
      </Show>
      <div class="flex justify-center space-x-2">
        <Show when={!code()}>
          <SmallButton onClick={create} disabled={!invite.long}>
            Create
          </SmallButton>
        </Show>
        <SmallButton onClick={props.close}>
          {code() ? 'Close' : 'Cancel'}
        </SmallButton>
      </div>
    </Modal>
  );
}
