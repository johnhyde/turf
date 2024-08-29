import {
  createEffect,
  createMemo,
  createResource,
  createRoot,
  createSignal,
  getOwner,
  indexArray,
  mapArray,
  on,
  onCleanup,
  runWithOwner,
} from 'solid-js';
import { unwrap } from 'solid-js/store';
import uniq from 'lodash/uniq';
import { useState } from 'stores/state.jsx';
import {
  equalsV,
  jClone,
  near,
  pixelsToTiles,
  sleep,
  swapAxes,
  tintImage,
  truncateString,
  turfIdToName,
  vec2,
  vecToStr,
} from 'lib/utils.js';
import {
  getIndexDepthMod,
  getShadeWithForm,
  getSpace,
  getWallVariationAtPos,
  isInTurf,
} from 'lib/turf.js';
import { extractPlayerSprites, extractSkyeSprites } from 'lib/turf.js';
import { getEffectsByShadeId, newFxRootCondition, trig } from 'lib/effects.js';
import { Player } from './player.js';
import { Shade } from './shade.js';
import { Preview } from './preview.js';
import { Resizer } from './resizer.js';
import { ButtonHint } from './buttonHint.js';
import { TileIndicators } from './tileIndicators.js';

import voidUrl from 'assets/sprites/void.png';

let owner, setBounds, container;
let gritController = new AbortController();
var game, scene, cam, cursors, keys = {}, player, earth, flats, stand, preview;
var shadeSelectCallback = null, posSelectCallback = null, posSelected = null;
var players = {}, shades = {};
window.frameCount = 0;
window.standNeedsSort = false;
window.shades = shades;

function addGritListener(eventName, handler) {
  window.addEventListener(eventName, handler, {
    signal: gritController.signal,
  });
}

async function loadImage(id, url, ...args) {
  try {
    return await loadImageUnsafe(id, url, ...args);
  } catch (e) {
    console.log(`failed to load ${id}`, e);
    return loadImageUnsafe(id, voidUrl, ...args);
  }
}

function loadImageUnsafe(id, url, config = {}) {
  if (!Array.isArray(url)) url = [url];
  // console.log('trying to load image: ' + id);
  const changeColor = config.color != null &&
    game.renderer.type === Phaser.CANVAS;
  let urlChanged = false;
  if (game.textures.exists(id)) {
    const oldUrls = game.textures.get(id).source.map((s) => s.source.src).join(
      ', ',
    );
    const newUrls = url.map((u) => new URL(u, window.location).href).join(', ');
    urlChanged = oldUrls !== newUrls;
    if (!urlChanged && !changeColor) {
      return;
    }
  }
  return new Promise((resolve, reject) => {
    const onError = (key) => {
      console.error('could not load image', key);
      if (key === id) {
        reject('could not load image: ' + key);
      }
    };
    game.textures.addListener(Phaser.Textures.Events.ADD_KEY + id, resolve);
    game.textures.addListener(Phaser.Textures.Events.ERROR, onError);
    (async () => {
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
          };
          img.onload = () => resolve(img);
          img.onerror = onError;
          img.onabort = onError;
          img.src = u;
        });
      }));
      if (changeColor) {
        images = await Promise.all(
          images.map((img) => tintImage(img, config.color)),
        );
        // console.log('finished tinting images');
        // if (game.textures.exists(id)) {
        //   game.textures.removeKey(id);
        // }
      }
      if (game.textures.exists(id)) {
        if (urlChanged || changeColor) {
          game.textures.removeKey(id);
        } else {
          resolve();
          return;
        }
      }
      const maxDims = vec2();
      images.forEach((img) => {
        maxDims.x = Math.max(maxDims.x, img.width);
        maxDims.y = Math.max(maxDims.y, img.height);
      });
      const texture = game.textures.create(id, images, maxDims.x, maxDims.y);
      if (!texture) reject('could not create texture for: ' + url[0]);
      images.forEach((_img, i) => {
        texture.add(i, i, 0, 0, maxDims.x, maxDims.y);
        if (i === 0) {
          texture.add('__BASE', i, 0, 0, maxDims.x, maxDims.y);
        }
      });
      if (images.length === 1) {
        const frame = texture.add(
          1,
          0,
          0,
          0,
          images[0].width,
          images[0].height,
        );
        frame.setTrim(
          frame.width,
          frame.height,
          0,
          1,
          frame.width,
          frame.height,
        );
      }
      resolve();
    })().catch((e) => {
      if (!game.textures.exists(id)) reject(e);
      console.error(e);
    });
  });
}

let lastClickedShadeId = null;
function createShade(shade, id, turf) {
  const isTile = state.e?.skye?.[shade.formId]?.type === 'tile';
  const sprite = new Shade(
    scene,
    shade,
    id,
    turf,
    getIndexDepthMod(turf, id, shade.pos),
  );
  sprite.id = id;
  sprite.isTile = isTile;
  const { formId } = shade;
  if (!sprite.active) {
    console.error('Could not create shade', formId);
    return;
  }
  if (isTile) {
    sprite.setInteractive();
  } else {
    sprite.setInteractive({ pixelPerfect: true, alphaTolerance: 255 });
  }
  sprite.dispose = createRoot((dispose) => {
    onCleanup(() => {
      // console.log('cleaning up scope for', id);
    });
    const state = useState();
    const shade = createMemo(() => state.e?.cave[id]);
    createEffect(() => {
      if (!shade()) {
        dispose();
        removeText();
      }
    });
    const shadeEffect = (fn) => {
      createEffect((...args) => {
        if (!shade()) return;
        return fn(...args);
      });
    };
    sprite.addListener('destroy', dispose);
    shadeEffect(() => {
      const form = state.e.skye[shade().formId];
      const variation = form?.variations?.[shade().variation];
      sprite.depthMod = 0;
      sprite.indexDepthMod = getIndexDepthMod(turf, id, shade().pos);
      if (form?.type === 'tile') {
        earth.add(sprite);
        earth.sort('depth');
      } else if (variation?.deep == 'flat') {
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
    });
    shadeEffect(() => {
      if (['/portal', '/portal/house', '/gate'].includes(shade().formId)) {
        const stepEffects = getEffectsByShadeId(
          state.e,
          id,
          trig('move', state.player.pos, shade().pos),
        );
        const interactEffects = getEffectsByShadeId(
          state.e,
          id,
          trig('interact'),
        );
        const port = [...stepEffects, ...interactEffects].find((e) =>
          e.type === 'port'
        );
        if (
          (shade().formId === '/gate' && !port) || (
            port &&
            port.arg != null &&
            state.e.portals[port.arg]?.at != null
          )
        ) {
          sprite.setAlpha(1);
          sprite.setTint(0xffffff);
        } else {
          sprite.setAlpha(0.7);
          sprite.setTint(0xbbbbbb);
        }
      }
    });
    shadeEffect(() => {
      const clickEffects = getEffectsByShadeId(state.e, id, trig('click'));
      if (clickEffects.length) {
        sprite.input.cursor = 'pointer';
      } else {
        sprite.input.cursor = 'auto';
      }
    });
    shadeEffect(() => {
      const red = 0xff0000;
      if (state.editor.selectedShadeId === id) {
        sprite.setSelected(red);
      } else if (state.editor.selectedShadeIds[id]) {
        const colors = state.editor.selectedShadeColors[id] || [];
        const color = colors.length ? colors[colors.length - 1] : red;
        sprite.setSelected(color);
      } else {
        sprite.setSelected();
      }
    });
    return dispose;
  });
  let textObj;
  function addText(text, limit = 21) {
    text = truncateString(text, limit);
    if (!textObj) {
      textObj = scene.make.text({
        text,
        style: {
          fontSize: 8 * factor + 'px',
          fontFamily: 'monospace',
          fontSmooth: 'never',
          '--webkit-font-smoothing': 'none',
          strokeThickness: 1.5 * factor,
          stroke: '#000',
        },
      });
      textObj.x = sprite.x;
      textObj.y = sprite.y;
      // textObj.setDepth(sprite.depth);
      textObj.setDisplayOrigin(
        textObj.width / 2 - sprite.width * factor / 2 +
          sprite.offset.x * factor,
        sprite.offset.y * factor + textObj.height,
      );
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
  function onTouch(pointer, event) {
    console.log('got pointer down on shade', id, shade.formId);
    if (state.editor.editing) {
      const shade = getShadeWithForm(state.e, id);
      if (state.editor.eraser) {
        if (shade.form.type !== 'tile') {
          state.delShade(id);
          event.stopPropagation();
        }
        if (
          shade && shade.form.type === 'wall' && state.editor.autoOrientWalls
        ) {
          state.updateWallsAroundPos(shade.pos, false, [id]);
        }
        console.log('try to remove shade');
      } else if (state.editor.dropper) {
        state.selectForm(shade.formId, shade.variation);
        event.stopPropagation();
      }
    }
  }
  function onClick(pointer, event) {
    console.log('got click on shade', id, formId);
    lastClickedShadeId = id;
    if (
      shadeSelectCallback &&
      (state.editor.editing || state.selectedTab === state.tabs.PORTALS)
    ) {
      shadeSelectCallback(id);
      shadeSelectCallback = null;
      event.stopPropagation();
    } else if (state.editor.editing) {
      if (state.editor.pointer && !posSelectCallback) {
        state.selectShade(id);
        event.stopPropagation();
      }
    } else {
      state.shadeClick(id);
    }
  }
  sprite.on('pointermove', (pointer) => {
    if (pointer.isDown) {
      onTouch(pointer, event);
    }
  });
  sprite.on('pointerdown', (pointer, _x, _y, event) => {
    onTouch(pointer, event);
    onClick(pointer, event);
  });
  sprite.on('pointerover', (pointer) => {
    if (state.e && shade) {
      const clickEffects = getEffectsByShadeId(state.e, id, trig('click'));
      const readEffect = clickEffects.find((e) => e.type === 'read');
      const stepEffects = getEffectsByShadeId(
        state.e,
        id,
        trig('step', state.e, id),
      );
      const portEffect = stepEffects.find((e) => e.type === 'port');

      if (portEffect) {
        const portal = state.e.portals[portEffect.arg];
        if (portal) {
          addText(turfIdToName(portal.for));
        }
      } else if (readEffect) {
        addText(readEffect.arg.text);
      }

      if (clickEffects.length) {
        sprite.setGlowActive(true);
      }
    }
  });
  sprite.on('pointerout', (pointer) => {
    removeText();
    sprite.setGlowActive(false);
  });
  return sprite;
}

function setGameSize() {
  // console.log('resized')
  const el = game.scale.isFullscreen ? game.canvas.parentElement : container;
  const width = ~~(window.devicePixelRatio * el.clientWidth);
  const height = ~~(window.devicePixelRatio * el.clientHeight);
  if (
    !near(width, game.scale.width, 1) || !near(height, game.scale.height, 1)
  ) {
    game.scale.resize(width, height);
    game.canvas.style.setProperty('width', '100%');
    game.canvas.style.setProperty('height', '100%');
  }
  if (cam) {
    const oldZoom = cam.zoom;
    const newZoom = (8 / factor) * (window.devicePixelRatio / state.scale) / 2;
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
        // backgroundColor: '#a6e4e8',
        // backgroundColor: 'transparent',
        transparent: true,
        scene: {
          init,
          preload: preload,
          create: create,
          update: update,
        },
        physics: {
          default: 'arcade',
          arcade: {},
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
        function mapEdit(pos) {
          if (state.editor.editing && state.c.selectedForm) {
            if (state.c.selectedForm.type === 'wall') {
              const variation = !state.editor.autoOrientWalls
                ? state.editor.selectedVariation
                : getWallVariationAtPos(
                  state.e,
                  pos,
                  0,
                  15,
                  state.editor.selectedFormId,
                );
              const added = state.addShade(
                pos,
                state.editor.selectedFormId,
                variation,
              );
              if (added && state.editor.autoOrientWalls) {
                state.updateWallsAroundPos(pos, false);
              }
            } else {
              state.addShade(
                pos,
                state.editor.selectedFormId,
                state.editor.selectedVariation,
              );
            }
          }
        }
        this.input.on('pointerdown', (pointer, gameObjects) => {
          const pos = pixelsToTiles(vec2(pointer.worldX, pointer.worldY));
          mapEdit(pos);
          if (
            ![state.tabs.EDITOR, state.tabs.TOWN, state.tabs.PORTALS].includes(
              state.selectedTab,
            )
          ) {
            const clickConsumed = gameObjects.some((obj) => {
              if (obj instanceof Player) return true;
              return getEffectsByShadeId(state.e, obj.id, trig('click')).length;
            });
            if (!clickConsumed) {
              player?.moveTo?.(pos);
            }
          }
          if (state.editor.huskToPlace) {
            if (typeof state.huskToPlace.shade === 'object') {
              const shade = state.huskToPlace.shade;
              if (state.huskToPlace.portal != null) {
                state.createBridge(
                  {
                    ...shade,
                    pos,
                  },
                  state.huskToPlace.portal,
                  newFxRootCondition(
                    shade.formId === '/portal/house' ? 'interact' : 'step',
                  ),
                );
              } else {
                state.addShade(
                  pos,
                  shade.formId,
                  shade.variation,
                  shade.isGate,
                );
              }
              state.clearHuskToPlace();
            }
          } else if (posSelectCallback) {
            posSelectCallback(vec2(pos));
            posSelected = pos;
            // posSelectCallback = null;
          } else {
            if (state.editor.editing && state.editor.pointer) {
              if (gameObjects.length === 0 && !isInTurf(state.e, pos)) {
                state.deselectShade();
              }
            }
          }
        });

        this.input.on('pointerup', (pointer, _gameObjects) => {
          if (
            state.editor.huskToPlace &&
            typeof state.huskToPlace.shade !== 'object'
          ) {
            const pos = pixelsToTiles(vec2(pointer.worldX, pointer.worldY));
            const oldPos = state.e?.cave?.[state.huskToPlace.shade]?.pos;
            state.teleShade(state.huskToPlace.shade, pos);
            if (state.editor.autoOrientWalls) {
              if (oldPos) state.updateWallsAroundPos(vec2(oldPos));
              state.updateWallsAroundPos(pos, true);
            }
            state.clearHuskToPlace();
          }
          if (posSelected) {
            posSelectCallback?.(null, true);
            posSelectCallback = null;
            posSelected = null;
          }
        });

        this.input.on('pointermove', (pointer) => {
          if (pointer.isDown) {
            const pos = pixelsToTiles(vec2(pointer.worldX, pointer.worldY));
            if (posSelectCallback) {
              if (!equalsV(pos, posSelected)) {
                console.log('setting pos on drag');
                posSelectCallback(pos);
                posSelected = pos;
              }
            } else {
              mapEdit(pos);
              const pastMoveThreshold =
                pointer.getDistance() > 20 / window.devicePixelRatio;
              if (lastClickedShadeId !== null && pastMoveThreshold) {
                const pointerMode = state.editor.editing &&
                  state.editor.pointer;
                const clickedOnGate =
                  lastClickedShadeId == state.e?.lunk?.shadeId;
                const shouldMoveGate = state.selectedTab === state.tabs.TOWN &&
                  clickedOnGate;
                if (
                  (pointerMode || shouldMoveGate) && !state.huskToPlace &&
                  !shadeSelectCallback && !posSelectCallback
                ) {
                  state.setHuskToPlace(lastClickedShadeId);
                }
              }
              if (pastMoveThreshold) lastClickedShadeId = null;
            }
          }
          if (preview) {
            preview.updatePointer(pointer);
          }
        });

        this.input.on('wheel', (pointer) => {
          state.setScaleLog(state.scaleLog + pointer.deltaY / 200);
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
          if (ship !== our && players[ship]) {
            console.log('enqueueing them move', e.grit);
            players[ship].actionQueue.push(e.grit);
          }
        };
        addGritListener('pond-grit-move', themMoveQueuer);
        addGritListener('pond-grit-tele', themMoveQueuer);
        addGritListener('pond-grit-face', themMoveQueuer);

        const usMoveQueuer = (e) => {
          const ship = e.fakeGrit.arg.ship;
          if (ship === our && players[ship]) {
            players[ship].actionQueue.push(e.fakeGrit);
          }
        };
        addGritListener('pond-fakeGrit-move', usMoveQueuer);
        addGritListener('pond-fakeGrit-tele', usMoveQueuer);
        addGritListener('pond-fakeGrit-face', usMoveQueuer);

        const shadeMover = (e) => {
          const grit = e.unpredictedGrit || e.fakeGrit;
          shades[grit.arg.shadeId]?.actionQueue.push(grit);
        };
        addGritListener('pond-unpredictedGrit-move-shade', shadeMover);
        addGritListener('pond-fakeGrit-move-shade', shadeMover);

        function chat({ from, text }) {
          players[from]?.speakBubble?.(text); //do the visual speech bubble part
          if (state.soundOn) { //do the speech synthesis part
            const msg = new SpeechSynthesisUtterance();
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
        addGritListener('pond-roar-effect-seem', ({ roar, turfId }) => {
          if (turfId !== state.c.id) return;
          shades[roar.shadeId]?.seemVariation(roar.arg);
        });
      }

      function update() {
        const now = Date.now();
        const dt = now - updateTime;
        updateTime = now;
        frameCount++;
        if (standNeedsSort && stand) {
          standNeedsSort = false;
          stand.sort('depth');
        }
        if (!cam.roundPixels) cam.setRoundPixels(true);
        // if (keys.f.isDown) {
        //   keys.f.reset();
        //   game.scale.startFullscreen();
        // }
        return true;
        // console.log('f key', keys.f)
      }

      console.log('loading the game engine');

      const state = useState();
      window.state = state;
      state.setGameLoaded();

      new ResizeObserver(setGameSize).observe(container);
      game.scale.addListener(Phaser.Scale.Events.ENTER_FULLSCREEN, setGameSize);
      game.scale.addListener(
        Phaser.Scale.Events.LEAVE_FULLSCREEN,
        () => setTimeout(setGameSize, 100),
      );
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
        },
      );
      const readyToRender = () =>
        !!(loader.state === 'ready' && state.e && state.player);
      const gameInited = () => readyToRender() && !!earth;
      createEffect(on(() => [
        loader.state,
        state.c.id,
        state.player,
        JSON.stringify(state.e?.size),
        JSON.stringify(state.e?.offset),
      ], (_, __, _lastTurfId) => {
        destroyCurrentTurf();
        if (loader.state === 'ready') {
          if (readyToRender()) {
            initTurf(state.e, state.player);
            initShades(state.e);
            initPlayers(state.e);
            initShadePreview(state.e);
          }
          return state.c.id;
        }
      }));
      createEffect(
        // on(() => [loader.state, JSON.stringify(state.e?.cave)], () => {
        on(
          () => [
            loader.state,
            Object.entries(state.e?.cave || {}).map(
              ([id, shade]) => [id, shade.pos.x, shade.pos.y, shade.variation],
            ),
          ],
          () => {
            if (gameInited()) {
              initShades(state.e);
            }
          },
          { defer: true },
        ),
      );
      createEffect(
        on(
          () => [
            loader.state,
            JSON.stringify(Object.keys(state.e?.players || {})),
          ],
          () => {
            if (gameInited()) {
              initPlayers(state.e);
            }
          },
          { defer: true },
        ),
      );
    });
  });

  function loadSprites(sprites) {
    const promises = Object.entries(sprites).map(([id, { sprite, config }]) => {
      return loadImage(id, sprite, config);
    });
    return Promise.all(promises);
  }

  function loadPlayerSprites(turf) {
    const sprites = extractPlayerSprites(turf.id, turf.players);
    return loadSprites(sprites);
  }

  function destroyCurrentTurf() {
    window.player = player = null;
    window.players = players = {};
    window.shades = shades = {};
    earth = flats = stand = null;
    preview = null;
    game.scene.start(scene);
  }
  window.destroyTurf = destroyCurrentTurf;
  function initTurf(turf, _player) {
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
        x: bounds.x +
          Math.min(-buffer.l, -~~(Math.max(0, width - bounds.w) / 2)),
        y: bounds.y +
          Math.min(-buffer.t, -~~(Math.max(0, height - bounds.h) / 2)),
        w: Math.max(buffer.l + buffer.r + bounds.w, width),
        h: Math.max(buffer.t + buffer.b + bounds.h, height),
      };
      console.log('bbounds', bbounds);
      scene.cameras.main.setBounds(bbounds.x, bbounds.y, bbounds.w, bbounds.h);
    };
    createEffect(() => {
      setGameSize();
    });
    console.log('init turf tile layer', turf);

    window.earth = earth = scene.add.container();
    window.flats = flats = scene.add.container();
    window.stand = stand = scene.add.container();
    window.resizer = new Resizer(scene, turf.id);
    window.buttonHint = new ButtonHint(scene, turf.id);
    window.tileIndicators = new TileIndicators(scene, turf.id);
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

  function initShades(turf) {
    console.log('init shades');
    if (turf) {
      const ids = uniq([
        ...Object.keys(shades),
        ...Object.keys(turf.cave),
      ]).map(Number);
      ids.forEach((id) => {
        const shadeObject = shades[id];
        const shadeData = turf.cave[id];
        function destroyShade() {
          shades[id].destroy();
          delete shades[id];
        }
        function makeShade() {
          if (isInTurf(turf, shadeData.pos)) {
            shades[id] = createShade(shadeData, id, turf);
          }
        }
        if (!shadeData) {
          destroyShade();
        } else if (!shadeObject) {
          makeShade();
        } else if (shadeData.formId !== shadeObject.shade.formId) {
          destroyShade();
          makeShade();
        } else {
          if (shadeObject.shade.variation !== shadeData.variation) {
            shadeObject.varyVariation(shadeData.variation);
          }
          // const pos = vec2(shadeData.pos).scale(tileFactor);
          // shadeObject.setPosition(pos.x, pos.y);
          shadeObject.setTilePos(shadeData.pos);
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

export function requestShadeSelection(callback) {
  shadeSelectCallback = callback;
}

export function clearShadeSelectionCallback(callback) {
  if (shadeSelectCallback === callback) shadeSelectCallback = null;
}

export function requestPositionSelection(callback) {
  posSelectCallback = callback;
}

export function clearPositionSelectionCallback(callback) {
  if (posSelectCallback === callback) posSelectCallback = null;
}
