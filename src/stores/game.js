import { createEffect, createRoot, runWithOwner } from "solid-js";
import { useState } from 'stores/state';
import { vec2 } from 'lib/utils';
import * as me from 'melonjs';

let owner;

window.me = me;

export function initEngine(_owner, game) {
  owner = _owner;
  me.device.onReady(() => {
    onLoad();
  });
}

function onLoad() {
  // init the video
  if (!me.video.init(500, 500, {parent : "game", scaleMethod: 'flex', renderer : me.video.AUTO, preferWebGL1 : false, subPixel : false })) {
    alert("Your browser does not support HTML5 canvas.");
    return;
  }
  me.audio.init("mp3,ogg");
  createRoot(() => {
    
    runWithOwner(owner, () => {
      const state = useState();
      createEffect(() => {
        const pos = state.playerExistence.pos;
        console.log('pos', pos);
        // player.pos = vec2(pos.x + 0.5, pos.y + 0.6);
        // cameraPos = player.pos.clone();
      });
      let lastTurfId = undefined;
      createEffect(() => {
        if (lastTurfId !== state.currentTurfId) {
          if (lastTurfId) destroyCurrentTurf();
          lastTurfId = state.currentTurfId;
          if (state.currentTurf) {
            initTurf(state.currentTurf);
          }
        }
      });
    });
  });
  let level;
  
  function destroyCurrentTurf() {
    me.game.world.reset();
  }
  function initTurf(turf) {
    console.log("init turf tile layer");
    // const floor = new me.Sprite(32, 32, { image: 'floor' });
    // me.state.set(me.state.PLAY, new TurfScreen(turf));
    // me.game.world.addChild(floor);
    level = new me.TMXTileMap(turf.id, generateMap(turf));
    level.addTo(me.game.world, true, true)
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

function generateMap(turf) {
  const itemIndexMap = {};
  const tileset = Object.entries(turf.library).map(([id, item], i) => {
    itemIndexMap[i] = id;
    
  });
  return  {
    "backgroundcolor": "#d0f4f7",
    // "compressionlevel": -1,
    "width": turf.size.x,
    "height": turf.size.y,
    "tilewidth": turf.tileSize.x,
    "tileheight": turf.tileSize.y,
    "infinite": false,
    "layers":  [
      {
        "id":1,
        "name":"hm",
        "offsetx":0,
        "offsety":0,
        "opacity":1,
        "width": turf.size.x,
        "height": turf.size.y,
        data: turf.spaces.flat().map((space) => {

        }),
        // "properties":[
        //        {
        //         "name":"anchorPoint",
        //         "type":"string",
        //         "value":"json:{\"x\":0,\"y\":1}"
        //        }, 
        //        {
        //         "name":"ratio",
        //         "type":"string",
        //         "value":"0.25"
        //        }, 
        //        {
        //         "name":"repeat",
        //         "type":"string",
        //         "value":"repeat-x"
        //        }],
        "type":"tilelayer",
        "visible":true,
        "x":0,
        "y":0,
       }
    ],
    // "nextlayerid": 12,
    // "nextobjectid": 36,
    "orientation": "orthogonal",
    "renderorder": "right-down",
    // "tiledversion": "1.8.5",
    "tilesets": [
      {
        firstgid: 1,
        "tilewidth": turf.tileSize.x,
        "tileheight": turf.tileSize.y,
        tiles: turf.tileset.tiles.map((tile, i) => {
          return {
            id: i,
            image: tile.image,
          };
        }),
      }
    ],
    "type": "map",
    // "version": "1.8",
  }
}