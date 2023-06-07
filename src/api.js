import UrbitApi from '@urbit/http-api';
// import floorUrl from 'assets/sprites/floor.png';
// import holeFloorUrl from 'assets/sprites/hole-floor.png';
// import playerUrl from 'assets/sprites/player.png';
// import grassUrl from 'assets/sprites/grass.png';
// import longGrassUrl from 'assets/sprites/long-grass.png';
import tableUrl from 'assets/sprites/table.png';
import stoolUrl from 'assets/sprites/stool.png';
import treeUrl from 'assets/sprites/tree.png';
import { vec2, randInt } from 'lib/utils';

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
const turfSize = vec2(4);
const tileSize = vec2(32);

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

export async function sendPondWave(id, mark, data) {
  let result = await api.poke({
    app: 'turf',
    mark: 'stir-pond',
    json: {
      path: id,
      id: 'hmmb',
      wave: !data ? mark : { [mark]: data },
    },
  });
  return result;
}

export { api };

const turfs = {};

export function chat(turfId, msg) {
  const chat = {
    from: '~' + window.ship,
    msg,
    at: Date.now(),
    real: false,
  };
  turfs[turfId].chat.push(chat);
  sendChat(turfId, chat);
}

export async function sendChat(turfId, chat) {
  setTimeout(() => {
    chat.real = true;
  }, 2000);
}

export async function editTile(turfId, pos, tileImg) {
  const tiles =  turfs[turfId].tiles;
  if (pos.x >= 0 && pos.x < tiles.size.x && pos.y >= 0 && pos.y < tiles.size.y) {
    tiles.tiles[pos.x][pos.y] = tileImg;
  }
}