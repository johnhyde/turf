import { createEffect, createRoot, createResource, runWithOwner, mapArray, indexArray, on } from "solid-js";
import { unwrap } from "solid-js/store";
import { useState } from 'stores/state';
import { vec2, flattenGrid } from 'lib/utils';
import { extractLibrarySprites, extractPlayerSprites, spriteName } from 'lib/pond';
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

let level, layer, tileset, itemIndexMap, player;

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
      // createEffect(() => {
      //   let pos = state.player?.pos;
      //   console.log('pos', pos);
      //   if (pos && player) {
      //     player.tilePos = pos;
      //     me.game.repaint();
      //     // me.event.emit("propertyChanged", [ player ]);
      //   }
      //   // cameraPos = player.pos.clone();
      // });
      createEffect((lastTurfId) => {
        if (loader.state === 'ready') {
          const turfChanged = lastTurfId !== state.currentTurfId;
        // console.log('turf changed?', turfChanged);
          if (turfChanged ||
              state.current.turf.size.x != level.cols ||
              state.current.turf.size.y != level.rows) {
            if (lastTurfId) destroyCurrentTurf();
            if (state.current.turf) {
              initTurf(state.current.turf, state.player);
            }
            return state.currentTurfId;
          }
        }
      });
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
  }
  async function initTurf(turf, _player) {
    // turf = unwrap(turf);
    console.log("init turf tile layer", turf);
    me.game.world.gravity.set(0, 0);
    // me.state.set(me.state.PLAY, new TurfScreen(turf));
    
    // const floor = new me.Sprite(32, 32, { image: '-floor-wood_0_back' });
    // me.game.world.addChild(floor);
    const map = generateMap(turf);
    window.level = level = new me.TMXTileMap(turf.id, map);
    window.layer = layer = level.getLayers()[0];
    // tileset = layer.tileset;
    const item = _player.avatar.items[0];
    player = new Player(_player.uPos.x, _player.uPos.y, { image: spriteName(item.itemId, 0, 'back', our) });
    window.player = player;

    level.addTo(me.game.world, true, true);
    me.game.world.addChild(player);
    me.state.resume();
    // setTimeout(() => me.game.repaint(), 0);
    // me.game.repaint();
    // ({ layer, tileset } = generateLayer(turf));
    // me.game.world.addChild(layer);
    // me.loader.load({
    //   name: turf.id,
    //   type: 'tmx',
    //   data: generateMap(turf),
    // }, () => {
    //   me.state.change(me.state.PLAY);
    // })
    // me.game.viewport.focusOn(floor);
  }
}
function playerPosToGamePos(pos) {
  return vec2(pos).add(vec2(0.5, 0.6)).scale(32);
}

class Player extends me.Sprite {
  constructor(x, y, settings) {
    const tilePos = vec2(x, y);
    const pos = playerPosToGamePos(tilePos)
    super(pos.x, pos.y, {
      ...settings,
      anchorPoint: settings.anchorPoint || vec2(0.5, 1),
      alwaysUpdate: settings.alwaysUpdate || true,
    });
    this._tilePos = tilePos;
    this.targetPos = pos;
    this.step = 17;

    this.body = new me.Body(this, (new me.Rect(16, 16, 16, 16)));
    this.body.setMaxVelocity(2.5, 2.5);
    this.body.setFriction(0.4,0.4);
    me.game.viewport.follow(this, me.game.viewport.AXIS.BOTH);

    me.input.bindKey(me.input.KEY.LEFT,  "left");
    me.input.bindKey(me.input.KEY.RIGHT, "right");
    me.input.bindKey(me.input.KEY.UP,    "up");
    me.input.bindKey(me.input.KEY.DOWN,  "down");
  }

  get tilePos() {
    return this._tilePos;
  }
  set tilePos(tilePos) {
    this._tilePos = tilePos;
    this.updateTargetPos();
  }
  updateTargetPos() {
    this.targetPos = playerPosToGamePos(this._tilePos)
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
    if (pos.equals(this.targetPos)) {
      // console.log('at target')
      if (me.input.isKeyPressed("left")) {
        console.log('go left')
        this.tilePos.x--;
      }
      if (me.input.isKeyPressed("right")) {
        console.log('go right')
        this.tilePos.x++;
      }
      
      if (me.input.isKeyPressed("up")) {
        console.log('go up')
        this.tilePos.y--;
      }
      if (me.input.isKeyPressed("down")) {
        console.log('go down')
        this.tilePos.y++;
      }
    }
    this.updateTargetPos();

    // check if we moved (an "idle" animation would definitely be cleaner)
    if (dirty || !this.tilePos.equals(oldTilePos)) {
      if (!this.tilePos.equals(oldTilePos)) {
        // runWithOwner(owner, () => {
        //   const state = useState();
          state.setPos(vec2(this.tilePos).add(state.current.turf?.offset || vec2()));
        // });
      }
      super.update(dt);
      // console.log('render!');
      return true;
    }
  }
}

class TurfScreen extends me.Stage {
  constructor(turf) {
    super();
    this.turf = turf;
  }
   /**
     *  action to perform on state change
     */
   onResetEvent() {
    // load a level
      me.level.load(this.turf.id);

      // // reset the score
      // game.data.score = 0;

      // // add our HUD to the game world
      // if (typeof this.HUD === "undefined") {
      //     this.HUD = new UIContainer();
      // }
      // me.game.world.addChild(this.HUD);

      // // display if debugPanel is enabled or on mobile
      // if ((me.plugins.debugPanel && me.plugins.debugPanel.panel.visible) || me.device.touch) {
      //     if (typeof this.virtualJoypad === "undefined") {
      //         this.virtualJoypad = new VirtualJoypad();
      //     }
      //     me.game.world.addChild(this.virtualJoypad);
      // }

      // // play some music
      // me.audio.playTrack("dst-gameforest");
  }

  /**
   *  action to perform on state change
   */
  onDestroyEvent() {
      // me.game.world.removeChild(this.HUD);
  }
}

function generateLayer(turf) {
  const itemIndexMap = {};
  const tiles = Object.entries(extractLibrarySprites(turf.library)).map(([id, item], i) => {
    itemIndexMap[id] = i + 1;
    return {
      id: i,
      image: id,
    };
  });
  const tileset = new me.TMXTileset({
    firstgid: 1,
    tilewidth: turf.tileSize.x,
    tileheight: turf.tileSize.y,
    tiles,
  });
  return  {
    backgroundcolor: "#d0f4f7",
    // compressionlevel: -1,
    width: turf.size.x,
    height: turf.size.y,
    tilewidth: turf.tileSize.x,
    tileheight: turf.tileSize.y,
    infinite: false,
    layers:  [
      {
        id:1,
        name:"tiles",
        offsetx:0,
        offsety:0,
        opacity:1,
        width: turf.size.x,
        height: turf.size.y,
        data: flattenGrid(turf.spaces).map((space) => {
          if (!space.tile) return 0;
          const sprite = spriteName(space.tile.itemId, space.tile.variation, 'back');
          return itemIndexMap[sprite] || 0;
        }),
        // properties:[
        //        {
        //         name:"anchorPoint",
        //         type:"string",
        //         value:"json:{\"x\":0,\"y\":1}"
        //        }, 
        //        {
        //         name:"ratio",
        //         type:"string",
        //         value:"0.25"
        //        }, 
        //        {
        //         name:"repeat",
        //         type:"string",
        //         value:"repeat-x"
        //        }],
        type:"tilelayer",
        visible:true,
        x:0,
        y:0,
       }
    ],
    // "nextlayerid": 12,
    // "nextobjectid": 36,
    orientation: "orthogonal",
    renderorder: "right-down",
    // "tiledversion": "1.8.5",
    tilesets: [
      {
        firstgid: 1,
        tilewidth: turf.tileSize.x,
        tileheight: turf.tileSize.y,
        tiles,
      }
    ],
    type: "map",
    // "version": "1.8",
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
  // const tileset = new me.TMXTileset({
  //   firstgid: 1,
  //   tilewidth: turf.tileSize.x,
  //   tileheight: turf.tileSize.y,
  //   tiles,
  // });
  return {
    backgroundcolor: "#d0f4f7",
    // compressionlevel: -1,
    width: turf.size.x,
    height: turf.size.y,
    tilewidth: turf.tileSize.x,
    tileheight: turf.tileSize.y,
    infinite: false,
    layers:  [
      {
        id:1,
        name:"tiles",
        offsetx:0,
        offsety:0,
        opacity:1,
        width: turf.size.x,
        height: turf.size.y,
        data: flattenGrid(turf.spaces).map((space) => {
          if (!space.tile) return 1;
          const sprite = spriteName(space.tile.itemId, space.tile.variation, 'back');
          if (!itemIndexMap[sprite]) return 1;
          return itemIndexMap[sprite];
        }),
        properties:[
        //        {
        //         name:"anchorPoint",
        //         type:"string",
        //         value:"json:{\"x\":0,\"y\":1}"
        //        }, 
               {
                name:"ratio",
                type:"string",
                value:"0.25"
               }, 
        //        {
        //         name:"repeat",
        //         type:"string",
        //         value:"repeat-x"
              //  }
        ],
        type:"tilelayer",
        visible:true,
        x:0,
        y:0,
       }
    ],
    // "nextlayerid": 12,
    // "nextobjectid": 36,
    orientation: "orthogonal",
    renderorder: "right-down",
    // "tiledversion": "1.8.5",
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
    // "version": "1.8",
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
