import {
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
} from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import { usePhone } from 'stores/phone.jsx';
import { bind, calcCellDims, calcRowsColsRig, input } from 'lib/utils.js';
import Modal from '@/Modal.jsx';
import MediumButton from '@/MediumButton.jsx';
import SmallButton from '@/SmallButton.jsx';

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
    camera: false,
    mic: true,
    screen: false,
    videoBoxRatio: null,
  });
  const conns = () => store.conns;
  const $conns = (...args) => $store('conns', ...args);
  const crew = () => store.crew;
  const $crew = (...args) => $store('crew', ...args);
  const weAreAdmin = () =>
    our === props.call?.host || crew().admins?.includes(our);
  const noobs = () => Object.keys(crew().noobs || {});
  const validNoobs = () =>
    (!crew().access?.filter)
      ? noobs()
      : noobs().filter((n) => crew().filtered?.includes(n));
  const absentPeers = () => peers().filter((p) => !activePeers().includes(p));
  const ourName = () => state.e?.players[our]?.avatar.nick || our;

  const orderedConns = window.ocon = createMemo(() => {
    return Object.values(conns()).sort((a, b) => {
      return a.clientString.localeCompare(b.clientString);
    });
  });
  const connScreenCount = createMemo(() => {
    return Object.values(store.connScreens).length;
  });
  const videoCount = () =>
    orderedConns().length + connScreenCount() + 1 + (ourScreen() ? 1 : 0) +
    validNoobs().length + absentPeers().length;
  const videoRowsCols = createMemo(() => {
    if (popout()) {
      return calcRowsColsRig(videoCount(), 4 / 3, store.videoBoxRatio);
    }
    return [videoCount(), 1];
  });
  const videoDims = createMemo(() => {
    return calcCellDims(
      videoCount(),
      4 / 3,
      store.videoBoxWidth,
      popout() ? store.videoBoxHeight : 0,
      10,
    );
  });
  const videoStyle = () => ({
    width: videoDims().x + 'px',
    height: videoDims().y + 'px',
    'pointer-events': 'auto',
  });

  function togglePopout() {
    $popout((p) => !p);
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
    $peers(props.call.peers.filter((p) => p !== our));
    $activePeers(props.call.activePeers.filter((p) => p !== our));
    $crew(reconcile(props.call.crew));
  }

  let videoBox;
  onMount(() => {
    const controller = new AbortController();
    async function getUserMedia() {
      try {
        await getMedia({
          video: { facingMode: 'user' },
          audio: !dev,
          // audio: true,
        });
      } catch {
        try {
          await getMedia({
            video: { facingMode: 'user' },
            audio: false,
          });
        } catch {
          try {
            await getMedia({
              video: false,
              audio: true,
            });
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
    async function getMedia(config) {
      const stream = await navigator.mediaDevices.getUserMedia(config);
      setOurStream(stream);
      window.str = stream;
    }
    function setOurStream(stream) {
      if (ourStream()) {
        ourStream().getTracks().forEach((t) => {
          t.stop();
          ourStream().removeTrack(t);
          ourStream().dispatchEvent(
            new MediaStreamTrackEvent('removetrack', {
              track: t,
            }),
          );
        });
        stream.getTracks().forEach((t) => {
          ourStream().addTrack(t);
          ourStream().dispatchEvent(
            new MediaStreamTrackEvent('addtrack', {
              track: t,
            }),
          );
        });
        if (!store.camera) {
          ourStream().getVideoTracks().forEach((t) => t.enabled = false);
        }
        if (!store.mic) {
          ourStream().getAudioTracks().forEach((t) => t.enabled = false);
        }
      } else {
        $ourStream(stream);
      }
    }
    function vidResize() {
      $store('videoBoxRatio', videoBox.clientWidth / videoBox.clientHeight);
      if (!popout() && videoBox.clientHeight !== videoBox.scrollHeight) {
        // counteract scrollbar width to avoid jittering between scrolling and not scrolling
        $store('videoBoxWidth', videoBox.clientWidth + 20);
      } else {
        $store('videoBoxWidth', videoBox.clientWidth);
      }
      $store('videoBoxHeight', videoBox.clientHeight);
      console.log('videoBoxWidth', videoBox.clientWidth);
    }
    new ResizeObserver(vidResize).observe(videoBox);
    getUserMedia();
    vidResize();
    navigator.mediaDevices.addEventListener('devicechange', getUserMedia, {
      signal: controller.signal,
    });
    onCleanup(() => {
      if (ourStream()) {
        ourStream().getTracks().forEach((t) => t.stop());
      }
      if (ourScreen()) {
        ourScreen().getTracks().forEach((t) => t.stop());
      }
      controller.abort();
    });
  });

  createEffect(on(() => [ourStream(), store.camera], () => {
    if (ourStream()) {
      ourStream().getVideoTracks().forEach((t) => t.enabled = store.camera);
    }
  }));
  createEffect(on(() => [ourStream(), store.mic], () => {
    if (ourStream()) {
      ourStream().getAudioTracks().forEach((t) => t.enabled = store.mic);
    }
  }));
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
        .then((stream) => {
          $ourScreen(stream);
          window.scr = stream;
          stream.getTracks()[0].addEventListener('ended', () => {
            $store('screen', false);
          }, { once: true });
        })
        .catch((error) => {
          $store('screen', false);
          console.error(error);
        });
    }
  });
  createEffect(() => {
    if (state.gameLoaded && state.soundOn) {
      if (validNoobs().filter((p) => p !== our).length) {
        game.sound.play('join');
      }
    }
  });

  const videos = (
    <>
      <For each={orderedConns()}>
        {(conn) => {
          return (
            <Conn
              conn={conn}
              clientStr={conn.clientString}
              stream={ourStream()}
              screen={ourScreen()}
              videoStyle={videoStyle()}
              $screen={(...args) => $store('connScreens', ...args)}
              admin={weAreAdmin()}
              call={props.call}
            />
          );
        }}
      </For>
      <div style={videoStyle()}>
        <VideoSquare stream={ourStream()} label={`You (${ourName()})`} us />
      </div>
      <Show when={ourScreen()}>
        <div style={videoStyle()}>
          <VideoSquare stream={ourScreen()} label='Your screen' us />
        </div>
      </Show>
      <For each={validNoobs()}>
        {(noob) => {
          return (
            <div
              style={videoStyle()}
              class='flex flex-col bg-gray-800 text-white text-center rounded-xl'
            >
              <span class='basis-1/2' />
              {noob === our ? 'Waiting to be let in' : `${noob} wants to join`}
              <div class='basis-1/2 flex justify-center items-center gap-2'>
                {weAreAdmin()
                  ? (
                    <>
                      <MediumButton
                        onClick={() => props.call.confirm(noob)}
                        class='!m-0 text-black'
                      >
                        Confirm
                      </MediumButton>
                      <MediumButton
                        onClick={() => props.call.delNoob(noob)}
                        class='!m-0 text-black'
                      >
                        Deny
                      </MediumButton>
                    </>
                  )
                  : '(awaiting confirmation from ' +
                    props.call.crew.admins.join(', ') + ')'}
              </div>
            </div>
          );
        }}
      </For>
      <For each={absentPeers()}>
        {(peer) => (
          <div
            style={videoStyle()}
            class='flex flex-col bg-gray-800 text-white text-center rounded-xl'
          >
            <span class='basis-1/2' />
            Waiting for {peer}
            <div class='basis-1/2 flex justify-center items-center gap-2'>
              <Show when={weAreAdmin()}>
                <MediumButton
                  onClick={() => props.call.delPeer(peer)}
                  class='!m-0 text-black'
                >
                  Stop Calling
                </MediumButton>
              </Show>
            </div>
          </div>
        )}
      </For>
    </>
  );
  window.videos = videos;
  const contents = (
    <>
      <div
        ref={videoBox}
        class={'grow flex flex-wrap gap-[10px] ' + (popout()
          ? 'm-[10px] place-content-center overflow-hidden'
          : 'pointer-events-auto overflow-auto')}
      >
        {videos}
      </div>
      <div class='mt-2 flex flex-col items-center pointer-events-auto'>
        <SmallButton onClick={togglePopout}>
          {popout() ? 'Pop In' : 'Pop Out'}
        </SmallButton>
        <div class='m-2 flex justify-center gap-2'>
          <SmallButton onClick={() => $store('camera', (b) => !b)}>
            {store.camera ? 'stop camera' : 'start camera'}
          </SmallButton>
          <SmallButton onClick={() => $store('mic', (b) => !b)}>
            {store.mic ? 'stop mic' : 'start mic'}
          </SmallButton>
          <SmallButton onClick={() => $store('screen', (b) => !b)}>
            {store.screen ? 'stop screenshare' : 'start screenshare'}
          </SmallButton>
        </div>
        <div class='m-2 flex justify-center gap-2'>
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
    return popout()
      ? (
        <Portal mount={document.getElementById('modals')}>
          <Modal
            class='w-full h-full !max-w-full !max-h-full pointer-events-none'
            onClose={togglePopout}
          >
            <div class='w-full h-full flex flex-col'>
              {contents}
            </div>
          </Modal>
        </Portal>
      )
      : (
        <div class='relative z-30 min-h-0 flex flex-col pointer-events-none'>
          {contents}
        </div>
      );
  };
}

function Conn(props) {
  const state = useState();
  const [chan, $chan] = createSignal(props?.conn?.channel);
  const [msgs, $msgs] = createSignal([]);
  const [msg, $msg] = createSignal('');
  const [theirStream, $theirStream] = createSignal();
  const [theirScreen, $theirScreen] = createSignal();

  const patp = () => '~' + props.conn.peer;
  const playerName = () => state.e?.players[patp()]?.avatar.nick || patp();

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
  const streamTracks = {};
  createEffect(() => {
    const controller = new AbortController();
    const sigOpts = { signal: controller.signal };
    if (props.stream && props.conn) {
      props.stream.getTracks().forEach((track) => {
        try {
          addTrack(track);
        } catch (e) {}
      });
      props.stream.addEventListener('addtrack', ({ track }) => {
        addTrack(track);
      }, sigOpts);
      props.stream.addEventListener('removetrack', ({ track }) => {
        if (streamTracks[track.id]) {
          props.conn.removeTrack(streamTracks[track.id]);
          delete streamTracks[track.id];
        }
      }, sigOpts);
    }
    function addTrack(track) {
      const connTrack = props.conn.addTrack(track, props.stream);
      streamTracks[track.id] = connTrack;
    }
    onCleanup(() => {
      controller.abort();
      // streamTracks = {};
    });
  });
  createEffect(() => {
    if (props.conn?.uuid) {
      if (theirScreen()) {
        props.$screen(props.conn.uuid, true);
      } else {
        props.$screen(props.conn.uuid, undefined);
      }
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
        screenSenders.forEach((s) => {
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

  return (
    <>
      <div style={props.videoStyle}>
        <VideoSquare stream={theirStream()} label={playerName()}>
          {props.admin &&
            (
              <button
                onClick={() => props.call.delPeer(patp())}
                class='px-2 py-1'
              >
                Kick
              </button>
            )}
        </VideoSquare>
      </div>
      <Show when={theirScreen()}>
        <div style={props.videoStyle}>
          <VideoSquare
            stream={theirScreen()}
            label={playerName() + "'s screen"}
          />
        </div>
      </Show>
    </>
  );
}

function VideoSquare(props) {
  const [speaking, $speaking] = createSignal(false);
  const [menuOpen, $menuOpen] = createSignal(false);
  let video, analyze, analyzer, controller = new AbortController();
  createEffect(() => {
    if (props.stream) {
      video.srcObject = props.stream;
      stopAnalyzing();
      controller = new AbortController();
      props.stream.addEventListener('addtrack', () => {
        mediaAnalyze(props.stream);
      }, { signal: controller.signal });
      mediaAnalyze(props.stream);
    } else {
      stopAnalyzing();
    }
  });

  function mediaAnalyze(stream) {
    let frequencyData;
    try {
      analyze = true;
      const audioCtx = new AudioContext();
      analyzer = audioCtx.createAnalyser();
      window.an = analyzer;
      if (!stream.getAudioTracks().length) return;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyzer);
      analyzer.fftSize = 128;

      frequencyData = new Uint8Array(analyzer.frequencyBinCount);
      renderFrame();
    } catch (e) {
      console.log(e);
    }
    function renderFrame() {
      analyzer.getByteFrequencyData(frequencyData);
      const max = frequencyData.reduce((a, b) => Math.max(a, b), 0);
      $speaking(max > 100);
      // console.log('analyzing audio');
      if (analyze) {
        analyze = setTimeout(renderFrame, 100);
      }
    }
  }

  function stopAnalyzing() {
    clearTimeout(analyze);
    analyze = false;
    controller.abort();
  }

  onCleanup(() => {
    stopAnalyzing();
  });

  return (
    <div
      class={'w-full h-full relative flex place-content-center bg-gray-800 text-white rounded-xl border-2 border-transparent' +
        ' ' + (speaking() ? 'bg-green-500' : '')}
    >
      <video
        class='absolute top-0 left-0 w-full h-full rounded-xl'
        ref={video}
        playsinline
        autoplay
        controls={!props.us}
        muted={props.us}
        hidden={!props.stream}
      />
      <Show when={!props.stream}>
        <div class='flex flex-col justify-center'>
          {props.us
            ? 'Connecting to camera...'
            : 'Establishing a connection...'}
        </div>
      </Show>
      <Show when={props.label}>
        <span class='absolute top-0 left-0 m-2 px-2 py-1 bg-gray-500/70 rounded-lg'>
          {props.label}
        </span>
        {/* <span class='absolute top-0 left-0 m-2 px-2 py-1'>{props.label}</span> */}
      </Show>
      <Show when={props.children}>
        <div class='absolute top-0 right-0 m-2 text-right'>
          <button
            onClick={() => $menuOpen((o) => !o)}
            class={'px-2 -pt-1 pb-2 bg-gray-500/70 rounded-lg' + ' ' +
              (menuOpen() ? 'rounded-b-none' : '')}
          >
            ...
          </button>
          <Show when={menuOpen()}>
            <div class='bg-gray-500/70 rounded-lg rounded-tr-none'>
              {props.children}
            </div>
          </Show>
        </div>
      </Show>
      {
        /* <span class="absolute top-0 left-0 m-2 px-2 py-1 bg-gray-500 rounded-lg opacity-70 pointer-events-none"
        onClick={() => props.onToggleExpand?.()}
      >▢</span>
      <span class="absolute top-0 left-0 m-2 px-2 py-1 pointer-events-none">▢</span> */
      }
    </div>
  );
}
