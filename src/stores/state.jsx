import { createSignal, createContext, createEffect, createMemo, getOwner, runWithOwner, useContext, mergeProps, batch } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import * as api from 'lib/api.js';
import { vec2, flattenGrid, hexToInt, vecToStr } from 'lib/utils';
import { getWallsAtPos, getWallVariationAtPos, getEffectsByHusk } from 'lib/turf';
import { Pond } from 'lib/pond';
import { Mist } from 'lib/mist';

export const StateContext = createContext();

export const lsKeys = {
  get SOUND_ON () {
    return our + '/turf/soundOn';
  },
};

function initEditorState() {
  return {
    selectedFormId: null,
    selectedShadeId: null,
    selectedTilePos: null,
    selectedTool: null,
    huskToPlace: null,
  };
}

export function getState() {
  let portals, peers;
  const [state, $state] = createStore({
    ponds: {},
    mist: new Mist('/mist'),
    get closet() {
      return this.mist._closet;
    },
    get currentTurfId() {
      return this.mist.vapor?.currentTurfId;
    },
    get player() {
      const player = this.e?.players[our];
      if (!player) return null;
      return player;
    },
    selectedTab: null,
    tabs: {
      HELP: 'help',
      LAB: 'lab',
      EDITOR: 'editor',
      TOWN: 'town',
      PORTALS: 'portals',
    },
    editor: {
      get editing() {
        return selectedTab() === 'editor';
      },
      tools: {
        BRUSH: 'brush',
        ERASER: 'eraser',
        CYCLER: 'cycler',
        RESIZER: 'resizer',
      },
      get pointer() {
        return this.selectedTool === null;
      },
      get brush() {
        return this.selectedTool === this.tools.BRUSH;
      },
      get eraser() {
        return this.selectedTool === this.tools.ERASER;
      },
      get cycler() {
        return this.selectedTool === this.tools.CYCLER;
      },
      get resizer() {
        return this.selectedTool === this.tools.RESIZER;
      },
      ...initEditorState(),
    },
    get huskToPlace() {
      return this.editor.huskToPlace;
    },
    lab:  {
      get editing() {
        return selectedTab() === 'lab';
      },
    },
    scaleLog: 1,
    get scale() {
      return Math.pow(2, Math.round(this.scaleLog));
    },
    notifications: [],
    text: null,
    soundOn: localStorage.getItem(lsKeys.SOUND_ON) !== 'false',
    gameLoaded: false,
    portOffer: null,
    get current() {
      const parent = this;
      const current = {
        get id() {
          return parent.currentTurfId;
        },
        get name() {
          return this.id ? this.id.replace('/pond/', '') : '';
        },
        get host() {
          return this.id ? this.name.split('/')[0] : '';
        },
        get pond() {
          return parent.ponds[this.id];
        },
        get turf() {
          return this.pond?.turf;
        },
        get ether() {
          return this.pond?.ether;
        },
        get mist() {
          return parent.mist?.mist;
        },
        get vapor() {
          return parent.mist?.vapor;
        },
        get selectedForm() {
          if (!parent.editor.editing) return null;
          if (!this.ether) return null;
          return this.ether.skye[parent.editor.selectedFormId] || null;
        },
        get peers() { // people no more than two spaces away
          return peers();
        }
      };
      return current;
    },
    get c() {
      return this.current;
    },
    get p() {
      return this.c.pond;
    },
    get t() {
      return this.p?.turf;
    },
    get e() {
      return this.p?.ether;
    },
    get m() {
      return this.c.mist;
    },
    get v() {
      return this.c.vapor;
    },
    get portals() {
      return portals();
    },
    get thisIsUs() {
      return this.c.id === ourPond;
    },
  });

  portals = createMemo(() => {
    const sort = (p1, p2) => { return p1.id - p2.id; };
    const portalsDraft = [];
    const portalsTo = [];
    const portalsFrom = [];
    const portalsWith = [];
    const dinksPending = [];
    const dinksApproved = [];
    const dinksConfirmed = [];
    let lunk = null;
    Object.entries(state.e?.portals || {}).forEach(([portalId, portal]) => {
      const portalObj = {
        id: Number.parseInt(portalId),
        ...portal
      };
      if (portal.shadeId !== undefined && state.e.lunk?.shadeId === portal.shadeId) {
        lunk = portalObj;
        return;
      }
      const dinkApproved = state.e.dinks?.[portalId];
      const isDink = dinkApproved !== undefined;
      let dest;
      if (isDink) {
        if (portal.at === null) {
          console.error(`Portal #${portalId} is supposedly a dink, but has null "at"`);
        } else {
          portalObj.approved = dinkApproved;
        }
      }
      if (portal.shadeId !== null) {
        if (portal.at === null) {
          dest = portalsTo;
        } else {
          dest = isDink ? dinksConfirmed : portalsWith;
        }
      } else {
        if (portal.at === null) {
          dest = portalsDraft;
        } else {
          if (isDink) {
            dest = dinkApproved ? dinksApproved : dinksPending;
          } else {
            dest = portalsFrom;
          }
        }
      }
      dest.push(portalObj);
    });
    return {
      draft: portalsDraft.sort(sort),
      to: portalsTo.sort(sort),
      from: portalsFrom.sort(sort),
      with: portalsWith.sort(sort),
      dinks: {
        pending: dinksPending.sort(sort),
        approved: dinksApproved.sort(sort),
        confirmed: dinksConfirmed.sort(sort),
      },
      lunk,
    };
  });

  peers = createMemo(() => {
    if (!state.e) return [];
    if (!state.player) return [];
    const pos = vec2(state.player.pos);
    const peers = Object.entries(state.e.players).filter(([patp, player]) => {
      if (patp === our) return false;
      return pos.distance(player.pos) < 2.5;
    }).map(([patp, _]) => patp);
    return peers;
  });

  const selectedTab = () => state.selectedTab;
  const owner = getOwner();

  const _state = mergeProps(state, {
    $: $state,
    setName(name) {
      $state('name', name);
    },
    subToTurf(id) {
      runWithOwner(owner, () => {
        if (!state.ponds[id]) {
          $state('ponds', id, new Pond(id));
        } else {
          state.ponds[id].subscribe();
        }
      });
    },
    clearTurfs(id) {
      for (const turfId in state.ponds) {
        if (turfId !== id) {
          state.ponds[turfId].destroy();
          $state('ponds', turfId, undefined);
        }
      }
    },
    clearTurf(id) {
      state.ponds[id]?.destroy?.();
      $state('ponds', id, undefined);
    },
    async resetConnection() {
      api.api.reset();
      for (const turfId in state.ponds) {
        state.ponds[turfId].unsubscribe();
        state.ponds[turfId].subscribe();
      }
      state.mist.unsubscribe();
      state.mist.subscribe();
    },
    sendPondWave(type, arg, id) {
      id = id || this.currentTurfId;
      const pond = this.ponds[id];
      if (pond) {
        return pond.sendWave(type, arg, id);
      }
    },
    sendOurPondWave(type, arg, id) {
      const pond = this.ponds[ourPond];
      if (pond) {
        return pond.sendWave(type, arg, id);
      } else {
        return api.sendPondWave(ourPond, [{ type, arg, }]);
      }
    },
    sendMistWave(type, arg, id) {
      id = id || '/mist';
      if (this.mist) {
        return this.mist.sendWave(type, arg, id);
      }
    },
    wake() {
      this.sendPondWave('wake', null);
    },
    setPortOffer(portOffer) {
      $state('portOffer', portOffer);
    },
    sendChat(message) {
      this.sendPondWave('send-chat', {
        from: our,
        text: message,
      });
    },
    setPos(pos) {
      this.sendPondWave('move', {
        ship: our,
        pos,
      });
    },
    setDir(dir) {
      this.sendPondWave('face', {
        ship: our,
        dir,
      });
    },
    pingPlayer(patp) {
      this.sendPondWave('ping-player', {
        ship: patp,
        by: our,
      });
    },
    resetEditor() {
      $state('editor', initEditorState());
    },
    resizeTurf(offset, size) {
      if (size.x <= 0 && size.y <= 0) return false;
      this.sendPondWave('size-turf', {
        offset,
        size,
      });
    },
    addForm(form, delFormId) {
      if (delFormId) this.delForm(delFormId);
      if (form) return this.sendPondWave('add-form', form);
    },
    delForm(formId) {
      return this.sendPondWave('del-form', {
        formId,
      });
    },
    async importForm(form, delFormId) {
      if (delFormId) await this.sendOurPondWave({ formId: delFormId });
      if (form) return await this.sendOurPondWave('add-form', form);
    },
    addHusk(pos, formId, variation = 0, isLunk = false) {
      return this.sendPondWave('add-husk', {
        isLunk,
        pos,
        formId,
        variation: Number.parseInt(variation)
      });
    },
    delShade(shadeId) {
      this.sendPondWave('del-shade', {
        shadeId: Number.parseInt(shadeId),
      });
    },
    moveShade(shadeId, pos) {
      this.sendPondWave('move-shade', {
        shadeId: Number.parseInt(shadeId),
        pos: vec2(pos),
      });
    },
    cycleShade(shadeId, amount = 1) {
      this.sendPondWave('cycle-husk', {
        huskId: Number.parseInt(shadeId),
        amount: Number.parseInt(amount),
      });
    },
    cycleTile(pos, amount = 1) {
      this.sendPondWave('cycle-husk', {
        huskId: vec2(pos),
        amount: Number.parseInt(amount),
      });
    },
    setShadeVariation(shadeId, variation) {
      this.sendPondWave('set-husk-var', {
        huskId: Number.parseInt(shadeId),
        variation: Number.parseInt(variation),
      });
    },
    setTileVariation(pos, variation) {
      this.sendPondWave('set-husk-var', {
        huskId: vec2(pos),
        variation: Number.parseInt(variation),
      });
    },
    setShadeEffect(shadeId, trigger, effect) {
      this.sendPondWave('set-husk-effect', {
        huskId: Number.parseInt(shadeId),
        trigger,
        effect,
        /*
        effect should look like this
        {
          type: [string],
          arg: [depends on type]
        } or
        [string] which is the type, or
        null
        */
      });
    },
    setTileEffect(shadeId, trigger, effect) {
      this.sendPondWave('set-husk-effect', {
        huskId: vec2(shadeId),
        trigger,
        effect,
      });
    },
    setShadeCollidable(shadeId, collidable) {
      this.sendPondWave('set-husk-collidable', {
        huskId: Number.parseInt(shadeId),
        collidable,
      });
    },
    setTileCollidable(pos, collidable) {
      this.sendPondWave('set-husk-collidable', {
        huskId: vec2(pos),
        collidable,
      });
    },
    updateWallAtPos(shadeId, pos) {
      const shade = getShade(this.e, shadeId);
      // should we bail if no shade, or allow that it might not be added yet?
      const variation = getWallVariationAtPos(this.e, pos, shade?.formId);
      this.setShadeVariation(shadeId, variation);
    },
    updateWallsAtPos(pos, orFlags, andFlags, formId) {
      batch(() => {
        const walls = getWallsAtPos(this.e, pos, formId);
        if (!walls.length) return;
        if (formId) {
          const variation = getWallVariationAtPos(this.e, pos, orFlags, andFlags, formId);
          walls.forEach((wall) => this.setShadeVariation(wall.id, variation));
        } else {
          walls.forEach((wall) => {
            const variation = getWallVariationAtPos(this.e, pos, orFlags, andFlags, wall.formId);
            this.setShadeVariation(wall.id, variation);
          });
        }
      });
    },
    updateWallsAroundPos(pos, updateCenter = false, ignoredWalls = []) {
      ignoredWalls = ignoredWalls.map(id => Number(id));
      const walls = getWallsAtPos(this.e, pos);
      const mustIgnore = walls.some(w => ignoredWalls.includes(Number(w.id)));
      if (mustIgnore) {
        walls.forEach((wall) => {
          const n = ignoredWalls.includes(Number(wall.id));
          const y = !n;
          const poses = [
            [vec2(pos).add(vec2( 1,  0)), y ? 8 : 0, n ?  7 : 15],
            [vec2(pos).add(vec2(-1,  0)), y ? 2 : 0, n ? 13 : 15],
            [vec2(pos).add(vec2( 0,  1)), y ? 4 : 0, n ? 11 : 15],
            [vec2(pos).add(vec2( 0, -1)), y ? 1 : 0, n ? 14 : 15],
          ];
          if (y && updateCenter) {
            poses.push([vec2(pos), 0, 15]);
          }
          poses.forEach((p) => this.updateWallsAtPos(...p, wall.formId));
        });
      } else {
        const poses = [
          [vec2(pos).add(vec2( 1,  0)), 0, 15],
          [vec2(pos).add(vec2(-1,  0)), 0, 15],
          [vec2(pos).add(vec2( 0,  1)), 0, 15],
          [vec2(pos).add(vec2( 0, -1)), 0, 15],
        ];
        if (walls.length && updateCenter) {
          poses.push([vec2(pos), 0, 15]);
        }
        poses.forEach((p) => this.updateWallsAtPos(...p));
      }
    },
    huskInteract(husk) {
      if (this.e && husk) {
        const effects = getEffectsByHusk(this.e, husk).fullFx;
        if (effects.interact?.type === 'read') {
          this.displayText(effects.interact.arg);
        }
      }
    },
    displayText(text) {
      $state('text', text);
    },
    approveDink(portalId) {
      this.sendPondWave('approve-dink', {
        portalId: Number(portalId),
      });
    },
    createBridge(shade, portal, trigger='step') {
      if (typeof shade === 'object') {
        shade = {
          isLunk: false,
          ...shade,
        };
      } else {
        shade = Number(shade);
      }
      this.sendPondWave('create-bridge', {
        shade,
        trigger, portal,
      });
    },
    createPortal(ship, path) {
      this.sendPondWave('add-portal', {
        for: {
          ship,
          path,
        },
        at: null,
      });
    },
    discardPortal(portalId) {
      this.sendPondWave('del-portal', {
        from: Number(portalId),
        loud: true,
      });
    },
    delPlayer(ship) {
      this.sendPondWave('del-player', {
        ship,
      });
    },
    addInvite(invite) {
      this.sendPondWave('add-invite', {
        id: invite.id,
        name: invite.name,
        till: Math.round(Number(invite.till)),
      });
    },
    delInvite(id) {
      this.sendPondWave('del-invite', { id });
    },
    makeCall(peers) {
      if (!Array.isArray(peers)) peers = [peers];
      return this.sendPondWave('call', { ships: peers });
    },


    setScaleLog(scaleLog) {
      scaleLog = state.editor.editing ? scaleLog : Math.min(1, Number(scaleLog));
      $state('scaleLog', Math.max(-1, scaleLog));
      // $state('scaleLog', Math.max(-1, Number(scaleLog)));
    },
    toggleLab() {
      $state('lab', 'editing', (editing) => !editing);
    },
    selectForm(id) {
      $state('editor', 'selectedFormId', id);
      if (id) this.selectTool(this.editor.tools.BRUSH);
    },
    selectShade(id, _) {
      batch(() => {
        if (id) this.selectTool(null);
        $state('editor', 'selectedShadeId', id);
      });
    },
    selectTile(pos) {
      batch(() => {
        if (pos) this.selectTool(null);
        $state('editor', 'selectedTilePos', pos);
      });
    },
    deselectHusk() {
      this.selectShade(null);
      this.selectTile(null);
    },
    selectTool(tool) {
      batch(() => {
        $state('editor', 'selectedTool', tool);
        if (tool === this.editor.tools.RESIZER) {
          this.setScaleLog(Math.max(this.scaleLog, 1));
        }
        if (tool !== this.editor.tools.POINTER) {
          $state('editor', 'huskToPlace', null);
        }
        this.deselectHusk();
      });
    },
    selectTab(tab) {
      batch(() => {
        if (state.selectedTab === state.tabs.LAB &&
          state.selectedTab !== tab) {
          this.setScaleLog(1);
        }
        $state('selectedTab', tab);
        $state('editor', 'huskToPlace', null);
        this.selectShade(null);
        this.selectTile(null);
        if (tab === state.tabs.LAB) {
          this.setScaleLog(-1);
        }
        if (tab === state.tabs.EDITOR) {
          this.selectTool(this.editor.selectedTool);
        } else {
          this.setScaleLog(this.scaleLog);
        }
      });
    },
    setPortalToPlace(portal, shade = {}) {
      this.setHuskToPlace(shade, portal);
    },
    setHuskToPlace(shade, portal) {
      if (typeof shade === 'object') {
        shade = {
          pos: vec2(state.e.offset),
          formId: '/portal',
          variation: 0,
          isLunk: false,
          ...shade,
        };
      } else {
        shade = Number(shade);
      }
      if (typeof portal !== 'object') {
        portal = Number(portal);
        if (isNaN(portal)) portal = undefined;
      }
      $state('editor', 'huskToPlace', { shade, portal });
    },
    clearHuskToPlace() {
      $state('editor', 'huskToPlace', null);
    },
    toggleSound() {
      $state('soundOn', (muted) => !muted);
    },
    notify(msg) {
      const notification = {
        msg,
      };
      $state('notifications', (n) => [...n, notification]);
      setTimeout(() => {
        this.removeNotification(notification);
      }, 10000);
    },
    unnotify(index) {
      $state('notifications', (n) => {
        return [...n.slice(0, index), ...n.slice(index + 1)];
      });
    },
    removeNotification(notification) {
      $state('notifications', (notifs) => {
        return notifs.filter(n => n !== notification);
      });
    },
    setGameLoaded() {
      $state('gameLoaded', true);
    }
  });

  createEffect(() => {
    if (state.editor.selectedFormId && !state.c.selectedForm) {
      _state.selectForm(null);
      _state.selectTool(null);
    }
  });

  createEffect(() => {
    if (_state.c.id) {
      batch(() => {
        _state.subToTurf(_state.c.id);
        _state.clearTurfs(_state.c.id);
        _state.resetEditor();
      });
    }
  });

  createEffect(() => {
    localStorage.setItem(lsKeys.SOUND_ON, _state.soundOn);
  });
  const pinger = setInterval(() => {
    api.ping();
  }, 60000);
  api.ping();

  window.addEventListener('pond-roar-port-offer', ({ roar, turfId }) => {
    const { ship, from, for: forId, at } = roar.arg;
    if (ship !== our) return;
    setTimeout(() => {
      _state.setPortOffer({
        for: forId,
        of: turfId,
        from,
        at,
      });
    }, 200);
  });
  window.addEventListener('pond-err', ({ _, turfId }) => {
    _state.clearTurf(turfId);
    _state.mist.enterVoid();
  });

  window.addEventListener('beforeunload', (e) => {
    _state.clearTurfs();
    _state.mist.destroy();
    clearInterval(pinger);
  });

  return _state;
}

export function StateProvider(props) {
  return (
    <StateContext.Provider value={getState()}>
      {props.children}
    </StateContext.Provider>
  );
}

export function useState() { return useContext(StateContext); }
