import { createEffect, createRoot, runWithOwner } from "solid-js";
import { useState } from 'stores/state';
import { vec2 } from 'lib/utils';
import { extractLibrarySprites, spriteName } from 'lib/pond';
import * as me from 'melonjs';

let owner;

window.me = me;

export function initEngine(_owner, containerId) {
  owner = _owner;
  me.device.onReady(() => {
    onLoad(containerId);
  });
}

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
      createEffect(async () => {
        if (lastTurfId !== state.currentTurfId) {
          if (lastTurfId) destroyCurrentTurf();
          lastTurfId = state.currentTurfId;
          if (state.currentTurf) {
            let hm = await loadTurfSprites(state.currentTurf);
            initTurf(state.currentTurf);
          }
        }
      });
      // createEffect(() => {
      //   if (state.currentTurf) {
      //     loadTurfSprites(state.currentTurf)
      //   }
      // });
    });
  });

  async function loadTurfSprites(turf) {
    const sprites = extractLibrarySprites(turf.library);
    return Promise.all(Object.entries(sprites).map(([id, item]) => {
      return loadImage(id, item.sprite);
    }));
  }
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
  const tiles = Object.entries(extractLibrarySprites(turf.library)).map(([id, item], i) => {
    itemIndexMap[id] = i + 1;
    return {
      id: i,
      image: id,
    };
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
          if (!space.tile) return 0;
          const sprite = spriteName(space.tile.itemId, space.tile.variation, 'back');
          return itemIndexMap[sprite] || 0;
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
        tiles,
      }
    ],
    "type": "map",
    // "version": "1.8",
  }
}

async function loadImage(id, url) {
  return new Promise((resolve, reject) => {
    me.loader.load({ name: id, type:'image', src: url }, () => {
      console.log('loaded ' + id, url)
      resolve()
    });
  })
}
