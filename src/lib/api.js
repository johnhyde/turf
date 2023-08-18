import UrbitApi from '@urbit/http-api';
import { vec2, randInt, uuidv4 } from 'lib/utils';

window.imgData = {};
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// addImage(treeUrl, 'treeUrl');

function addImage(url, id) {
  const image = new Image();
  image.src = url;
  image.onload = () => createImageBitmap(image).then((bitmap) => {
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.drawImage(bitmap, 0, 0);
    
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // addTile(imageData, id);
    let dataUrl = canvas.toDataURL();
    imgData[id] = dataUrl;
    console.log('loaded ' + id, dataUrl);
  });
}

console.log(`Initializing Urbit API at ${Date()}`);
const api = new UrbitApi('', '', window.desk);
api.ship = window.ship;
window.api = api;
// api.connect();

export async function unsubscribeToTurf(id) {
  let existingSubs = [...api.outstandingSubscriptions];
  if (id) {
    existingSubs = existingSubs.filter(([_, sub]) => {
      return sub.path == id;
    });
  }
  await Promise.all(existingSubs.map(([subId, _]) => api.unsubscribe(subId)));
}

export async function subscribeToTurf(id, onRes, onErr=()=>{}, onQuit=()=>{}) {
  await unsubscribeToTurf(id);
  return api.subscribe({
    app: 'turf',
    path: id,
    event: (res) => {
      // console.log('got a turf thing: ', res);
      onRes(res);
    },
    err: (err) => {
      console.error(`Subscription to turf/pond just got "err". Turf may not exist yet.`, err);
      onErr(err);
    },
    quit: (data) => {
      console.error(`Subscription to turf/pond just got "quit"`, data);
      subscribeToTurf(id, onRes, onErr, onQuit);
      onQuit(data);
    }
  })
}

export async function sendWave(mark, path, goal, stirId) {
  stirId = stirId || uuidv4();
  await api.poke({
    app: 'turf',
    mark,
    json: {
      path,
      id: stirId,
      goal: goalToApiGoal(goal),
      // goal: {
      //   batch: [(arg === undefined) ? type : { [type]: arg }],
      // }
    },
    onError: (e) => {
      console.error('caught error in sending wave', e);
      // debugger;
    }
  });
  return stirId;
}

function goalToApiGoal(goal) {
  if (goal.arg === undefined) return goal.type;
  if (goal.type === 'batch') {
    return { batch: goal.arg.map(goalToApiGoal) };
  }
  return { [goal.type]: goal.arg };
}

export async function sendPondWave(id, goal, stirId) {
  return sendWave('pond-stir', id, goal, stirId);
}

export async function sendMistWave(type, arg, stirId) {
  return sendWave('mist-stir', '/mist', {type, arg}, stirId);
}

export async function switchToTurf(id) {
  await api.poke({
    app: 'turf',
    mark: 'join-turf',
    json: id,
  });
}

export function scry(path) {
  return api.scry({ app: 'turf', path });
}

export async function getCloset() {
  const closet = await scry('/closet');
  console.log('got closet', closet);
  return closet;
}

export { api };
