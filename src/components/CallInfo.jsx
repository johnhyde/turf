import { createEffect, createSignal, createMemo, onMount, onCleanup } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { useState } from 'stores/state';
import { usePhone } from 'stores/phone';
import { calcRowsColsRig, calcCellDims, bind, input } from 'lib/utils';
import Modal from '@/Modal';
import MediumButton from '@/MediumButton';
import SmallButton from '@/SmallButton';

export default function CallInfo(props) {
  const state = useState();
  const phone = usePhone();
  const [popout, $popout] = createSignal(false);
  const [peers, $peers] = createSignal([]);
  const [activePeers, $activePeers] = createSignal([]);
  const [status, $status] = createSignal();
  const [ourStream, $ourStream] = createSignal();
  const [ourScreen, $ourScreen] = createSignal();
  const [store, $store] = window.con = createStore({
    conns: {},
    connScreens: {},
    crew: {},
    camera: true,
    mic: true,
    screen: false,
    videoBoxRatio: null,
  });
  const conns = () => store.conns;
  const $conns = (...args) => $store('conns', ...args);
  const crew = () => store.crew;
  const $crew = (...args) => $store('crew', ...args);
  const weAreAdmin = () => our === props.call?.host || crew().admins?.includes(our);
  const noobs = () => Object.keys(crew().noobs || {});
  const validNoobs = () => (!crew().access?.filter) ? noobs() : noobs().filter(n => crew().filtered?.includes(n));
  const absentPeers = () => peers().filter(p => !activePeers().includes(p));


  const orderedConns = window.ocon = createMemo(() => {
    return Object.values(conns()).sort((a, b) => {
      return a.clientString.localeCompare(b.clientString);
    });
  });
  const connScreenCount = createMemo(() => {
    return Object.values(store.connScreens).length;
  });
  const videoCount = () => orderedConns().length + connScreenCount() + 1 + (ourScreen() ? 1 : 0) + validNoobs().length + absentPeers().length;
  const videoRowsCols = createMemo(() => {
    if (popout()) return calcRowsColsRig(videoCount(), 4/3, store.videoBoxRatio);
    return [videoCount(), 1];
  });
  const videoDims = createMemo(() => {
    return calcCellDims(videoCount(), 4/3, store.videoBoxWidth, popout() ? store.videoBoxHeight : 0, 10);
  });
  const videoStyle = () => ({
    width: videoDims().x + 'px',
    height: videoDims().y + 'px',
    'pointer-events': 'auto',
  });

  function togglePopout() {
    $popout(p => !p);
  }


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

  let videoBox;
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
    function vidResize() {
      $store('videoBoxRatio', videoBox.clientWidth / videoBox.clientHeight);
      $store('videoBoxWidth', videoBox.clientWidth);
      $store('videoBoxHeight', videoBox.clientHeight);
    }
    new ResizeObserver(vidResize).observe(videoBox);
    vidResize();
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
      }
    }
  });

  const videos = (<>
    <For each={orderedConns()}>
      {(conn) => {
        return <Conn conn={conn} clientStr={conn.clientString} stream={ourStream()} screen={ourScreen()} videoStyle={videoStyle()} $screen={(...args) => $store('connScreens', ...args)} />;
      }}
    </For>
    <div style={videoStyle()}>
      <VideoSquare stream={ourStream()} label={`You (${our})`} us />
    </div>
    <Show when={ourScreen()}>
      <div style={videoStyle()}>
        <VideoSquare stream={ourScreen()} label="Your screen" us />
      </div>
    </Show>
    <For each={validNoobs()}>
      {(noob) => {
        return (
          <div style={videoStyle()} class="flex flex-col bg-gray-800 text-white text-center rounded-xl">
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
    <For each={absentPeers()}>
      {(peer) => (
        <div style={videoStyle()} class="flex flex-col bg-gray-800 text-white text-center rounded-xl">
          <span class="basis-1/2" />
          Waiting for {peer}
          <div class="basis-1/2 flex justify-center items-center gap-2">
            <Show when={weAreAdmin()}>
                <MediumButton onClick={() => props.call.delPeer(peer)} class="!m-0 text-black">
                  Stop Calling
                </MediumButton>
            </Show>
          </div>
        </div>
      )}
    </For>
  </>);
  window.videos = videos;
  const contents = (
    <>
      <div ref={videoBox}
        class={'grow flex flex-wrap gap-[10px] ' + (popout() ? 'm-[10px] place-content-center overflow-hidden' : 'pointer-events-auto overflow-auto')}
      >
        {videos}
      </div>
      <div class="mt-2 flex flex-col items-center pointer-events-auto">
        <SmallButton onClick={togglePopout}>
          {popout() ? 'Pop In' : 'Pop Out'}
        </SmallButton>
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
          <Show when={weAreAdmin()}>
            <SmallButton onClick={() => phone.delete(props.call)}>
              End Call
            </SmallButton>
          </Show>
        </div>
      </div>
    </>
  );

  return () => {
    return popout() ?
      <Portal mount={document.getElementById('modals')}>
        <Modal class="w-full h-full !max-w-full !max-h-full pointer-events-none" onClose={togglePopout}>
          <div class="w-full h-full flex flex-col">
            {contents}
          </div>
        </Modal>
      </Portal>
    :
    <div class="min-h-0 flex flex-col pointer-events-none">
      {contents}
    </div>
  };
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
    onCleanup(() => {
      controller.abort();
      props.$screen(props.conn.uuid, undefined);
    });
  });
  createEffect(() => {
    if (props.stream && props.conn) {
      props.stream.getTracks().forEach((track) => {
        try { props.conn.addTrack(track, props.stream); } catch (e) {}
      });
    }
  });
  createEffect(() => {
    if (props.conn?.uuid) {
      if (theirScreen()) {
        props.$screen(props.conn.uuid, true);
      } else {
        props.$screen(props.conn.uuid, undefined);
      }
    }
  })
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
    <div style={props.videoStyle}>
      <VideoSquare stream={theirStream()} label={'~' + props.conn.peer} />
    </div>
    <Show when={theirScreen()}>
      <div style={props.videoStyle}>
        <VideoSquare stream={theirScreen()} label={'~' + props.conn.peer + "'s screen"} />
      </div>
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
    <div class="w-full h-full relative flex place-content-center bg-gray-800 text-white rounded-xl">
      <video class="absolute top-0 left-0 w-full h-full rounded-xl" ref={video} playsinline autoplay controls={!props.us} muted={props.us} hidden={!props.stream} />
      <Show when={!props.stream}>
        <div class="flex flex-col justify-center">
          {props.us ? 'Connecting to camera...' : 'Establishing a connection...'}
        </div>
      </Show>
      <Show when={props.label}>
        <span class="absolute top-0 left-0 m-2 px-2 py-1 bg-gray-500 rounded-lg opacity-70 pointer-events-none">{props.label}</span>
        <span class="absolute top-0 left-0 m-2 px-2 py-1">{props.label}</span>
      </Show>
      {/* <span class="absolute top-0 left-0 m-2 px-2 py-1 bg-gray-500 rounded-lg opacity-70 pointer-events-none"
        onClick={() => props.onToggleExpand?.()}
      >▢</span>
      <span class="absolute top-0 left-0 m-2 px-2 py-1 pointer-events-none">▢</span> */}
    </div>
  );
}