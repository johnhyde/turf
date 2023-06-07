import UrbitApi from '@urbit/http-api';
// import floorUrl from 'assets/sprites/floor.png';
// import holeFloorUrl from 'assets/sprites/hole-floor.png';
// import playerUrl from 'assets/sprites/player.png';
// import grassUrl from 'assets/sprites/grass.png';
// import longGrassUrl from 'assets/sprites/long-grass.png';
import tableUrl from 'assets/sprites/table.png';
import stoolUrl from 'assets/sprites/stool.png';
import treeUrl from 'assets/sprites/tree.png';
import { vec2, randInt, uuidv4 } from 'lib/utils';

window.imgData = {};
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// addImage(floorUrl, 'floor');
// addImage(holeFloorUrl, 'hole_floor');
// addImage(playerUrl, 'player');
// addImage(grassUrl, 'grass');
// addImage(longGrassUrl, 'longGrass');
// addImage(tableUrl, 'tableUrl');
// addImage(stoolUrl, 'stoolUrl');
addImage(treeUrl, 'treeUrl');

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
// const api = new UrbitApi('http://127.0.0.1:8080', 'nilfel-nimfeb-navnux-tabned', window.desk);
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
      onQuit(data);
    }
  })
}

export async function sendPondWave(id, mark, data, stirId) {
  stirId = stirId || uuidv4();
  await api.poke({
    app: 'turf',
    mark: 'stir-pond',
    json: {
      path: id,
      id: stirId,
      wave: !data ? mark : { [mark]: data },
    },
    onError: (e) => {
      console.error('caught error in sending wave', e);
      debugger;
    }
  });
  return stirId;
}

export { api };
