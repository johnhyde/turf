import { createSignal, createEffect, createRoot, createResource, runWithOwner, mapArray, indexArray, on } from "solid-js";
import { unwrap } from "solid-js/store";
import { useState } from 'stores/state';
import { vec2, near, pixelsToTiles, swapAxes, truncateString, sleep, tintImage } from 'lib/utils';
import { isInTurf, getShadeWithForm, getWallVariationAtPos, getEffectsByHusk } from 'lib/turf';
import { extractSkyeSprites, extractSkyeTileSprites, extractPlayerSprites, spriteName, spriteNameWithDir } from 'lib/turf';
import { Player } from "./player";
import { Shade } from "./shade";
import { Preview } from "./preview";
import { Resizer } from "./resizer";

import voidUrl from 'assets/sprites/void.png';

let owner, setBounds, container;
let gritController = new AbortController();
var game, scene, cam, cursors, keys = {}, player, tiles, preview;
var formIndexMap, players = {}, shades = {};
const factor = 8;
const tileSize = 32;
const tileFactor = factor * tileSize;
window.factor = factor;
window.tileSize = tileSize;
window.tileFactor = tileFactor;

function addGritListener(eventName, handler) {
  window.addEventListener(eventName, handler, { signal: gritController.signal });
}

async function loadImage(id, url, ...args) {
  try {
    return await loadImageUnsafe(id, url, ...args);
  } catch (e) {
    console.log(`failed to load ${id}`, e);
    return loadImageUnsafe(id, voidUrl, ...args);
  }
}

async function loadImageUnsafe(id, url, config = {}) {
  // console.log("trying to load image: " + id)
  const changeColor = config.color !== undefined && game.renderer.type === Phaser.CANVAS;
  if (game.textures.exists(id)) {
    if (changeColor) {
      game.textures.removeKey(id);
    } else {
      return;
    }
  }
  return new Promise(async (resolve, reject) => {
    const onError = (key) => {
      console.error('could not load image', key);
      if (key === 'id') {;
        reject('could not load image: ' + key);
      }
    };
    game.textures.addListener(Phaser.Textures.Events.ADD_KEY+id, resolve);
    game.textures.addListener(Phaser.Textures.Events.ERROR, onError);
    try {
      // if (config.isWall) {
      //   const img = new Image();
      //   img.onload = () => game.textures.addSpriteSheet(id, img, {
      //     frameWidth: 32,
      //     frameHeight: 64,
      //     ...config,
      //   });
      //   img.onabort = () => onError(id);
      //   img.onerror = () => onError(id);
      //   img.src = url;
      // } else {
      if (!Array.isArray(url)) url = [url];
      let images = [], promises = [];
      images = await Promise.all(url.map((u) => {
        const img = new Image();
        return new Promise((resolve, reject) => {
          const onError = (e) => {
            console.error('could not load image: ' + u, e);
            reject(e);
          }
          img.onload = () => resolve(img);
          img.onerror = onError;
          img.onabort = onError;
          img.src = u;
        });
      }));
      if (changeColor) {
        images = await Promise.all(images.map(img => tintImage(img, config.color)));
        if (game.textures.exists(id)) {
          game.textures.removeKey(id);
        }
      }
      if (game.textures.exists(id)) {
        resolve();
        return;
      }
      const texture = game.textures.create(id, images, images[0].width, images[0].height);
      if (!texture) reject('could not create texture for: ' + url[0]);
      images.forEach((img, i) => {
        texture.add(i, i, 0, 0, img.width, img.height);
        if (i === 0) {
          texture.add('__BASE', i, 0, 0, img.width, img.height);
        }
      })
      if (images.length === 1) {
        const frame = texture.add(1, 0, 0, 0, images[0].width, images[0].height);
        frame.setTrim(frame.width, frame.height, 0, 1, frame.width, frame.height)
      }
      resolve();
      // }
    } catch (e) {
      if (!game.textures.exists(id)) reject(e);
    }
  });
}

let lastClickedShadeId = null;
function createShade(shade, id, turf) {
  let sprite = new Shade(scene, shade, turf, true);
  const { formId } = shade;
  if (!sprite) {
    console.error('Could not create shade', formId);
    return;
  }
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
  let textObj;
  function addText(text, limit = 21) {
    text = truncateString(text, limit);
    if (!textObj) {
      textObj = scene.make.text({ text, style: { fontSize: 8*factor + 'px', fontFamily: 'monospace', fontSmooth: 'never',
    '--webkit-font-smoothing': 'none' }});
      textObj.x = sprite.x;
      textObj.y = sprite.y;
      textObj.setDepth(sprite.depth);
      textObj.setDisplayOrigin(textObj.width/2 - sprite.width*factor/2 + sprite.offset.x*factor, sprite.offset.y*factor + textObj.height);
      scene.add.existing(textObj);
    } else {
      textObj.setText(text);
    }
  }

  function removeText() {
    if (textObj) {
      textObj.destroy();
      textObj = null;
    }
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
    console.log('got click on shade', id, formId);
    lastClickedShadeId = id;
    if (state.editor.editing) {
      if (state.editor.pointer) {
        state.selectShade(id);
      }
    } else {
      state.huskInteract(shade);
    }
  }
  sprite.on('pointermove', (pointer) => {
    if (state.e && shade) {
      const effects = getEffectsByHusk(state.e, shade).fullFx;
      if (effects.interact?.type === 'read') {
          addText(effects.interact.arg);
      } else if (effects.step?.type === 'port') {
        const portal = state.e.portals[effects.step.arg];
        if (portal) {
          addText(portal.for.ship);
        }
      }
    }
    if (pointer.isDown) {
      onTouch(pointer);
    }
  });
  sprite.on('pointerdown', (pointer) => {
    onTouch(pointer);
    onClick(pointer);
  });
  sprite.on('pointerout', (pointer) => {
    removeText();
  });
  return sprite;
}

function setGameSize() {
  // console.log('resized')
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
    const newZoom = (8/factor)*(window.devicePixelRatio/state.scale)/2;
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
        // type: Phaser.CANVAS,
        parent: container,
        width: ~~container.clientWidth || 500,
        height: ~~container.clientHeight || 500,
        pixelArt: true,
        roundPixels: true,
        backgroundColor: '#a6e4e8',
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
        window.scene = scene = this;
        window.cam = cam = scene.cameras.main;
        $loaded(true);
      }

      function preload() {
        console.log('preload');
        this.load.audio('ping', ['audio/ping.mp3']);
        // this.load.image('speech-bubble', 'sprites/speech-bubble.png');
      }

      let updateTime;
      function create() {
        updateTime = Date.now();
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
            mapEdit(pointer);
        });

        this.input.on('pointerup', (pointer) => {
          const pos = pixelsToTiles(vec2(pointer.worldX, pointer.worldY));
          if (![state.tabs.EDITOR, state.tabs.TOWN, state.tabs.PORTALS].includes(state.selectedTab)) {
            player?.moveTo?.(pos);
          }
          if (state.editor.huskToPlace) {
            if (typeof state.huskToPlace.shade === 'object') {
              const shade = state.huskToPlace.shade;
              if (state.huskToPlace.portal !== undefined) {
                state.createBridge({
                  ...shade,
                  pos,
                }, state.huskToPlace.portal);
              } else {
                state.addHusk(pos, shade.formId, shade.variation, shade.isLunk);
              }
            } else {
              state.moveShade(state.huskToPlace.shade, pos);
            }
            state.clearHuskToPlace();
          }
        });

        this.input.on('pointermove', (pointer) => {
          if (pointer.isDown) {
            mapEdit(pointer);
            const pastMoveThreshold = pointer.getDistance() > 20/window.devicePixelRatio;
            if (lastClickedShadeId !== null && pastMoveThreshold) {
              const pointerMode = state.editor.editing && state.editor.pointer;
              const clickedOnGate = lastClickedShadeId == state.e?.lunk?.shadeId;
              const shouldMoveGate = state.selectedTab === state.tabs.TOWN && clickedOnGate;
              if ((pointerMode || shouldMoveGate) && !state.huskToPlace) {
                state.setHuskToPlace(lastClickedShadeId);
              }
            }
            if (pastMoveThreshold) lastClickedShadeId = null;
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

        gritController.abort();
        gritController = new AbortController();

        addGritListener('pond-grit-ping-player', (e) => {
          if (e.grit.arg.ship === our) {
            if (!this.sound.locked && state.soundOn) ping.play();
            state.notify(e.grit.arg.by + ' has pinged you!');
          }
        });

        const themMoveQueuer = (e) => {
          const ship = e.grit.arg.ship;
          if (ship !== our && players[ship]) players[ship].actionQueue.push(e.grit);
        };
        addGritListener('pond-grit-move', themMoveQueuer);
        addGritListener('pond-grit-face', themMoveQueuer);

        const usMoveQueuer = (e) => {
          const ship = e.fakeGrit.arg.ship;
          if (ship === our && players[ship]) players[ship].actionQueue.push(e.fakeGrit);
        };
        addGritListener('pond-fakeGrit-move', usMoveQueuer);
        addGritListener('pond-fakeGrit-face', usMoveQueuer);

        function chat({ from, text }) {
          players[from]?.speakBubble?.(text); //do the visual speech bubble part
          if (state.soundOn) { //do the speech synthesis part
            var msg = new SpeechSynthesisUtterance();
            msg.text = text;
            window.speechSynthesis.speak(msg);
          }
        }
        addGritListener('pond-grit-chat', (e) => {
          if (e.grit.arg.from !== our) chat(e.grit.arg);
        });
        addGritListener('pond-fakeGrit-chat', (e) => {
          if (e.fakeGrit.arg.from === our) chat(e.fakeGrit.arg);
        });
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

      new ResizeObserver(setGameSize).observe(container);
      game.scale.addListener(Phaser.Scale.Events.ENTER_FULLSCREEN, setGameSize);
      game.scale.addListener(Phaser.Scale.Events.LEAVE_FULLSCREEN, () => setTimeout(setGameSize, 100));
      setGameSize();
      const [loader, { mutate, refetch }] = createResource(
        () => {
          if (!state.e) return {};
          return {
            ...extractPlayerSprites(state.e.players),
            ...extractSkyeSprites(state.e.skye),
            void: {
              sprite: voidUrl,
            },
            'speech-bubble': {
              sprite: 'sprites/speech-bubble.png',
            },
          };
        },
        async (sprites) => {
          try {
            const promise = loadSprites(sprites);
            await promise;
          } catch (e) {
            console.error('Error in loading sprites', e);
            throw e;
          }
        });
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
            initShades(state.e);
            initPlayers(state.e);
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
      createEffect(on(() => [loader.state, JSON.stringify(state.e?.cave)], () => {
        if (readyToRender()) {
          initShades(state.e);
        }
      }, { defer: true }));
      createEffect(on(() => [loader.state, JSON.stringify(Object.keys(state.e?.players || {}))], () => {
        if (readyToRender()) {
          initPlayers(state.e);
        }
      }, { defer: true }));
    });
  });

  async function loadSprites(sprites) {
    const promises = Object.entries(sprites).map(([id, { sprite, config }]) => {
      return loadImage(id, sprite, config);
    });
    return Promise.all(promises);
  }

  async function loadPlayerSprites(turf) {
    const sprites = extractPlayerSprites(turf.players);
    return loadSprites(sprites);
  }
  
  function destroyCurrentTurf() {
    window.player = player = null;
    window.players = players = {};
    shades = {};
    preview = null;
    // I think we don't need these, as of 09/12/23
    // TODO: Delete by Nov 2023 if not needed
    // (scene.add.displayList.list || []).forEach((e) => {
    //   if (e) e.destroy();
    // });
    // (scene.add.updateList.list || []).forEach((e) => {
    //   if (e) e.destroy();
    // });
    game.scene.start(scene);
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
    window.resizer = new Resizer(scene, turf.id);
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
          }
          const pos = vec2(shadeData.pos).scale(tileFactor);
          shadeObject.setPosition(pos.x, pos.y);
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
