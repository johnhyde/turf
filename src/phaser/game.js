import { createSignal, createEffect, createRoot, createResource, runWithOwner, mapArray, indexArray, on } from "solid-js";
import { unwrap } from "solid-js/store";
import { useState } from 'stores/state';
import { vec2, flattenGrid, near } from 'lib/utils';
import { extractLibrarySprites, extractPlayerSprites, spriteName, extractItems } from 'lib/pond';
import * as me from 'melonjs';

import voidUrl from 'assets/sprites/void.png';
import treeUrl from 'assets/sprites/tree.png';
import { swapAxes } from "../lib/utils";

let owner;
var game, scene, cam, cursors, keys = {}, player, tiles;
var itemIndexMap, items = {};

window.me = me;

async function loadImage(id, url) {
  return new Promise((resolve, reject) => {
    // game.textures.addListener(Phaser.Textures.Events.ADD_KEY+id, resolve);
    game.textures.addListener(Phaser.Textures.Events.ADD_KEY+id, () => {
      console.log('loaded image', id);
      resolve();
    });
    game.textures.addListener(Phaser.Textures.Events.ERROR, (key) => {
      console.error('could not load image', key);
      if (key === 'id') {
        reject();
      }
    });
    game.textures.addBase64(id, url);
    // me.loader.load({ name: id, type:'image', src: url }, () => {
    //   console.log('loaded ' + id, url)
      // resolve();
    // });

  })
}

export function startPhaser(_owner, container) {
  owner = _owner;
  createRoot(() => {
    runWithOwner(owner, () => {
      const [loaded, $loaded] = createSignal(false);
      console.log('container', container.clientWidth, container.clientHeight);
      var config = {
        type: Phaser.AUTO,
        parent: container,
        width: ~~container.clientWidth || 500,
        height: ~~container.clientHeight || 500,
        pixelArt: true,
        roundPixels: true,
        // zoom: 1,
        scene: {
          init,
          preload: preload,
          create: create,
          update: update
        },
        physics: {
          default: 'arcade',
          arcade: {

          },
        },
      };

      window.game = game = new Phaser.Game(config);

      function init() {
        // window.scene = scene = game.scene.scenes[0];
        window.scene = scene = this;
        window.cam = cam = scene.cameras.main;
        $loaded(true);
      }

      function preload() {
        console.log('preload');
      }

      function create() {
        cursors = this.input.keyboard.createCursorKeys();
        keys.f = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes['F']);
      }

      function update() {
        if (!cam.roundPixels) cam.setRoundPixels(true);
        if (player) updatePlayer();
        if (keys.f.isDown) {
          keys.f.reset();
          game.scale.startFullscreen();
        }
        // console.log('f key', keys.f)
      }
      function updatePlayer() {
        if (cursors.left.isDown) {
          player.setVelocityX(-160);
        } else if (cursors.right.isDown) {
          player.setVelocityX(160);
        } else {
          player.setVelocityX(0);
        }
        if (cursors.up.isDown) {
          player.setVelocityY(-160);
        } else if (cursors.down.isDown) {
          player.setVelocityY(160);
        } else {
          player.setVelocityY(0);
        }
      }

      console.log("loading the game engine");

      const state = useState();
      window.state = state;

      function setGameSize() {
        console.log('resized')
        const el = game.scale.isFullscreen ? game.canvas.parentElement : container;
        const width = ~~(state.scale * el.clientWidth);
        const height = ~~(state.scale * el.clientHeight);
        if (!near(width, game.scale.width, 1) || !near(height, game.scale.height, 1)) {
          game.scale.resize(width, height);
          game.canvas.style.setProperty('width', '100%');
          game.canvas.style.setProperty('height', '100%');
        }
      }
      window.addEventListener('resize', setGameSize, false);
      game.scale.addListener(Phaser.Scale.Events.ENTER_FULLSCREEN, setGameSize);
      game.scale.addListener(Phaser.Scale.Events.LEAVE_FULLSCREEN, () => setTimeout(setGameSize, 100));
      createEffect(() => {
        setGameSize();
      })
      setGameSize();
      const [loader, { mutate, refetch }] = createResource(
        () => state.current.turf,
        (turf) => loadSprites(turf));
      // createEffect(() => {
      //   let pos = state.player?.pos;
      //   // console.log('pos', pos);
      //   if (pos && player) {
      //     player.tilePos = pos;
      //   }
      // });
      createEffect(on(() => [
        loader.state,
        state.current.id,
        state.current.turf?.size,
        state.current.turf?.offset,
      ], (_, __, lastTurfId) => {
        if (loader.state === 'ready') {
          if (lastTurfId || state.current.turf) destroyCurrentTurf();
          if (state.current.turf) {
            initTurf(state.current.turf, state.player);
          }
          return state.current.id;
        };
      }));
      // createEffect(on(() => JSON.stringify(state.current.spacesList), (_, lastSpaces) => {
      //   lastSpaces = JSON.parse(lastSpaces || '[]');
      //   console.log('running tile effect');
      //   const turf = state.current.turf;
      //   if (turf && loader.state == 'ready') {
      //     state.current.spacesList.map((space, i) => {
      //       if (space.tile && space.tile.itemId !== lastSpaces[i]?.tile?.itemId) {
      //         const pos = vec2(i % turf.size.x, Math.floor(i / turf.size.x))
      //         console.log('updating tile ', pos);
      //         const gid = itemIndexMap[spriteName(space.tile.itemId, 0, 'back')];
      //         const tile = new me.Tile(0, 0, gid, layer.tilesets.tilesets[1]);
      //         layer.setTile(tile, pos.x, pos.y);
      //       }
      //     });
      //     me.game.repaint();
      //   }
      //   return [];
      // }, { defer: false }));
    });
  });

  async function loadSprites(turf) {
    console.log('loading sprites');
    const sprites = {
      ...extractLibrarySprites(turf.library),
      ...extractPlayerSprites(turf.players),
    };
    const promises = Object.entries(sprites).map(([id, item]) => {
      return loadImage(id, item.sprite);
    });
    promises.push(loadImage('void', voidUrl));
    return Promise.all(promises);
  }
  
  function destroyCurrentTurf() {
    player = null;
    items = {};
  }
  let setBounds;
  async function initTurf(turf, _player) {
    const bounds = {
      x: turf.offset.x * turf.tileSize.x,
      y: turf.offset.y * turf.tileSize.y,
      w: turf.size.x * turf.tileSize.x,
      h: turf.size.y * turf.tileSize.y,
    };
    function _setBounds() {
      // const width = ~~container.clientWidth;
      // const height = ~~container.clientHeight;
      const width = ~~game.scale.width;
      const height = ~~game.scale.height;
      // adjust the viewport bounds if level is smaller
      const buffer = {
        l: turf.tileSize.x * 1,
        t: turf.tileSize.y * 3,
        r: turf.tileSize.x * 1,
        b: turf.tileSize.y * 1,
      };
      const bbounds = {
        x: bounds.x + Math.min(-buffer.l, -~~(Math.max(0, width - bounds.w) / 2)),
        y: bounds.y + Math.min(-buffer.t, -~~(Math.max(0, height - bounds.h) / 2)),
        w: Math.max(buffer.l + buffer.r + bounds.w, width),
        h: Math.max(buffer.t + buffer.b + bounds.h, height),
      };
      console.log('bbounds', bbounds);
      scene.cameras.main.setBounds(bbounds.x, bbounds.y, bbounds.w, bbounds.h)
    }
    window.removeEventListener('resize', setBounds);
    createEffect(on(() => state.scale, () => {
      setBounds();
    }))
    _setBounds();
    setBounds = _setBounds;
    window.addEventListener('resize', setBounds);
    console.log("init turf tile layer", turf);
    
    const [level, tilesetData] = generateMap(turf);
    const map = scene.make.tilemap({ data: level, tileWidth: turf.tileSize.x, tileHeight: turf.tileSize.y });
    const tilesets = tilesetData.map((tileset, i) => {
      return map.addTilesetImage(tileset.image, undefined, undefined, undefined, undefined, undefined, i + 1);
    });
    const layer = map.createLayer(0, tilesets, bounds.x, bounds.y);
    window.tiles = tiles = layer;
    const garb = _player.avatar.items[0];
    const playerPos = vec2(_player.pos).scale(32);
    player = scene.physics.add.image(playerPos.x, playerPos.y, spriteName(garb.itemId, 0, 'back', our));
    player.tilePos = vec2(_player.pos);
    cam.startFollow(player);
    window.player = player;
    extractItems(turf).forEach(([pos, item]) => {
      const itemPos = vec2(pos).scale(32);
      let sprite = scene.add.image(itemPos.x, itemPos.y, spriteName(item.itemId, 0, 'back'));
      // sprite.originX = 0;
      // sprite.originY = 0;
    // let sprite = new TurfSprite(pos.x, pos.y, { image: spriteName(item.itemId, 0, 'back') });
      items[item.id] = sprite;
      // world.addChild(sprite);
    });
  }
}

function itemPosToGamePos(pos) {
  return vec2(pos).add(vec2(0.5, 0.5)).scale(32);
}

function playerPosToGamePos(pos) {
  return vec2(pos).add(vec2(0.5, 0.6)).scale(32);
}

class OffsetContainer extends me.Container {
  constructor(offsetX = 0, offsetY = 0, x = 0, y = 0, width, height, root = false) {
    super(offsetX, offsetY, width, height, root);
    this.origin = vec2(x, y);
  }

  updateBounds(_) {
    let bounds = this.getBounds();
    const origin = this.origin || vec2();
    bounds.setMinMax(origin.x, origin.y, this.width + origin.x, this.height + origin.y);
    return bounds;
  }
}


const coreTiles = [
  {
    id: 0,
    image: 'void',
  }
];

function generateMap(turf) {
  itemIndexMap = {};
  // const tiles = Object.entries(extractLibrarySprites(turf.library)).map(([id, item], i) => {
  const tiles = Object.entries(extractLibrarySprites(turf.library)).map(([id, item], i) => {
    itemIndexMap[id] = i + coreTiles.length + 1;
    return {
      id: i,
      image: id,
    };
  });
  const map =  {
    backgroundcolor: "#d0f4f7",
    width: turf.size.x,
    height: turf.size.y,
    tilewidth: turf.tileSize.x,
    tileheight: turf.tileSize.y,
    infinite: false,
    layers:  [
      {
        id:1,
        name:"tiles",
        width: turf.size.x,
        height: turf.size.y,
        offsetx:0,
        offsety:0,
        opacity:1,
        data: swapAxes(turf.spaces).map((row) => row.map((space) => {
          if (!space.tile) return 1;
          const sprite = spriteName(space.tile.itemId, space.tile.variation, 'back');
          if (!itemIndexMap[sprite]) return 1;
          return itemIndexMap[sprite];
        })),
        properties:[],
        type:"tilelayer",
        visible:true,
       },
    ],
    orientation: "orthogonal",
    renderorder: "right-down",
    tilesets: [
      {
        firstgid: 1,
        name: 'core tiles',
        tilewidth: turf.tileSize.x,
        tileheight: turf.tileSize.y,
        tiles: coreTiles,
      },
      {
        firstgid: coreTiles.length + 1,
        name: 'library tiles',
        tilewidth: turf.tileSize.x,
        tileheight: turf.tileSize.y,
        tiles,
      }
    ],
    type: "map",
  };
  return [map.layers[0].data, [...coreTiles, ...tiles]];
}
