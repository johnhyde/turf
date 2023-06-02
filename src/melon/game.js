import { createEffect, createRoot, createResource, runWithOwner, mapArray, indexArray, on } from "solid-js";
import { unwrap } from "solid-js/store";
import { useState } from 'stores/state';
import { vec2, flattenGrid } from 'lib/utils';
import { extractLibrarySprites, extractPlayerSprites, spriteName, extractItems } from 'lib/pond';
import * as me from 'melonjs';

import voidUrl from 'assets/sprites/void.png';

let owner;

window.me = me;

export function initEngine(_owner, containerId) {
  owner = _owner;
  window.pauseOnBlur = me.device.pauseOnBlur = false;
  me.device.onReady(async () => {
    await loadImage('void', voidUrl);
    onLoad(containerId);
  });
}

let level, layer, world, itemIndexMap, player, items = {};

function onLoad(containerId) {
  // init the video
  if (!me.video.init(500, 500, {
    parent: containerId,
    scaleTarget: containerId,
    scaleMethod: 'flex',
    renderer: me.video.AUTO,
    preferWebGL1: false,
    subPixel : false
  })) {
    alert("Your browser does not support HTML5 canvas.");
    return;
  }
  me.audio.init("mp3,ogg");
  console.log("loading the game engine");
  window.player = player;

  createRoot(() => {
    runWithOwner(owner, () => {
      const state = useState();
      window.state = state;
      // setPos = state.setPos.bind(state);
      console.log("run with owner");
      const [loader, { mutate, refetch }] = createResource(
        () => state.current.turf,
        (turf) => loadSprites(turf));
      createEffect(() => {
        let pos = state.player?.pos;
        // console.log('pos', pos);
        if (pos && player) {
          player.tilePos = pos;
          me.state.resume();
          // me.game.repaint();
          // me.event.emit("propertyChanged", [ player ]);
        }
        // cameraPos = player.pos.clone();
      });
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
      createEffect(on(() => JSON.stringify(state.current.spacesList), (_, lastSpaces) => {
        lastSpaces = JSON.parse(lastSpaces || '[]');
        console.log('running tile effect');
        const turf = state.current.turf;
        if (turf && loader.state == 'ready') {
          state.current.spacesList.map((space, i) => {
            if (space.tile && space.tile.itemId !== lastSpaces[i]?.tile?.itemId) {
              const pos = vec2(i % turf.size.x, Math.floor(i / turf.size.x))
              console.log('updating tile ', pos);
              const gid = itemIndexMap[spriteName(space.tile.itemId, 0, 'back')];
              const tile = new me.Tile(0, 0, gid, layer.tilesets.tilesets[1]);
              layer.setTile(tile, pos.x, pos.y);
            }
          });
          me.game.repaint();
        }
        return [];
      }, { defer: false }));
    });
  });

  async function loadSprites(turf) {
    const sprites = {
      ...extractLibrarySprites(turf.library),
      ...extractPlayerSprites(turf.players),
    };
    return Promise.all(Object.entries(sprites).map(([id, item]) => {
      return loadImage(id, item.sprite);
    }));
  }
  
  function destroyCurrentTurf() {
    me.game.world.reset();
    player = null;
    items = {};
  }
  async function initTurf(turf, _player) {
    const bounds = {
      x: turf.offset.x * turf.tileSize.x,
      y: turf.offset.y * turf.tileSize.y,
      w: turf.size.x * turf.tileSize.x,
      h: turf.size.y * turf.tileSize.y,
    };
    function _setBounds(width, height) {
      // adjust the viewport bounds if level is smaller
      const vpBounds = {
        // -turf.tileSize.x - ~~(Math.max(-5, width - bounds.w) / 2),
        // -(turf.tileSize.y * 3) - ~~(Math.max(-5, height - bounds.h) / 2),
        // -~~(Math.max(0, width - bounds.w) / 2),
        // -~~(Math.max(0, height - bounds.h) / 2),
        x: Math.min(-(turf.tileSize.x * 1), -~~(Math.max(0, width - bounds.w) / 2)),
        y: Math.min(-(turf.tileSize.y * 3), -~~(Math.max(0, height - bounds.h) / 2)),
        w: Math.max(-turf.tileSize.x*2 + bounds.w, width),
        h: Math.max(-turf.tileSize.y*2 + bounds.h, height),
        // Math.max(bounds.w, width),
        // Math.max(bounds.h, height),
        // 64,64
      };
      console.log('vpBounds', vpBounds);
      me.game.viewport.setBounds(vpBounds.x, vpBounds.y, vpBounds.w, vpBounds.h);
    }
    me.event.off(me.event.VIEWPORT_ONRESIZE, _setBounds);
    // force viewport bounds update
    _setBounds(me.game.viewport.width, me.game.viewport.height);
    // Replace the resize handler
    me.event.on(me.event.VIEWPORT_ONRESIZE, _setBounds);
  
    // turf = unwrap(turf);
    console.log("init turf tile layer", turf);
    me.game.world.gravity.set(0, 0);
    // me.state.set(me.state.PLAY, new TurfScreen(turf));
    
    // const floor = new me.Sprite(32, 32, { image: '-floor-wood_0_back' });
    // me.game.world.addChild(floor);
    const map = generateMap(turf);
    window.level = level = new me.TMXTileMap(turf.id, map);
    window.layer = layer = level.getLayers()[0];
    window.world = world = new OffsetContainer(-bounds.x, -bounds.y, 0, 0, bounds.w, bounds.h);
    world.autoDepth = false;
    world.alwaysUpdate = true;
    const garb = _player.avatar.items[0];
    player = new Player(_player.pos.x, _player.pos.y, { image: spriteName(garb.itemId, 0, 'back', our) });
    window.player = player;
    extractItems(turf).forEach(([pos, item]) => {
      let sprite = new TurfSprite(pos.x, pos.y, { image: spriteName(item.itemId, 0, 'back') });
      items[item.id] = sprite;
      world.addChild(sprite);
    });

    level.addTo(me.game.world, true, false);
    world.addChild(player);
    me.game.world.addChild(world);
    me.state.resume();
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

class TurfSprite extends me.Sprite {
  constructor(x, y, settings = {}) {
    const tilePos = vec2(x, y);
    const tilePosConverter = settings.tilePosConverter || itemPosToGamePos;
    const pos = tilePosConverter(tilePos)
    super(pos.x, pos.y, {
      ...settings,
      anchorPoint: settings.anchorPoint || vec2(0.5, 0.5),
    });
    this.updateWhenPaused = true;
    this.tilePosConverter = tilePosConverter;
    this._tilePos = tilePos;
    this.pos.z = this._tilePos.y;

    this.zOffset = settings.zOffset || 0;
    this.updateTargetPos();
  }

  get tilePos() {
    return this._tilePos;
  }
  set tilePos(tilePos) {
    this._tilePos = tilePos;
    this.updateTargetPos();
  }
  updateTargetPos() {
    this.targetPos = this.tilePosConverter(this._tilePos);
    this.pos.z = this._tilePos.y + this.zOffset;
    this.ancestor?.sort();
    // console.log('set z to ', this.pos.z);
  }
}

class Player extends TurfSprite {
  constructor(x, y, settings = {}) {
    super(x, y, {
      ...settings,
      anchorPoint: settings.anchorPoint || vec2(0.5, 1),
      tilePosConverter: playerPosToGamePos,
      zOffset: 0.5
    });
    this.alwaysUpdate = true;
    this.targetPos = this.pos;
    this.step = 17;

    this.body = new me.Body(this, (new me.Rect(16, 16, 16, 16)));
    this.body.setMaxVelocity(2.5, 2.5);
    this.body.setFriction(0.4,0.4);
    // me.game.viewport.follow(this, me.game.viewport.AXIS.BOTH);

    me.input.bindKey(me.input.KEY.LEFT,  "left");
    me.input.bindKey(me.input.KEY.RIGHT, "right");
    me.input.bindKey(me.input.KEY.UP,    "up");
    me.input.bindKey(me.input.KEY.DOWN,  "down");
  }

  update(dt) {
    const oldTilePos = vec2(this.tilePos);
    let dirty = false;
    let pos = vec2(this.pos.toVector3d());
    if (!pos.equals(this.targetPos)) {
      const newPos = pos.moveTowards(this.targetPos, this.step*dt/100);
      // console.log('move towards target');
      this.pos.x = newPos.x;
      this.pos.y = newPos.y;
      dirty = true;
    }
    pos = vec2(this.pos.toVector3d());
    let newTilePos = vec2(this.tilePos);
    if (pos.equals(this.targetPos)) {
      // console.log('at target')
      if (me.input.isKeyPressed("left")) {
        // console.log('go left')
        // this.tilePos.x--;
        newTilePos.x--;
      }
      if (me.input.isKeyPressed("right")) {
        // console.log('go right')
        // this.tilePos.x++;
        newTilePos.x++;
      }
      
      if (me.input.isKeyPressed("up")) {
        // console.log('go up')
        // this.tilePos.y--;
        newTilePos.y--;
      }
      if (me.input.isKeyPressed("down")) {
        // console.log('go down')
        // this.tilePos.y++;
        newTilePos.y++;
      }
    }
    const tilePosChanged = !newTilePos.equals(oldTilePos);
    // const tilePosChanged = !this.tilePos.equals(oldTilePos);
    // check if we moved (an "idle" animation would definitely be cleaner)
    if (dirty || tilePosChanged) {
      if (tilePosChanged) {
        // console.log('changed!');
        this.tilePos = newTilePos;
        state.setPos(newTilePos);
      }
      super.update(dt);
      return true;
    }
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
  const tiles = Object.entries(extractLibrarySprites(turf.library)).map(([id, item], i) => {
    itemIndexMap[id] = i + coreTiles.length + 1;
    return {
      id: i,
      image: id,
    };
  });
  return {
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
        data: flattenGrid(turf.spaces).map((space) => {
          if (!space.tile) return 1;
          const sprite = spriteName(space.tile.itemId, space.tile.variation, 'back');
          if (!itemIndexMap[sprite]) return 1;
          return itemIndexMap[sprite];
        }),
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
}

async function loadImage(id, url) {
  return new Promise((resolve, reject) => {
    me.loader.load({ name: id, type:'image', src: url }, () => {
      console.log('loaded ' + id, url)
      resolve();
    });
  })
}
