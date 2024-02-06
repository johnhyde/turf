import { createEffect, createSignal, createMemo, onMount, onCleanup } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { useState } from 'stores/state';
import { usePhone } from 'stores/phone';
import { bind, input } from 'lib/utils';

export default function CallInfo(props) {
  const phone = usePhone();
  const [peers, $peers] = createSignal([]);
  const [ourStream, $ourStream] = createSignal();
  const [conns, $conns] = window.con = createStore(Object.entries(props.call.calls));
  // const orderedConns = window.ocon = createMemo(() => {
  //   return Object.entries(conns).sort((a, b) => {
  //     return a[0].localeCompare(b[0]);
  //   });
  // });
  const orderedConns = window.ocon = () => {
    // console.log(conns.butt);
    return conns.sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });
  };
  let controller;
  createEffect(() => {
    controller = new AbortController();
    props.call.addEventListener('crew-update', (update) => {
      updatePeers();
    }, { signal: controller.signal });
    updatePeers();
    props.call.addEventListener('calls-update', (update) => {
      if (update.kind === 'add') {
        $conns((conns) => [...conns,
          [update.clientString, update.call],
        ]);
      } else {
        $conns((conns) => conns.filter(c => c[0] !== update.clientString));
      }
    }, { signal: controller.signal });
    onCleanup(() => controller.abort());
  });
  function updatePeers() {
    $peers(Object.keys(props.call.crew.peers).filter(patp => patp !== our));
  }

  onMount(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user" },
        // audio: true,
      })
      .then(stream => {
        $ourStream(stream);
        // socket.emit("broadcaster");
      })
      .catch(error => console.error(error));
  });

  return (
    <div class="bg-yellow-700 border border-yellow-950 rounded-lg pointer-events-auto mx-auto">
      <p>
        Talking to {peers().length ? peers().join(', ') : 'no one, yet'}
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
        {/* <div class="w-96">
          <video ref={video} playsinline autoplay muted />
        </div> */}
      </div>
      <div class="flex justify-center">
        <button onClick={() => phone.hangUp(props.call)}>
          Hang Up
        </button>
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
      props.conn.addEventListener('datachannel', (event) => {
        $chan(event.channel);
        // updatePeers();
        console.log('got new data channel in Conn component', event);
      }, { signal: controller.signal });
      props.conn.addEventListener('track', (event) => {
        // $chan(event.track);
        // updatePeers();
        $theirStream(event.streams[0]);
        console.log('got new track in Conn component', event);
      }, { signal: controller.signal });
    }
    onCleanup(() => controller.abort());
  });
  createEffect(() => {
    if (props.stream && props.conn) {
      props.stream.getTracks().forEach(track => props.conn.addTrack(track, props.stream));
    }
  });

  createEffect(() => {
    let controller = new AbortController();
    if (chan()) {
      chan().addEventListener('message', (event) => {
        console.log('we have received a dang message');
        $msgs([...msgs(), event.data]);
      }, { signal: controller.signal });
      // chan().onmessage = (event) => {
      //   console.log('we have received a dang message');
      //   $msgs([...msgs(), event.data]);
      // };
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