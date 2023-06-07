import { createSignal, createEffect, createRoot, createResource, runWithOwner, mapArray, indexArray, on } from "solid-js";
import { unwrap } from "solid-js/store";
import { useState } from 'stores/state';
import { vec2, minV, flattenGrid, near, pixelsToTiles } from 'lib/utils';
import { extractSkyeSprites, extractPlayerSprites, spriteName, extractShades } from 'lib/pond';

import voidUrl from 'assets/sprites/void.png';
import treeUrl from 'assets/sprites/tree.png';
import { swapAxes } from "../lib/utils";

let owner;
var game, scene, cam, cursors, keys = {}, player, tiles;
var formIndexMap, shades = {};

async function loadImage(id, url) {
  if (game.textures.exists(id)) return;
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
  });
}

function createShade(shade, id, turf) {
  const huskPos = vec2(shade.pos).scale(turf.tileSize.x);
  let sprite = scene.add.image(huskPos.x, huskPos.y, spriteName(shade.formId, 0, 'back'));
  let form = turf.skye[shade.formId];
  sprite.setDisplayOrigin(form.offset.x, form.offset.y);
  sprite.setInteractive();
  sprite.on('pointerdown', () => {
    if (state.editor.editing && state.editor.eraser) {
      state.delShade(id);
      console.log('try to remove shade');
    }
  });
  return sprite;
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

      let updateTime;
      function create() {
        updateTime = Date.now();
        cursors = this.input.keyboard.createCursorKeys();
        keys = this.input.keyboard.addKeys({ w: 'W', a: 'A', s: 'S', d: 'D' });
        keys.f = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes['F']);
        const graphics = this.add.graphics();

        const color = 0xffff00;
        const thickness = 2;
        const alpha = 1;
        let draw = false;
        function mapEdit(pointer) {
          if (state.c.selectedForm) {
            const pos = pixelsToTiles(vec2(pointer.worldX, pointer.worldY));
            // console.log(`pointer event - adding husk: ${pointer.worldX}x${pointer.worldY}`)
            state.addHusk(pos, state.editor.selectedFormId);
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
      }

      function update() {
        const now = Date.now();
        const dt = now - updateTime;
        updateTime = now;
        if (!cam.roundPixels) cam.setRoundPixels(true);
        if (player) updatePlayer(dt);
        if (keys.f.isDown) {
          keys.f.reset();
          game.scale.startFullscreen();
        }
        // console.log('f key', keys.f)
      }
      function updatePlayer(dt) {
        const speed = 170;
        let targetPos = vec2(player.tilePos).scale(32);
        let pos = vec2(player.x, player.y);
        if (!pos.equals(targetPos)) {
          const dif = vec2(targetPos).subtract(pos);
          const step = speed * dt / 1000;
          if (step > dif.length()) {
            player.setPosition(targetPos.x, targetPos.y);
          } else {
            const change = vec2(dif).normalize().scale(step);
            player.x += change.x;
            player.y += change.y;
          }
        }
        const oldTilePos = vec2(player.tilePos);
        const newTilePos = vec2(player.tilePos);
        targetPos = vec2(player.tilePos).scale(32);
        pos = vec2(player.x, player.y);
        if (pos.equals(targetPos)) {
          if (cursors.left.isDown || keys.a.isDown) {
            newTilePos.x--;
          }
          if (cursors.right.isDown || keys.d.isDown) {
            newTilePos.x++;
          }
          if (cursors.up.isDown || keys.w.isDown) {
            newTilePos.y--;
          }
          if (cursors.down.isDown || keys.s.isDown) {
            newTilePos.y++;
          }
          const tilePosChanged = !newTilePos.equals(oldTilePos);
          if (tilePosChanged) {
            console.log('changed!');
            state.setPos(newTilePos);
          }
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
        () => state.e,
        (turf) => loadSprites(turf));
      createEffect(() => {
        let pos = state.player?.pos;
        if (pos) {
          // make sure to use x and y so solid knows to track them
          // we aren't tracking player, so that's no help
          let posV = vec2(pos.x, pos.y)
          if (player) {
            player.tilePos = posV;
          }
        }
      });
      createEffect(on(() => [
        loader.state,
        state.c.id,
        state.e?.size,
        state.e?.offset,
      ], (_, __, lastTurfId) => {
        if (loader.state === 'ready') {
          if (lastTurfId || state.e) destroyCurrentTurf();
          if (state.e) {
            initTurf(state.e, state.player);
          }
          return state.c.id;
        };
      }));
      createEffect(on(() => JSON.stringify(state.e?.spaces), (_, lastSpaces) => {
        lastSpaces = JSON.parse(lastSpaces || '[]');
        // console.log('running tile effect');
        const turf = state.e;
        if (turf && loader.state == 'ready') {
          state.e.spaces.map((col, i) => {
            col.map((space, j) => {
              const lastTileFormId = lastSpaces[i] ? lastSpaces[i][j]?.tile?.formId : undefined;
              if (space.tile && space.tile.formId !== lastTileFormId) {
                const pos = vec2(i, j);
                // console.log('updating tile ', pos);
                const gid = formIndexMap[spriteName(space.tile.formId, 0, 'back')];
                tiles.putTileAt(gid, pos.x, pos.y);
              }
            });
          });
        }
        return [];
      }, { defer: false }));
      createEffect(on(() => JSON.stringify(state.e?.cave), () => {
        if (state.e && loader.state == 'ready') {
          const ids = [...Object.keys(shades), ...Object.keys(state.e.cave)];
          ids.forEach((id) => {
            let sprite;
            const shadeObject = shades[id];
            const shadeData = state.e.cave[id];
            if (!shadeObject) {
              shades[id] = createShade(shadeData, id, state.e);
            } else if (!shadeData) {
              shades[id].destroy();
              delete shades[id];
            } else if (shadeObject.texture.key !== (sprite = spriteName(shadeData.formId, 0, 'back'))) {
              debugger;
              shadeObject.setTexture(sprite);
              console.log('updated shade at', shadeData.pos)
            }
          });
        }
        // return JSON.stringify(state.e.cave);
      }, { defer: false }));
    });
  });

  async function loadSprites(turf) {
    console.log('loading sprites');
    const sprites = {
      ...extractSkyeSprites(turf.skye),
      ...extractPlayerSprites(turf.players),
    };
    const promises = Object.entries(sprites).map(([id, sprite]) => {
      return loadImage(id, sprite);
    });
    promises.push(loadImage('void', voidUrl));
    return Promise.all(promises);
  }
  
  function destroyCurrentTurf() {
    game.scene.start(scene);
    player = null;
    shades = {};
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

    Object.entries(turf.cave).forEach(([id, shade]) => {
      shades[id] = createShade(shade, id, turf);
    });

    const garb = _player.avatar.things[0];
    const playerPos = vec2(_player.pos).scale(32);
    player = scene.physics.add.image(playerPos.x, playerPos.y, spriteName(garb.formId, 0, 'back', our));
    // player.setDisplayOrigin((player.width - 32)/2, player.height - 32);
    player.setOrigin(0, 0.6);
    player.tilePos = vec2(_player.pos);
    player.oldTilePos = vec2(_player.pos);
    cam.startFollow(player);
    window.player = player;
  }
}

const coreTiles = [
  {
    id: 0,
    image: 'void',
  }
];

function generateMap(turf) {
  formIndexMap = {};
  const tiles = Object.entries(extractSkyeSprites(turf.skye)).map(([id, _], i) => {
    formIndexMap[id] = i + coreTiles.length + 1;
    return {
      id: i,
      image: id,
    };
  });
  const data = swapAxes(turf.spaces).map((row) => row.map((space) => {
    if (!space.tile) return 1;
    const sprite = spriteName(space.tile.formId, space.tile.variation, 'back');
    if (!formIndexMap[sprite]) return 1;
    return formIndexMap[sprite];
  }));
  return [data, [...coreTiles, ...tiles]];
}
