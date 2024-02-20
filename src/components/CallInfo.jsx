import { createEffect, createSignal, createMemo, onMount, onCleanup } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { useState } from 'stores/state';
import { usePhone } from 'stores/phone';
import { bind, input } from 'lib/utils';

export default function CallInfo(props) {
  const phone = usePhone();
  const [peers, $peers] = createSignal([]);
  const [activePeers, $activePeers] = createSignal([]);
  const [status, $status] = createSignal();
  const [ourStream, $ourStream] = createSignal();
  const [store, $store] = window.con = createStore({ conns: {}, crew: {} });
  const conns = () => store.conns;
  const $conns = (...args) => $store('conns', ...args);
  const crew = () => store.crew;
  const $crew = (...args) => $store('crew', ...args);
  const weAreAdmin = () => our === props.call?.host || crew().admins?.includes(our);
  const noobs = () => Object.keys(crew().noobs || {});
  const validNoobs = () => (!crew().access?.filter) ? noobs() : noobs().filter(n => crew().filtered?.includes(n));
  const absentPeers = () => peers().filter(p => !activePeers().includes(p));

  const msg = () => {
    if (status() == 'active') {
      const talkingTo = activePeers().length ? activePeers().join(', ') : 'no one, yet';
      const waitingMsg = absentPeers().length ? `; waiting for ${absentPeers().join(', ')}` : '';
      return `Talking to ${talkingTo + waitingMsg}`;
    } else if (status() === 'waiting' || status() === 'watching') {
      return 'Waiting to be let into the call';
    }
    return '';
  }

  const orderedConns = window.ocon = () => {
    return Object.entries(conns()).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });
  };

  createEffect(() => {
    $conns(reconcile(props.call.calls));
    const controller = new AbortController();
    props.call.addEventListener('crew-update', (update) => {
      updateCrewInfo();
    }, { signal: controller.signal });
    updateCrewInfo();
    props.call.addEventListener('crew-status', () => {
      $status(props.call.status);
    }, { signal: controller.signal });
    $status(props.call.status);
    props.call.addEventListener('calls-update', (update) => {
      if (update.kind === 'add') {
        $conns(update.clientString, update.call);
      } else {
        $conns(update.clientString, undefined);
      }
    }, { signal: controller.signal });
    onCleanup(() => {
      controller.abort();
      $conns(reconcile({}));
    });
  });
  function updateCrewInfo() {
    $peers(props.call.peers.filter(p => p !== our));
    $activePeers(props.call.activePeers.filter(p => p !== our));
    $crew(reconcile(props.call.crew));
  }

  onMount(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user" },
        // audio: true,
      })
      .then(stream => {
        $ourStream(stream);
      })
      .catch(error => console.error(error));
    onCleanup(() => {
      if (ourStream()) {
        ourStream().getTracks().forEach(t => t.stop());
      }
    });
  });

  return (
    <div class="bg-yellow-700 border border-yellow-950 rounded-lg pointer-events-auto mx-auto">
      <p>
        {msg()}
      </p>
      <div class="flex flex-wrap justify-center">
        {/* {JSON.stringify(conns)}
        {JSON.stringify(orderedConns())} */}
        <For each={orderedConns()}>
          {([clientStr, conn]) => {
            return <Conn conn={conn} clientStr={clientStr} stream={ourStream()} />;
          }}
        </For>
        <VideoSquare stream={ourStream()} label={our} us />
      </div>
      <div class="flex justify-center">
        <button onClick={() => phone.hangUp(props.call)}>
          Hang Up
        </button>
        <Show when={weAreAdmin()}>
          <button onClick={() => phone.delete(props.call)}>
            End Call
          </button>
          <For each={validNoobs()}>
            {(noob) => {
              return <button onClick={() => props.call.confirm(noob)}>
                Let {noob} in
              </button>;
            }}
          </For>
        </Show>
      </div>
    </div>);
}

function Conn(props) {
  const [chan, $chan] = createSignal(props?.conn?.channel);
  const [msgs, $msgs] = createSignal([]);
  const [msg, $msg] = createSignal('');
  const [theirStream, $theirStream] = createSignal();
  let video;

  createEffect(() => {
    let controller = new AbortController();
    if (props.conn) {
      console.log('apparently connection changed', props.conn.peer);
      props.conn.addEventListener('datachannel', (event) => {
        $chan(event.channel);
        console.log('got new data channel in Conn component', event);
      }, { signal: controller.signal });
      props.conn.addEventListener('track', (event) => {
        $theirStream(event.streams[0]);
        console.log('got new track in Conn component', event);
      }, { signal: controller.signal });
      if (props.conn.remoteStreams?.size) {
        $theirStream([...props.conn.remoteStreams][0]);
      }
      props.conn.getReceivers
    }
    onCleanup(() => controller.abort());
  });
  createEffect(() => {
    if (props.stream && props.conn) {
      props.stream.getTracks().forEach((track) => {
        try { props.conn.addTrack(track, props.stream); } catch (e) {}
      });
    }
  });

  createEffect(() => {
    let controller = new AbortController();
    if (chan()) {
      chan().addEventListener('message', (event) => {
        console.log('we have received a dang message');
        $msgs([...msgs(), event.data]);
      }, { signal: controller.signal });
    }
    onCleanup(() => {
      controller.abort();
    });
  });

  function sendMsg() {
    chan()?.send(msg());
    $msgs([...msgs(), '> ' + msg()]);
    $msg('');
  }

  return <VideoSquare stream={theirStream()} label={'~' + props.conn.peer} />;
}

function VideoSquare(props) {
  let video;
  createEffect(() => {
    if (props.stream) {
      video.srcObject = props.stream;
    }
  });

  return (
    <div class="w-96 flex-col bg-gray-800 text-white">
      <Show when={props.label}>
        <span>{props.label}</span>
      </Show>
      <video ref={video} playsinline autoplay controls={!props.us} muted={props.us} />
      {/* <For each={msgs()}>
        {(msg) => <p>{msg}</p>}
      </For> */}
      {/* <input
        class="text-black"
        use:input
        use:bind={[msg, $msg]}
      />
      <button onClick={sendMsg}>
        Send
      </button> */}
    </div>
  );
}