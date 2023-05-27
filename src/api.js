import UrbitApi from '@urbit/http-api';
import floorUrl from 'assets/sprites/floor.png';
import holeFloorUrl from 'assets/sprites/hole-floor.png';
import playerUrl from 'assets/sprites/player.png';
import grassUrl from 'assets/sprites/grass.png';
import longGrassUrl from 'assets/sprites/long-grass.png';
import { vec2, randInt } from 'lib/utils';
import * as me from 'melonjs';

window.imgData = {};
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// addImage(floorUrl, 'floor');
// addImage(holeFloorUrl, 'hole_floor');
// addImage(playerUrl, 'player');
// addImage(grassUrl, 'grass');
// addImage(longGrassUrl, 'longGrass');

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
    me.loader.load({ name: id, type:'image', src: dataUrl }, () => console.log('loaded ' + id, dataUrl));
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

export async function subscribeToTurf(id, onRes, onErr=()=>{}, onQuit=()=>{}) {
  const existingSubs = [...api.outstandingSubscriptions].filter(([subId, sub]) => {
    return sub.path == id;
  });
  await Promise.all(existingSubs.map(([subId, sub]) => api.unsubscribe(subId)));
  return api.subscribe({
    app: 'turf',
    path: id,
    event: (res) => {
      console.log('got a turf thing: ', res);
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

export function sendPondWave(mark, data) {
  
}

export class Item {
  constructor(name, size, image, collidable = false) {}
}

export class Tile extends Item {
  constructor(tileSize, tileImage, collidable = false) {
    super();
    this.size = tileSize;
    this.image = tileImage;
    // if (tileImage) {
    //   if (!tileImage instanceof ImageData) throw new TypeError('tileImage must be an ImageData');
    //   if (tileImage.width !== this.size.x || tileImage.height !== this.size.y) {
    //     throw new Error(`tileImage must have width and height: ${this.size.x}x${this.size.y}`);
    //   }
    //   this.image = tileImage;
    // } else {
    //   // this.image = new ImageData(this.size.x, this.size.y);
    //   // this.image = 'hi';
    //   this.image = window.floor;
    // }
    this.collidable = collidable;
  }

  duplicate() {
    return new Tile(
      // new ImageData(this.image.data, 32, 32),
      new ImageData(this.image.data, this.size.x, this.height),
      this.collidable
    ); 
  }
}

export class Tileset {
  constructor (size, tileSize) {
    this.data = new Array(size.x * size.y).fill(0).map(() => randInt(3, 1));
    this.tiles = [new Tile(tileSize, 'floor'), new Tile(tileSize, 'hole_floor')];
    this.size = size;
    this.tileSize = tileSize;
  }
}

export { api };

const turfs = {};
export async function getTurf(id) {
  console.log('getting turf', id)
  const size = turfSize;
  const turf = {
    id,
    size,
    tileSize,
    tileset: new Tileset(size, tileSize),
    items: [],
    players: [], //?
    chat: [
      { from: '~zod', msg: 'hey', at: Date.now(), real: true },
      { from: '~bus', msg: 'oh hi bro', at: Date.now(), real: true},
      { from: '~zod', msg: 'let us depart', at: Date.now(), real: true },
    ],
  };
  // turfs[id] = turf;
  return turf;
}

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