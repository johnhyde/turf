import { createSignal, createEffect, createRoot, createResource, runWithOwner, mapArray, indexArray, on } from "solid-js";
import { unwrap } from "solid-js/store";
import { useState } from 'stores/state';
import { vec2, minV, flattenGrid, near, pixelsToTiles, dirs, swapAxes, getDirFromVec } from 'lib/utils';
import { isInTurf, getShadeWithForm, getWallVariationAtPos } from 'lib/turf';
import { extractSkyeSprites, extractPlayerSprites, spriteName, spriteNameWithDir } from 'lib/turf';
import { Player } from "./player";
import { Resizer } from "./resizer";

import voidUrl from 'assets/sprites/void.png';

let owner, setBounds, container;
var game, scene, cam, cursors, keys = {}, player, tiles;
var formIndexMap, shades = {};

async function loadImage(id, url, isWall = false, config = {}) {
  if (game.textures.exists(id)) return;
  return new Promise((resolve, reject) => {
    const onError = (key) => {
      console.error('could not load image', key);
      if (key === 'id') {;
        reject();
      }
    };
    // game.textures.addListener(Phaser.Textures.Events.ADD_KEY+id, resolve);
    game.textures.addListener(Phaser.Textures.Events.ADD_KEY+id, () => {
      // console.log('loaded image', id);
      resolve();
    });
    game.textures.addListener(Phaser.Textures.Events.ERROR, onError);
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
  });
}

function createShade(shade, id, turf) {
  const huskPos = vec2(shade.pos).scale(turf.tileSize.x);
  let sprite = scene.add.image(huskPos.x, huskPos.y, spriteName(shade.formId, shade.variation));
  let form = turf.skye[shade.formId];
  sprite.setDisplayOrigin(form.offset.x, form.offset.y);
  sprite.setDepth(shade.pos.y);
  sprite.setInteractive();
  function onClick(pointer) {
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
  sprite.on('pointermove', (pointer) => {
    if (pointer.isDown) {
      onClick(pointer);
    }
  });
  sprite.on('pointerdown', (pointer) => {
    onClick(pointer);
  });
  return sprite;
}

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
  if (setBounds) setBounds();
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
          if (state.c.selectedForm) {
            const pos = pixelsToTiles(vec2(pointer.worldX, pointer.worldY));
            // console.log(`pointer event - adding husk: ${pointer.worldX}x${pointer.worldY}`)
            if (state.c.selectedForm.type === 'wall') {
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
            // if (draw)
            // {
            //     graphics.clear();
            //     graphics.lineStyle(thickness, color, alpha);
            //     graphics.strokeRect(pointer.downX, pointer.downY, pointer.x - pointer.downX, pointer.y - pointer.downY);
            // }
        });

        this.input.on('wheel', (pointer) => {
          state.setScale(state.scale + pointer.deltaY/50);
        });
      }

      function update() {
        const now = Date.now();
        const dt = now - updateTime;
        updateTime = now;
        if (!cam.roundPixels) cam.setRoundPixels(true);
        // if (player) updatePlayer(dt);
        if (keys.f.isDown) {
          keys.f.reset();
          game.scale.startFullscreen();
        }
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
      createEffect(on(() => [
        loader.state,
        state.c.id,
        JSON.stringify(state.e?.size),
        JSON.stringify(state.e?.offset),
      ], (_, __, lastTurfId) => {
        if (loader.state === 'ready') {
          if (lastTurfId || state.e) destroyCurrentTurf();
          if (state.e) {
            initTurf(state.e, state.p.grid, state.player);
            initShades(state.e);
          }
          return state.c.id;
        };
      }));
      createEffect(on(() => JSON.stringify(state.p.grid), (_, lastGrid) => {
        lastGrid = JSON.parse(lastGrid || '[]');
        // console.log('running tile effect');
        const turf = state.e;
        if (turf && loader.state == 'ready') {
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
      createEffect(on(() => [loader.state, JSON.stringify(state.e?.cave)], () => {
        if (loader.state == 'ready') {
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
    (scene.add.displayList.list || []).map(e => e).forEach(e => e.destroy());
    (scene.add.updateList.list || []).map(e => e).forEach(e => e.destroy());
    game.scene.start(scene);
    // if (player) player.destroy();
    player = null;
    shades = {};
  }
  window.destroyTurf = destroyCurrentTurf;
  async function initTurf(turf, grid, _player) {
    const bounds = {
      x: turf.offset.x * turf.tileSize.x,
      y: turf.offset.y * turf.tileSize.y,
      w: turf.size.x * turf.tileSize.x,
      h: turf.size.y * turf.tileSize.y,
    };
    setBounds = () => {
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
    const tilesets = tilesetData.map((tileset, i) => {
      return map.addTilesetImage(tileset.image, undefined, undefined, undefined, undefined, undefined, i + 1);
    });
    const layer = map.createLayer(0, tilesets, bounds.x, bounds.y);
    layer.setDepth(turf.offset.y - 10);
    window.tiles = tiles = layer;
    window.player = player = new Player(scene, turf.id, our, loadPlayerSprites);
    window.resizer = new Resizer(scene, turf.id);
    // cam.startFollow(player);
  }

  function initShades(turf) {
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
}

const coreTiles = [
  {
    id: 0,
    image: 'void',
  }
];

function generateMap(turf, grid) {
  formIndexMap = {};
  const tiles = Object.entries(extractSkyeSprites(turf.skye)).map(([id, _], i) => {
    formIndexMap[id] = i + coreTiles.length + 1;
    return {
      id: i,
      image: id,
    };
  });
  const data = swapAxes(grid).map((row) => row.map((space) => {
    if (!space.tile) return 1;
    const sprite = spriteName(space.tile.formId, space.tile.variation);
    if (!formIndexMap[sprite]) return 1;
    return formIndexMap[sprite];
  }));
  return [data, [...coreTiles, ...tiles]];
}
