import UrbitApi from '@urbit/http-api';
import { vec2, randInt, uuidv4 } from 'lib/utils';

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

console.log(`Initializing Urbit API at ${Date()}`);
const api = new UrbitApi('', '', window.desk);
api.ship = window.ship;
window.api = api;
// api.connect();

export async function unsubscribeToPool(id) {
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
    }
  });
  return stirId;
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

export async function setVitaEnabled(enabled) {
  return api.poke({
    app: 'turf',
    mark: 'vita-client',
    json: {
      'set-enabled': enabled,
    }
  });
}

export { api };
