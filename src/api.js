import UrbitApi from '@urbit/http-api';

console.log(`Initializing Urbit API at ${Date()}`);
const api = new UrbitApi('', '', window.desk);
api.ship = window.ship;
// api.connect();



export class Tile {
  constructor(tileImage, collidable = false) {
    this.size = tileSizeDefault;
    if (tileImage) {
      if (!tileImage instanceof ImageData) throw new TypeError('tileImage must be an ImageData');
      if (tileImage.width !== this.size.x || tileImage.height !== this.size.y) {
        throw new Error(`tileImage must have width and height: ${this.size.x}x${this.size.y}`);
      }
      this.image = tileImage;
    } else {
      // this.image = new ImageData(this.size.x, this.size.y);
      this.image = 'hi';
    }
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

export class Tiles {
  constructor (size, tileImage) {
    this.tiles = new Array(size.x).fill(0).map(() => {
      return new Array(size.y).fill(0).map(() => {
        return new Tile(tileImage);
      });
    });
    this.size = size;
  }
}

export { api };

const turfs = {};
export async function getTurf(id) {
  console.log('getting turf', id)
  const turf = {
    id,
    tiles: new Tiles(vec2(20, 15)),
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