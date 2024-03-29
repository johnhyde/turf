import { createSignal } from 'solid-js';
import UrbitApi from '@urbit/http-api';
import { UrbitRTCApp } from 'lib/switchboard';
import { vec2, randInt, uuidv4, makeTlonId } from 'lib/utils';
import { Horn } from 'lib/horn';

window.imgData = {};
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// keeping this code around because some of it might
// be helpful for when we have to munge images for
// custom item art uploader/editor

// addImage(treeUrl, 'treeUrl');

// function addImage(url, id) {
//   const image = new Image();
//   image.src = url;
//   image.onload = () => createImageBitmap(image).then((bitmap) => {
//     canvas.width = bitmap.width;
//     canvas.height = bitmap.height;
//     ctx.drawImage(bitmap, 0, 0);
    
//     let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     // addTile(imageData, id);
//     let dataUrl = canvas.toDataURL();
//     imgData[id] = dataUrl;
//     console.log('loaded ' + id, dataUrl);
//   });
// }
let connection, $connection;

let api, rtc, horn, setHorn;
horn = new Promise((resolve) => {
  setHorn = resolve;
});
export async function initApi() {
  const [con, $con] = createSignal('initial');
  connection = con;
  $connection = $con;
  console.log(`Initializing Urbit API at ${Date()}`);
  api = new UrbitApi('', '', window.desk || 'turf');
  api.on('status-update', ({ status }) => {
    $connection(status);
  });
  api.ship = window.ship;
  // api.verbose = import.meta.env.DEV;
  api.verbose = true;
  window.api = api;
  const iceServers = await fetchIceServers();
  rtc = initRTC(iceServers);
  const realHorn = initHorn(rtc);
  setHorn(realHorn);
  window.h = realHorn;
}
// api.onOpen = () => $connection('open');
// api.onRetry = () => $connection('reconnecting');
// api.onError = () => $connection('closed');
// api.verbose = window.dev;
// api.connect();

export function reportBadConnection() {
  if (['active', 'reconnected'].includes(connection())) {
    api.eventSource();
  }
}

export async function unsubscribeToPool(id) {
  if (!api) {
    console.error('tried to unsubscribe with no api');
    return;
  }
  let existingSubs = [...api.outstandingSubscriptions];
  if (id) {
    existingSubs = existingSubs.filter(([_, sub]) => {
      return sub.path == id;
    });
  }
  await Promise.all(existingSubs.map(([subId, _]) => api.unsubscribe(subId)));
}

export async function subscribeToPool(id, onRes, onErr=()=>{}, onQuit=()=>{}) {
  await unsubscribeToPool(id);
  return api.subscribe({
    app: 'turf',
    path: id,
    event: (res) => {
      onRes(res);
    },
    err: (err) => {
      console.error(`Subscription to turf${id} just got "err". Pool may not exist yet.`, err);
      onErr(err);
    },
    quit: (data) => {
      console.error(`Subscription to turf${id} just got "quit"`, data);
      subscribeToPool(id, onRes, onErr, onQuit);
      onQuit(data);
    }
  })
}

export async function sendWave(mark, path, goals, stirId) {
  stirId = stirId || uuidv4();
  try {
    await api.poke({
      app: 'turf',
      mark,
      json: {
        path,
        id: stirId,
        goals: goalsToApiGoals(goals),
      },
      onError: (e) => {
        console.error('caught error in sending wave', e);
        // debugger;
      },
    });
    return stirId;
  } catch (e) {
    // if (e.message === 'Failed to fetch' || e.message === 'Failed to PUT channel') { 
    //   if (connection() === 'open') $connection('closed');
    // }
    throw e;
  }
}

function goalsToApiGoals(goals) {
  if (Array.isArray(goals)) {
    return goals.map(goalsToApiGoals);
  }
  if (goals.arg === undefined) return goals.type;
  return { [goals.type]: goals.arg };
}

export async function sendPondWave(id, goals, stirId) {
  return sendWave('pond-stir', id, goals, stirId);
}

export async function sendMistWave(id, goals, stirId) {
  return sendWave('mist-stir', id, goals, stirId);
}

export function scry(path) {
  return api.scry({ app: 'turf', path });
}

export async function getLocal() {
  const local = await scry('/local');
  console.log('got local', local);
  return local;
}

export function ping() {
  return api.poke({
    app: 'turf',
    mark: 'ping',
    json: null,
  });
}

export async function setVitaEnabled(enabled) {
  return api.poke({
    app: 'turf',
    mark: 'vita-client',
    json: {
      'set-enabled': enabled,
    }
  });
}

export async function sendDM(patp, msg) {
  const { id, time } = makeTlonId();
  return api.poke({
    app: 'chat',
    mark: 'dm-action',
    json: {
      ship: patp,
      diff: {
        id,
        delta: {
          add: {
            replying: null,
            author: our,
            sent: time,
            content: {
              story: {
                inline: [
                  msg,
                  {
                    break: null
                  }
                ],
                block: []
              }
            }
          }
        }
      }
    }
  });
}

async function fetchIceServers() {
  const response = await fetch(`https://turf.metered.live/api/v1/turn/credentials?apiKey=${process.env.meteredApiKey}`);
  const servers = await response.json();
  if (dev) return [];
  if (servers.length <= 2) return servers;
  return [servers[0], servers[servers.length - 1]];
}
export function initRTC(iceServers) {
  window.rtc = rtc = new UrbitRTCApp('turf', { iceServers }, api, 'turf-switchboard');
  rtc.initialize();
  rtc.addEventListener('incomingcall', (ring) => {
    console.log('pardon me for mentioning it, ladies, but someone is ringing', ring);
  });
  return rtc;
}

export function initHorn(rtc) {
  let horn = new Horn(api, rtc, 'turf', { app: 'turf-rally' });
  let incoming = horn.watchIncoming();
  incoming.addEventListener('dests-update', (e) => {
    console.log('incoming!', e);
  });
  incoming.addEventListener('subscription-error', (e) => {
    console.log('watch incoming error', e);
  });
  incoming.addEventListener('subscription-quit', (e) => {
    console.log('watch incoming quit', e);
  });
  return horn;
}

export { api, rtc, connection, horn };
