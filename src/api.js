import UrbitApi from '@urbit/http-api';

console.log(`Initializing Urbit API at ${Date()}`);
const api = new UrbitApi('', '', window.desk);
api.ship = window.ship;
// api.connect();



export class Tile {
  constructor(tileImage) {
    this.image = (tileImage instanceof ImageData) ? tileImage : new ImageData(32, 32);
  }
}

export class Tiles {
  constructor (x, y, tileImage) {
    this.tiles = (new Array(x)).map(() => {
      return (new Array(y)).map(() => {
        return new Tile(tileImage);
      });
    });
    this.width = x;
    this.height = y;
  }
}

export { api };

const turfs = {};
export async function getTurf(id) {
  const turf = {
    id,
    tiles: new Tiles(20, 15),
    players: [], //?
    chat: [
      { from: '~zod', msg: 'hey', at: Date.now(), real: true },
      { from: '~bus', msg: 'oh hi bro', at: Date.now(), real: true},
      { from: '~zod', msg: 'let us depart', at: Date.now(), real: true },
    ],
  };
  turfs[id] = turf;
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

export async function editTile(turfId, x, y, tileImg) {
  const tiles =  turfs[turfId].tiles;
  if (x >= 0 && x < tiles.width && y >= 0 && y < tiles.height) {
    tiles.tiles[x][y] = tileImg;
  }
}