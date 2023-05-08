import { createEffect, createRoot, runWithOwner } from "solid-js";
import { useState } from 'stores/state';

// import { createSignal } from 'solid-js';
// import { createStore } from 'solid-js/store';

// const [game, $game] = createSignal({ name: 'goop' });
// export const Game = { game, $game };

tileSizeDefault = vec2(32);
var owner;
let player, tileLayer;

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
  // enable touch gamepad on touch devices
  touchGamepadEnable = 1;

  // setup game
  cameraScale = 4*16;
  player = new EngineObject();
  // gameTimer.set();
  // buildLevel();
  createRoot(() => {

    runWithOwner(owner, () => {
      const state = useState();
      createEffect(() => {
        const pos = state.playerExistence.pos;
        console.log('pos', pos);
        player.pos = vec2(pos.x + 0.5, pos.y + 0.6);
        cameraPos = player.pos.copy();
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

  function destroyCurrentTurf() {
    if (tileLayer) tileLayer.destroy();
  }
  function initTurf(turf) {
    console.log("init turf tile layer");
    const tiles = turf.tiles;
    window.tileLayer = tileLayer = new TileLayer(vec2(), tiles.size);
    for (let x = tiles.tiles.length; x--;) {
      for (let y = tiles.tiles[x].length; y--;) {
        tileLayer.setData(vec2(x, y), new TileLayerData(-1, undefined, undefined, randColor(new Color(1,.2,.2), new Color(.2,.1,.1))));
      }
    }
    tileLayer.redraw();
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{
}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
// export function initEngine(_state, rootEl) {
export function initEngine(_owner, rootEl) {
  owner = _owner;
  window.owner = _owner;
  console.log(owner);
  engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, undefined, rootEl);
  // engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, undefined);
}

export function setTurf(turf) {

}