import { createSignal, createEffect, createRoot, createResource, runWithOwner, mapArray, indexArray, on } from "solid-js";
import { unwrap } from "solid-js/store";
import { useState } from 'stores/state';
import { vec2, minV, flattenGrid, near, pixelsToTiles, dirs, swapAxes, getDirFromVec } from 'lib/utils';
import { isInTurf, getShadeWithForm, getWallVariationAtPos } from 'lib/turf';
import { extractSkyeSprites, extractSkyeTileSprites, extractPlayerSprites, spriteName, spriteNameWithDir } from 'lib/turf';
import { Player } from "./player";
import { Shade } from "./shade";
import { Preview } from "./preview";
import { Resizer } from "./resizer";

import voidUrl from 'assets/sprites/void.png';

let owner, setBounds, container;
let pinger;
var game, scene, cam, cursors, keys = {}, player, tiles, preview;
var formIndexMap, players = {}, shades = {};
const factor = 8;
const tileSize = 32;
const tileFactor = factor * tileSize;
window.factor = factor;
window.tileSize = tileSize;
window.tileFactor = tileFactor;

async function loadImage(id, url, isWall = false, config = {}) {
  // console.log("trying to load image: " + id)
  if (game.textures.exists(id)) return;
  return new Promise((resolve, reject) => {
    const onError = (key) => {
      console.error('could not load image', key);
      if (key === 'id') {;
        reject();
      }
    };
    // game.textures.addListener(Phaser.Textures.Events.ADD_KEY+id, (texture) => {
    //   // console.log('loaded image', id);
    //   resolve();
    // });
    game.textures.addListener(Phaser.Textures.Events.LOAD, (key, texture) => {
      if (id === key) {
        // console.log('loaded image', id, texture.source?.[0]?.image?.complete);
        if (texture.source?.[0]?.image && !texture.source[0].image.complete) {
          console.log('wtf', id);
          const oldOnLoad = texture.source[0].image.onload;
          texture.source[0].image.onload = () => {
            console.log('image finally loaded', id);
            resolve();
            oldOnLoad();
          }
        } else {
          // console.log('loaded!');
          resolve();
        }
      }
    });
    game.textures.addListener(Phaser.Textures.Events.ERROR, onError);
    try {
      if (isWall) {
        const img = new Image();
        img.onload = () => game.textures.addSpriteSheet(id, img, {
          frameWidth: 32,
          frameHeight: 64,
          ...config,
        });
        img.onabort = () => {
          console.log('aborted');
          onError(id);
        }
        img.onerror = () => onError(id);
        img.src = url;
        // game.textures.addImage(id, img);
      } else {
        game.textures.addBase64(id, url);
      }
    } catch (e) {
      if (!game.textures.exists(id)) reject(e);
    }
  });
}

function createShade(shade, id, turf) {
  let sprite = new Shade(scene, shade, turf, true);
  sprite.setInteractive({ pixelPerfect: true, alphaTolerance: 255 });
  if (shade.formId === '/portal') {
    const state = useState();
    createEffect(() => {
      shade = state.e?.cave?.[id];
      if (shade) {
        const step = shade.effects['step'];
        if (step?.type === 'port' &&
            step.arg !== undefined &&
            step.arg !== null &&
            state.e.portals[step.arg]?.at
        ) {
          sprite.setAlpha(1);
          sprite.setTint(0xffffff)
        } else {
          sprite.setAlpha(0.7);
          sprite.setTint(0xbbbbbb)
        }
      }
    })
  }

  // here "touch" means that the shade was touched by the cursor
  // as it passed through or clicked
  function onTouch(pointer) {
    console.log('got pointer down on shade', id, shade.formId);
    if (state.editor.editing) {
      if (state.editor.eraser) {
        const shade = getShadeWithForm(state.e, id);
        state.delShade(id);
        if (shade && shade.form.type === 'wall') {
          state.updateWallsAroundPos(shade.pos, false);
        }
        console.log('try to remove shade');
      } else if (state.editor.cycler) {
        state.cycleShade(id);
      }
    }
  }
  function onClick(pointer) {
    console.log('got click on shade', id, shade.formId);
    if (state.editor.editing) {
      if (!state.editor.selectedTool) {
        state.selectShade(id);
      }
    }
  }
  sprite.on('pointermove', (pointer) => {
    if (pointer.isDown) {
      onTouch(pointer);
    }
  });
  sprite.on('pointerdown', (pointer) => {
    onTouch(pointer);
    onClick(pointer);
  });
  return sprite;
}

function setGameSize() {
  console.log('resized')
  const el = game.scale.isFullscreen ? game.canvas.parentElement : container;
  const width = ~~(window.devicePixelRatio * el.clientWidth);
  const height = ~~(window.devicePixelRatio * el.clientHeight);
  if (!near(width, game.scale.width, 1) || !near(height, game.scale.height, 1)) {
    game.scale.resize(width, height);
    game.canvas.style.setProperty('width', '100%');
    game.canvas.style.setProperty('height', '100%');
  }
  if (cam) {
    const oldZoom = cam.zoom;
    const newZoom = 1/state.scale;
    if (oldZoom !== newZoom) {
      cam.setZoom(newZoom);
      if (setBounds) setBounds();
    }
  }
}

export function startPhaser(_owner, _container) {
  owner = _owner;
  container = _container;
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
        backgroundColor: '#a6e4e8',
        // zoom: 0.25,
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
        this.load.audio('ping', ['audio/ping.mp3']);
      }

      let updateTime;
      function create() {
        updateTime = Date.now();
        // cursors = this.input.keyboard.createCursorKeys();
        // keys = this.input.keyboard.addKeys({ w: 'W', a: 'A', s: 'S', d: 'D' });
        keys = {
          f: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes['F']),
        };
        const graphics = this.add.graphics();

        const color = 0xffff00;
        const thickness = 2;
        const alpha = 1;
        let draw = false;
        function mapEdit(pointer) {
          if (state.c.selectedForm || state.portalToPlace) {
            const pos = pixelsToTiles(vec2(pointer.worldX, pointer.worldY));
            // console.log(`pointer event - adding husk: ${pointer.worldX}x${pointer.worldY}`)
            if (state.portalToPlace) {
              state.createBridge({
                pos,
                formId: '/portal',
                variation: 0,
              }, state.portalToPlace);
              state.startPlacingPortal(null);
            } else if (state.c.selectedForm.type === 'wall') {
              const variation = getWallVariationAtPos(state.e, pos);
              const added = state.addHusk(pos, state.editor.selectedFormId, variation);
              if (added) state.updateWallsAroundPos(pos, true);
            } else {
              state.addHusk(pos, state.editor.selectedFormId);
            }
          }
        }
        this.input.on('pointerdown', (pointer) => {
            // draw = true;
            mapEdit(pointer);
        });

        this.input.on('pointerup', () => {
            // draw = false;
        });

        this.input.on('pointermove', (pointer) => {
          if (pointer.isDown) {
            mapEdit(pointer);
          }
          if (preview) {
            preview.updatePointer(pointer);
          }
        });

        this.input.on('wheel', (pointer) => {
          state.setScaleLog(state.scaleLog + pointer.deltaY/200);
        });
        const ping = this.sound.add('ping');
        this.sound.pauseOnBlur = false;
        if (pinger) window.removeEventListener('pond-ping-player', pinger);
        pinger = (e) => {
          if (e.grit.arg.ship === our) {
            if (!this.sound.locked) ping.play();
            state.notify(e.grit.arg.by + ' has pinged you!');
          }
        };
        window.addEventListener('pond-ping-player', pinger);
      }

      function update() {
        const now = Date.now();
        const dt = now - updateTime;
        updateTime = now;
        if (!cam.roundPixels) cam.setRoundPixels(true);
        // if (keys.f.isDown) {
        //   keys.f.reset();
        //   game.scale.startFullscreen();
        // }
        return true;
        // console.log('f key', keys.f)
      }

      console.log("loading the game engine");

      const state = useState();
      window.state = state;

      // window.addEventListener('resize', setGameSize, false);
      new ResizeObserver(setGameSize).observe(container);
      game.scale.addListener(Phaser.Scale.Events.ENTER_FULLSCREEN, setGameSize);
      game.scale.addListener(Phaser.Scale.Events.LEAVE_FULLSCREEN, () => setTimeout(setGameSize, 100));
      setGameSize();
      const [loader, { mutate, refetch }] = createResource(
        () => state.e,
        (turf) => loadSprites(turf));
      const readyToRender = () => !!(loader.state === 'ready' && state.e && state.player);
      createEffect(on(() => [
        loader.state,
        state.c.id,
        state.player,
        JSON.stringify(state.e?.size),
        JSON.stringify(state.e?.offset),
      ], (_, __, lastTurfId) => {
        if (loader.state === 'ready') {
          if (lastTurfId || state.e) destroyCurrentTurf();
          if (readyToRender()) {
            initTurf(state.e, state.p.grid, state.player);
            initPlayers(state.e);
            initShades(state.e);
            initShadePreview(state.e);
          }
          return state.c.id;
        };
      }));
      createEffect(on(() => JSON.stringify(state.p?.grid), (_, lastGrid) => {
        lastGrid = JSON.parse(lastGrid || '[]');
        // console.log('running tile effect');
        const turf = state.e;
        if (readyToRender()) {
          console.log('updating tiles');
          state.p.grid.map((col, i) => {
            col.map((space, j) => {
              const lastTileFormId = lastGrid[i] ? lastGrid[i][j]?.tile?.formId : undefined;
              if (space.tile && space.tile.formId !== lastTileFormId) {
                const pos = vec2(i, j);
                // console.log('updating tile ', pos);
                const gid = formIndexMap[spriteName(space.tile.formId, 0)];
                tiles.putTileAt(gid, pos.x, pos.y);
              }
            });
          });
        }
        return [];
      }, { defer: false }));
      createEffect(on(() => [loader.state, JSON.stringify(Object.keys(state.e?.players || {}))], () => {
        if (readyToRender()) {
          initPlayers(state.e);
        }
      }, { defer: true }));
      createEffect(on(() => [loader.state, JSON.stringify(state.e?.cave)], () => {
        if (readyToRender()) {
          initShades(state.e);
        }
      }, { defer: true }));
    });
  });

  async function loadSprites(turf) {
    console.log('loading sprites');
    // promises.push(loadImage('wall-stone', 'sprites/wall-stone.png', true));
    return Promise.all([loadSkyeSprites(turf), loadPlayerSprites(turf)]);
  }

  async function loadSkyeSprites(turf) {
    const sprites = extractSkyeSprites(turf.skye);
    const promises = Object.entries(sprites).map(([id, sprite]) => {
      return loadImage(id, sprite);
    });
    promises.push(loadImage('void', voidUrl));
    // promises.push(loadImage('wall-stone', 'sprites/wall-stone.png', true));
    return Promise.all(promises);
  }

  async function loadPlayerSprites(turf) {
    const sprites = extractPlayerSprites(turf.players);
    const promises = Object.entries(sprites).map(([id, sprite]) => {
      return loadImage(id, sprite);
    });
    return Promise.all(promises);
  }
  
  function destroyCurrentTurf() {
    window.player = player = null;
    window.players = players = {};
    shades = {};
    preview = null;
    (scene.add.displayList.list || []).map(e => e).forEach(e => e.destroy());
    (scene.add.updateList.list || []).map(e => e).forEach(e => e.destroy());
    game.scene.start(scene);
    // if (player) player.destroy();
  }
  window.destroyTurf = destroyCurrentTurf;
  async function initTurf(turf, grid, _player) {
    const bounds = {
      x: turf.offset.x * turf.tileSize.x * factor,
      y: turf.offset.y * turf.tileSize.y * factor,
      w: turf.size.x * turf.tileSize.x * factor,
      h: turf.size.y * turf.tileSize.y * factor,
    };
    setBounds = () => {
      // const width = ~~container.clientWidth;
      // const height = ~~container.clientHeight;
      // const width = ~~game.scale.width;
      // const height = ~~game.scale.height;
      const width = ~~cam.displayWidth;
      const height = ~~cam.displayHeight;
      // adjust the viewport bounds if level is smaller
      const buffer = {
        l: turf.tileSize.x * factor * 1,
        t: turf.tileSize.y * factor * 3,
        r: turf.tileSize.x * factor * 1,
        b: turf.tileSize.y * factor * 1,
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
    createEffect(() => {
      setGameSize();
    });
    // window.removeEventListener('resize', setBounds);
    // createEffect(on(() => state.scale, () => {
    //   setBounds();
    // }))
    // _setBounds();
    // setBounds = _setBounds;
    // window.addEventListener('resize', setBounds);
    console.log("init turf tile layer", turf);
    
    const [level, tilesetData] = generateMap(turf, grid);
    const map = scene.make.tilemap({ data: level, tileWidth: turf.tileSize.x, tileHeight: turf.tileSize.y });
    const tilesets = tilesetData.map((image, i) => {
      return map.addTilesetImage(image, undefined, undefined, undefined, undefined, undefined, i + 1);
    });
    const layer = map.createLayer(0, tilesets, bounds.x, bounds.y);
    layer.setDepth(turf.offset.y - 10);
    layer.setScale(factor);
    window.tiles = tiles = layer;
    // window.players = Object.entries(turf.players).map(([patp, p]) => {
    //   const thisPlayer = new Player(scene, turf.id, patp, loadPlayerSprites);
    //   if (patp === our) {
    //     window.player = player = thisPlayer;
    //   }
    //   return thisPlayer;
    // });
    window.resizer = new Resizer(scene, turf.id);
    // cam.startFollow(player);
    game.input.keyboard.preventDefault = false;
  }

  function initPlayers(turf) {
    console.log('init players');
    if (turf) {
      const ids = [...Object.keys(players), ...Object.keys(turf.players)];
      ids.forEach((id) => {
        const playerObject = players[id];
        const playerData = turf.players[id];
        if (!playerObject) {
          const thisPlayer = new Player(scene, turf.id, id, loadPlayerSprites);
          if (id === our) {
            window.player = player = thisPlayer;
          }
          players[id] = thisPlayer;
        } else if (!playerData) {
          players[id].destroy();
          delete players[id];
        } else {
          //  neat
        }
      });
      window.players = players;
    }
  }

  function initShades(turf) {
    console.log('init shades');
    if (turf) {
      const ids = [...Object.keys(shades), ...Object.keys(turf.cave)];
      ids.forEach((id) => {
        let sprite;
        const shadeObject = shades[id];
        const shadeData = turf.cave[id];
        if (!shadeObject) {
          if (isInTurf(turf, shadeData.pos)) {
            shades[id] = createShade(shadeData, id, turf);
          }
        } else if (!shadeData) {
          shades[id].destroy();
          delete shades[id];
        } else {
          if (shadeObject.texture.key !== (sprite = spriteName(shadeData.formId, shadeData.variation))) {
            shadeObject.setTexture(sprite);
            console.log('updated shade at', shadeData.pos)
          }
        }
      });
    }
  }

  function initShadePreview(turf) {
    preview = new Preview(scene, turf.id);
  }
}

const coreTiles = ['void'];

function generateMap(turf, grid) {
  formIndexMap = {};
  const tiles = Object.entries(extractSkyeTileSprites(turf.skye)).map(([id, _], i) => {
    formIndexMap[id] = i + coreTiles.length + 1;
    return id;
  });
  const data = swapAxes(grid).map((row) => row.map((space) => {
    if (!space.tile) return 1;
    const sprite = spriteName(space.tile.formId, space.tile.variation);
    if (!formIndexMap[sprite]) return 1;
    return formIndexMap[sprite];
  }));
  return [data, [...coreTiles, ...tiles]];
}
