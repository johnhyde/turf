import { createSignal, createContext, createEffect, createMemo, getOwner, runWithOwner, useContext, mergeProps, batch } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import * as api from 'lib/api.js';
import { vec2, flattenGrid, hexToInt, vecToStr } from 'lib/utils';
import { getWallsAtPos, getWallVariationAtPos } from 'lib/turf';
import { Pond } from 'lib/pond';
import { Mist } from 'lib/mist';

export const StateContext = createContext();

export function getState() {
  const [state, $state] = createStore({
    ponds: {},
    mist: new Mist('/mist'),
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
      PORTALS: 'portals',
    },
    editor: {
      get editing() {
        return selectedTab() === 'editor';
      },
      selectedFormId: null,
      selectedShadeId: null,
      selectedTool: null,
      tools: {
        BRUSH: 'brush',
        ERASER: 'eraser',
        CYCLER: 'cycler',
        RESIZER: 'resizer',
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
    },
    lab:  {
      get editing() {
        return selectedTab() === 'lab';
      },
    },
    portalToPlace: null,
    scaleLog: 0,
    get scale() {
      return Math.pow(2, Math.round(this.scaleLog));
    },
    notifications: [],
    get current() {
      const parent = this;
      const current = {
        get id() {
          return parent.currentTurfId;
        },
        get name() {
          return this.id ? this.id.replace('/pond/', '') : '';
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
          if (!this.turf) return null;
          return this.turf.skye[parent.editor.selectedFormId];
        },
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
    sendMistWave(type, arg, id) {
      id = id || '/mist';
      if (this.mist) {
        return this.mist.sendWave(type, arg, id);
      }
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
    resizeTurf(offset, size) {
      if (size.x <= 0 && size.y <= 0) return false;
      this.sendPondWave('size-turf', {
        offset,
        size,
      });
    },
    addHusk(pos, formId, variation = 0) {
      return this.sendPondWave('add-husk', {
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
    cycleShade(shadeId, amount = 1) {
      this.sendPondWave('cycle-shade', {
        shadeId: Number.parseInt(shadeId),
        amount: Number.parseInt(amount),
      });
    },
    setShadeVariation(shadeId, variation = 1) {
      this.sendPondWave('set-shade-var', {
        shadeId: Number.parseInt(shadeId),
        variation: Number.parseInt(variation),
      });
    },
    setShadeEffect(shadeId, trigger, effect) {
      this.sendPondWave('set-shade-effect', {
        shadeId: Number.parseInt(shadeId),
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
    updateWallAtPos(shadeId, pos) {
      const variation = getWallVariationAtPos(this.e, pos);
      this.setShadeVariation(shadeId, variation);
    },
    updateWallsAtPos(pos, orFlags, andFlags) {
      batch(() => {
        const walls = getWallsAtPos(this.e, pos);
        if (walls.length > 0) {
          const variation = getWallVariationAtPos(this.e, pos, orFlags, andFlags);
          walls.forEach((wall) => this.setShadeVariation(wall.id, variation));
        }
      });
    },
    updateWallsAroundPos(pos, center) {
      const y = center === true;
      const n = center === false;
      const poses = [
        [vec2(pos).add(vec2(1, 0)), y ? 8 : 0, n ? 7 : 15],
        [vec2(pos).add(vec2(-1, 0)), y ? 2 : 0, n ? 13 : 15],
        [vec2(pos).add(vec2(0, 1)), y ? 4 : 0, n ? 11 : 15],
        [vec2(pos).add(vec2(0, -1)), y ? 1 : 0, n ? 14 : 15],
      ];
      poses.forEach((p) => this.updateWallsAtPos(...p));
    },
    createBridge(shade, portal, trigger='step') {
      this.sendPondWave('create-bridge', { shade, trigger, portal });
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


    setScaleLog(scaleLog) {
      scaleLog = state.editor.editing ? scaleLog : Math.min(1, Number(scaleLog));
      $state('scaleLog', Math.max(-1, scaleLog));
      // $state('scaleLog', Math.max(-1, Number(scaleLog)));
    },
    toggleLab() {
      $state('lab', 'editing', (editing) => !editing);
    },
    selectForm(id, _) {
      $state('editor', 'selectedFormId', id);
      if (id) this.selectTool(this.editor.tools.BRUSH);
    },
    selectShade(id, _) {
      batch(() => {
        if (id) this.selectTool(null);
        $state('editor', 'selectedShadeId', id);
      });
    },
    selectTool(tool) {
      batch(() => {
        $state('editor', 'selectedTool', tool);
        if (tool === this.editor.tools.RESIZER) {
          this.setScaleLog(Math.max(this.scaleLog, 1));
        }
        this.selectShade(null);
      });
    },
    selectTab(tab) {
      batch(() => {
        $state('selectedTab', tab);
        $state('portalToPlace', null);
        this.selectShade(null);
        if (tab === state.tabs.LAB) {
          this.setScaleLog(Math.min(this.scaleLog, -2));
        }
        if (tab === state.tabs.EDITOR) {
          this.selectTool(this.editor.selectedTool);
        } else {
          this.setScaleLog(this.scaleLog);
        }
      });
    },
    startPlacingPortal(portalId) {
      $state('portalToPlace', portalId);
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
  });

  createEffect(() => {
    if (_state.c.id) {
      batch(() => {
        _state.subToTurf(_state.c.id);
        _state.clearTurfs(_state.c.id);
      })
    }
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
