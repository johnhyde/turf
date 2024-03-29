import { createSignal, createEffect, createRoot, createResource, runWithOwner, mapArray, indexArray, on } from "solid-js";
import { unwrap } from "solid-js/store";
import uniq from 'lodash/uniq';
import { useState } from 'stores/state';
import { vec2, near, vecToStr, pixelsToTiles, swapAxes, truncateString, sleep, jClone, tintImage } from 'lib/utils';
import { isInTurf, getShadeWithForm, getSpace, getWallVariationAtPos, getEffectsByHusk } from 'lib/turf';
import { extractSkyeSprites, extractSkyeTileSprites, extractPlayerSprites, spriteName, spriteNameWithDir } from 'lib/turf';
import { Player } from './player';
import { Shade } from './shade';
import { Preview } from './preview';
import { Resizer } from './resizer';
import { TileIndicator } from './tileIndicator';

import voidUrl from 'assets/sprites/void.png';

let owner, setBounds, container;
let gritController = new AbortController();
var game, scene, cam, cursors, keys = {}, player, earth, flats, stand, preview;
var formIndexMap, players = {}, tiles = {}, shades = {};
window.tiles = tiles;
window.shades = shades;
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
  if (!Array.isArray(url)) url = [url];
  // console.log("trying to load image: " + id)
  const changeColor = config.color !== undefined && game.renderer.type === Phaser.CANVAS;
  if (game.textures.exists(id)) {
    const oldUrls = game.textures.get(id).source.map(s => s.source.src).join(', ');
    const newUrls = url.map(u => new URL(u, window.location).href).join(', ');
    const urlChanged = oldUrls !== newUrls;
    if (urlChanged || changeColor) {
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
      let images = [];
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
      const maxDims = vec2();
      images.forEach((img) => {
        maxDims.x = Math.max(maxDims.x, img.width);
        maxDims.y = Math.max(maxDims.y, img.height);
      });
      const texture = game.textures.create(id, images, maxDims.x, maxDims.y);
      if (!texture) reject('could not create texture for: ' + url[0]);
      images.forEach((img, i) => {
        texture.add(i, i, 0, 0, maxDims.x, maxDims.y);
        if (i === 0) {
          texture.add('__BASE', i, 0, 0, maxDims.x, maxDims.y);
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
  const isShade = typeof id === 'number';
  const siblings = getSpace(turf, shade.pos)?.shades || []; // tile depth mod = 0
  const i = Math.min(siblings.length - 1, siblings.findIndex(s => Number(s) === Number(id)));
  const index = siblings.length - i - 1; // reverse since bottom/first is most recent
  const indexDepthMod = isShade ? index/1000 : 0;
  let sprite = new Shade(scene, shade, turf, indexDepthMod);
  const { formId } = shade;
  if (!sprite.active) {
    console.error('Could not create shade', formId);
    return;
  }
  if (isShade) {
    createEffect(() => {
      shade = state.e?.cave?.[id];
      if (shade) {
        const form = state.e.skye[shade.formId];
        let variation = form?.variations?.[shade.variation];
        sprite.depthMod = 0;
        if (variation?.deep == 'flat') {
          flats.add(sprite);
          sprite.updateDepth();
          flats.sort('depth');
        } else {
          stand.add(sprite);
          if (variation?.deep == 'fore') {
            sprite.depthMod += 0.6;
          }
          sprite.updateDepth();
          stand.sort('depth');
        }
      }
    });
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
  } else {
    sprite.setInteractive();
    earth.add(sprite);
    earth.sort('depth');
  }
  let textObj;
  function addText(text, limit = 21) {
    text = truncateString(text, limit);
    if (!textObj) {
      textObj = scene.make.text({ text, style: { fontSize: 8*factor + 'px', fontFamily: 'monospace', fontSmooth: 'never',
    '--webkit-font-smoothing': 'none' }});
      textObj.x = sprite.x;
      textObj.y = sprite.y;
      // textObj.setDepth(sprite.depth);
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
      if (state.editor.eraser && isShade) {
        const shade = getShadeWithForm(state.e, id);
        state.delShade(id);
        if (shade && shade.form.type === 'wall') {
          state.updateWallsAroundPos(shade.pos, false, [id]);
        }
        console.log('try to remove shade');
      } else if (state.editor.cycler) {
        if (isShade) {
          state.cycleShade(id);
        } else {
          state.cycleTile(shade.pos);
        }
      }
    }
  }
  function onClick(pointer) {
    if (isShade) {
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
      game.loaded = loaded;

      function init() {
        window.scene = scene = this;
        window.cam = cam = scene.cameras.main;
        $loaded(true);
      }

      function preload() {
        console.log('preload');
        this.load.audio('ping', ['audio/ping.mp3']);
        this.load.audio('ring', ['audio/ring.mp3']);
        this.load.audio('join', ['audio/join.mp3']);
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
              const variation = getWallVariationAtPos(state.e, pos, 0, 15, state.editor.selectedFormId);
              const added = state.addHusk(pos, state.editor.selectedFormId, variation);
              if (added) state.updateWallsAroundPos(pos, false);
            } else {
              state.addHusk(pos, state.editor.selectedFormId);
            }
          }
        }
        this.input.on('pointerdown', (pointer) => {
            mapEdit(pointer);
        });

        this.input.on('pointerup', (pointer, gameObjects) => {
          const pos = pixelsToTiles(vec2(pointer.worldX, pointer.worldY));
          if (![state.tabs.EDITOR, state.tabs.TOWN, state.tabs.PORTALS].includes(state.selectedTab)) {
            if (!(gameObjects[0] instanceof Player)) {
              player?.moveTo?.(pos);
            }
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
              const oldPos = state.e?.cave?.[state.huskToPlace.shade]?.pos;
              state.moveShade(state.huskToPlace.shade, pos);
              if (oldPos) state.updateWallsAroundPos(vec2(oldPos));
              state.updateWallsAroundPos(pos, true);
            }
            state.clearHuskToPlace();
          } else {
            if (state.editor.editing && state.editor.pointer) {
              const tile = tiles[vecToStr(pos)];
              if (gameObjects.filter(o => o !== tile).length === 0) {
                if (isInTurf(state.e, pos)) {
                  state.selectTile(pos);
                } else {
                  state.deselectHusk();
                }
              }
            }
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
        addGritListener('pond-grit-tele', themMoveQueuer);
        addGritListener('pond-grit-face', themMoveQueuer);

        const usMoveQueuer = (e) => {
          const ship = e.fakeGrit.arg.ship;
          if (ship === our && players[ship]) players[ship].actionQueue.push(e.fakeGrit);
        };
        addGritListener('pond-fakeGrit-move', usMoveQueuer);
        addGritListener('pond-fakeGrit-tele', usMoveQueuer);
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
      state.setGameLoaded();

      new ResizeObserver(setGameSize).observe(container);
      game.scale.addListener(Phaser.Scale.Events.ENTER_FULLSCREEN, setGameSize);
      game.scale.addListener(Phaser.Scale.Events.LEAVE_FULLSCREEN, () => setTimeout(setGameSize, 100));
      setGameSize();
      const [loader, { mutate, refetch }] = createResource(
        () => {
          if (!state.e) return {};
          return {
            // ...extractPlayerSprites(state.e.id, state.e.players),
            ...extractSkyeSprites(state.e.id, state.e.skye),
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
      const gameInited = () => readyToRender() && !!earth;
      createEffect(on(() => [
        loader.state,
        state.c.id,
        state.player,
        JSON.stringify(state.e?.size),
        JSON.stringify(state.e?.offset),
      ], (_, __, lastTurfId) => {
        destroyCurrentTurf();
        if (loader.state === 'ready') {
          if (readyToRender()) {
            initTurf(state.e, state.player);
            initTiles(state.e);
            initShades(state.e);
            initPlayers(state.e);
            initShadePreview(state.e);
          }
          return state.c.id;
        };
      }));
      createEffect(on(() => [loader.state, JSON.stringify(state.e?.spaces)], () => {
        if (gameInited()) {
          initTiles(state.e);
        }
      }, { defer: true }));
      createEffect(on(() => [loader.state, JSON.stringify(state.e?.cave)], () => {
        if (gameInited()) {
          initShades(state.e);
        }
      }, { defer: true }));
      createEffect(on(() => [loader.state, JSON.stringify(Object.keys(state.e?.players || {}))], () => {
        if (gameInited()) {
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
    const sprites = extractPlayerSprites(turf.id, turf.players);
    return loadSprites(sprites);
  }
  
  function destroyCurrentTurf() {
    window.player = player = null;
    window.players = players = {};
    window.tiles = tiles = {};
    window.shades = shades = {};
    earth = flats = stand = null;
    preview = null;
    game.scene.start(scene);
  }
  window.destroyTurf = destroyCurrentTurf;
  async function initTurf(turf, _player) {
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
        l: turf.tileSize.x * factor * 4,
        t: turf.tileSize.y * factor * 3,
        r: turf.tileSize.x * factor * 4,
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
    
    window.earth = earth = scene.add.container();
    window.flats = flats = scene.add.container();
    window.stand = stand = scene.add.container();
    window.resizer = new Resizer(scene, turf.id);
    window.tileIndicator = new TileIndicator(scene, turf.id);
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
          stand.add(thisPlayer);
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

  function initTiles(turf) {
    console.log('init tiles');
    if (turf) {
      const spaces = jClone(turf.spaces);
      const poses = uniq([...Object.keys(tiles), ...Object.keys(spaces)]);
      poses.forEach((posId) => {
        const pos = vec2(...posId.split(',').map(Number));
        let sprite;
        const tileObject = tiles[posId];
        const tileData = spaces[posId]?.tile;
        if (tileData) tileData.pos = pos;
        if (tileData && tileObject) {
          if (tileObject.shade.formId !== tileData.formId) {
            tiles[posId].destroy();
            tiles[posId] = createShade(tileData, pos, turf);
          } else if (tileObject.shade.variation !== tileData.variation) {
            tileObject.updateVariation(tileData.variation);
          }
          const gamePos = vec2(tileData.pos).scale(tileFactor);
          tiles[posId].setPosition(gamePos.x, gamePos.y);
        } else if (!tileData || !isInTurf(turf, tileData.pos)) {
          if (tiles[posId]) {
            tiles[posId].destroy();
            delete tiles[posId];
          }
        } else {
          tiles[posId] = createShade(tileData, pos, turf);
        }
      });
    }
    earth.sort('depth');
  }

  function initShades(turf) {
    console.log('init shades');
    if (turf) {
      const ids = uniq([...Object.keys(shades), ...Object.keys(turf.cave)]).map(Number);
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
          if (shadeObject.shade.variation !== shadeData.variation) {
            shadeObject.updateVariation(shadeData.variation);
          }
          const pos = vec2(shadeData.pos).scale(tileFactor);
          shadeObject.setPosition(pos.x, pos.y);
        }
      });
    }
    flats.sort('depth');
    stand.sort('depth');
  }

  function initShadePreview(turf) {
    preview = new Preview(scene, turf.id);
  }
}
