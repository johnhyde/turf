import { createEffect, createSignal, createMemo, onMount, onCleanup } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { useState } from 'stores/state';
import { usePhone } from 'stores/phone';
import { bind, input } from 'lib/utils';
import MediumButton from '@/MediumButton';
import SmallButton from '@/SmallButton';

export default function CallInfo(props) {
  const state = useState();
  const phone = usePhone();
  const [peers, $peers] = createSignal([]);
  const [activePeers, $activePeers] = createSignal([]);
  const [status, $status] = createSignal();
  const [ourStream, $ourStream] = createSignal();
  const [ourScreen, $ourScreen] = createSignal();
  const [store, $store] = window.con = createStore({
    conns: {},
    crew: {},
    camera: true,
    mic: true,
    screen: false,
  });
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
    } else if (status() === 'waiting') {
      return 'Waiting to be let into the call';
    }
    return '';
  }

  const orderedConns = window.ocon = createMemo(() => {
    return Object.values(conns()).sort((a, b) => {
      return a.clientString.localeCompare(b.clientString);
    });
  });

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
        audio: !dev,
      })
      .then(stream => {
        $ourStream(stream);
        window.str = stream;
      })
      .catch(error => console.error(error));
    onCleanup(() => {
      if (ourStream()) {
        ourStream().getTracks().forEach(t => t.stop());
      }
      if (ourScreen()) {
        ourScreen().getTracks().forEach(t => t.stop());
      }
    });
  });

  createEffect(() => {
    if (ourStream()) {
      ourStream().getVideoTracks().forEach(t => t.enabled = store.camera);
    }
  });
  createEffect(() => {
    if (ourStream()) {
      ourStream().getAudioTracks().forEach(t => t.enabled = store.mic);
    }
  });
  createEffect(() => {
    if (ourScreen()) {
      if (!store.screen) {
        ourScreen().getTracks().forEach((t) => {
          t.stop();
          ourScreen().removeTrack(t);
        });
        $ourScreen(undefined);
      }
    } else if (store.screen) {
      navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: false,
      })
      .then(stream => {
        $ourScreen(stream);
        window.scr = stream;
        stream.getTracks()[0].addEventListener('ended', () => {
          $store('screen', false);
        }, { once: true });
      })
      .catch(error => {
        $store('screen', false);
        console.error(error);
      });
    }
  });
  createEffect(() => {
    if (state.gameLoaded && state.soundOn) {
      if (validNoobs().filter(p => p !== our).length) {
        game.sound.play('join');
      // } else {
      //   game.sound.stopByKey('join');
      }
    }
  });

  return (
    <div class="w-fit bg-yellow-700 border border-yellow-950 rounded-lg pointer-events-auto">
      <p class="text-center my-1">
        {msg()}
      </p>
      <div class="flex flex-wrap justify-center gap-2">
        {/* {JSON.stringify(conns)}
        {JSON.stringify(orderedConns())} */}
        <For each={orderedConns()}>
          {(conn) => {
            return <Conn conn={conn} clientStr={conn.clientString} stream={ourStream()} screen={ourScreen()} />
          }}
        </For>
        <VideoSquare stream={ourStream()} label={`You (${our})`} us />
        <Show when={ourScreen()}>
          <VideoSquare stream={ourScreen()} label="Your screen" us />
        </Show>
        <For each={validNoobs()}>
          {(noob) => {
            {/* if (noob === our && !weAreAdmin()) return null; */}
            return (
              <div class="w-96 h-72 flex flex-col bg-gray-800 text-white text-center">
                <span class="basis-1/2" />
                {noob === our ?
                  'Waiting to be let in'
                :
                  `${noob} wants to join`
                }
                <div class="basis-1/2 flex justify-center items-center gap-2">
                  {weAreAdmin() ?
                    <>
                      <MediumButton onClick={() => props.call.confirm(noob)} class="!m-0 text-black">
                        Confirm
                      </MediumButton>
                      <MediumButton onClick={() => props.call.delNoob(noob)} class="!m-0 text-black">
                        Deny
                      </MediumButton>
                    </>
                  :
                    '(awaiting confirmation from ' + props.call.crew.admins.join(', ') + ')'
                  }
                </div>
              </div>
            );
          }}
        </For>
      </div>
      <div class="m-2 flex justify-center gap-2">
        <SmallButton onClick={() => $store('camera', b => !b)}>
          {store.camera ? 'stop camera' : 'start camera'}
        </SmallButton>
        <SmallButton onClick={() => $store('mic', b => !b)}>
          {store.mic ? 'stop mic' : 'start mic'}
        </SmallButton>
        <SmallButton onClick={() => $store('screen', b => !b)}>
          {store.screen ? 'stop screenshare' : 'start screenshare'}
        </SmallButton>
      </div>
      <div class="m-2 flex justify-center gap-2">
        <SmallButton onClick={() => phone.hangUp(props.call)}>
          Hang Up
        </SmallButton>
        {/* <Show when={our === props.call.host}> */}
        <Show when={weAreAdmin()}>
          <SmallButton onClick={() => phone.delete(props.call)}>
            End Call
          </SmallButton>
        </Show>
      </div>
    </div>);
}

function Conn(props) {
  const [chan, $chan] = createSignal(props?.conn?.channel);
  const [msgs, $msgs] = createSignal([]);
  const [msg, $msg] = createSignal('');
  const [theirStream, $theirStream] = createSignal();
  const [theirScreen, $theirScreen] = createSignal();

  createEffect(() => {
    const controller = new AbortController();
    const sigOpts = { signal: controller.signal };
    if (props.conn) {
      props.conn.addEventListener('datachannel', (event) => {
        $chan(event.channel);
      }, sigOpts);
      props.conn.addEventListener('track', (event) => {
        const stream = event.streams[0];
        if (!theirStream()) {
          $theirStream(stream);
          listenToStream(stream);
        } else if (stream !== theirStream() && !theirScreen()) {
          $theirScreen(stream);
          listenToStream(stream);
        }
      }, sigOpts);
      if (props.conn.remoteStreams?.size) {
        const streams = [...props.conn.remoteStreams];
        streams.forEach(listenToStream);
        if (streams[1]?.getTracks().length > 1) {
          $theirStream(streams[1]);
          $theirScreen(streams[0]);
        } else {
          $theirStream(streams[0]);
          $theirScreen(streams[1]);
        }
      }
    }
    function listenToStream(stream) {
      const maybeRemove = () => {
        if (stream.getTracks().length === 0) {
          if (stream === theirStream()) {
            $theirStream(undefined);
          }
          if (stream === theirScreen()) {
            $theirScreen(undefined);
          }
        }
      };
      stream.addEventListener('removetrack', (event) => {
        maybeRemove();
      }, sigOpts);
      maybeRemove();
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
  let screenSenders = [];
  createEffect(() => {
    if (props.conn) {
      if (props.screen) {
        screenSenders = props.screen.getTracks().map((track) => {
          try {
            return props.conn.addTrack(track, props.screen);
          } catch (e) {}
        });
      } else if (screenSenders.length) {
        screenSenders.forEach(s => {
          if (s) props.conn.removeTrack(s);
        });
        screenSenders = [];
      }
    }
  });

  createEffect(() => {
    let controller = new AbortController();
    if (chan()) {
      chan().addEventListener('message', (event) => {
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

  return <>
    <VideoSquare stream={theirStream()} label={'~' + props.conn.peer} />
    <Show when={theirScreen()}>
      <VideoSquare stream={theirScreen()} label={'~' + props.conn.peer + "'s screen"} />
    </Show>
  </>;
}

function VideoSquare(props) {
  let video;
  createEffect(() => {
    if (props.stream) {
      video.srcObject = props.stream;
    }
  });

  return (
    <div class="w-96 flex flex-col items-center bg-gray-800 text-white">
      <video ref={video} playsinline autoplay controls={!props.us} muted={props.us} hidden={!props.stream} />
      <Show when={!props.stream}>
        <div class="h-72 flex flex-col justify-center">
          Establishing a connection...
        </div>
      </Show>
      <Show when={props.label}>
        <span>{props.label}</span>
      </Show>
    </div>
  );
}