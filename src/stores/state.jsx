import { createSignal, createContext, createEffect, createMemo, useContext, mergeProps, batch } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import * as api from 'lib/api.js';
import { vec2, flattenGrid, hexToInt, vecToStr } from 'lib/utils';
import { getWallsAtPos, getWallVariationAtPos } from 'lib/turf';
import { Pond } from 'lib/pond';

export const StateContext = createContext();

export function getState() {
  const [state, $state] = createStore({
    ponds: {},
    currentTurfId: '/pond/' + our,
    get player() {
      const player = this.e?.players[our];
      if (!player) return null;
      const parent = this;
      return {
        ...player,
      };
    },
    name: 'hi there',
    selectedTab: null,
    tabs: {
      HELP: 'help',
      LAB: 'lab',
      EDITOR: 'editor',
    },
    editor: {
      get editing() {
        return selectedTab() === 'editor';
      },
      selectedFormId: null,
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
    scale: 0.5,
    get current() {
      const parent = this;
      const current = {
        get id() {
          return parent.currentTurfId;
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
  });

  const selectedTab = () => state.selectedTab;

  const _state = mergeProps(state, {
    $: $state,
    setName(name) {
      $state('name', name);
    },
    subToTurf(id) {
      if (!state.ponds[id]) {
        $state('ponds', id, new Pond(id));
      } else {
        state.ponds[id].subscribe();
      }
    },
    sendPondWave(type, arg, id) {
      id = id || this.currentTurfId;
      const pond = this.ponds[id];
      if (pond) {
        return pond.sendWave(type, arg, id);
      }
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
    sendChat(message) {
      this.sendPondWave('send-chat', {
        from: our,
        text: message,
      });
    },
    avatar: {
      setColor(color) {
        if (typeof color === 'string' && color[0] === '#') {
          color = hexToInt(color);
        }
        api.sendMistWave('set-color', Number(color));
      },
      addThing(formId) {
        api.sendMistWave('add-thing-from-closet', formId);
      },
      delThing(index) {
        api.sendMistWave('del-thing', Number(index));
      },
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
    setScale(scale) {
      $state('scale', Math.max(0.125, Math.min(6, Number(scale))));
    },
    toggleLab() {
      $state('lab', 'editing', (editing) => !editing);
    },
    selectForm(id, _) {
      $state('editor', 'selectedFormId', id);
      if (id) this.selectTool(this.editor.tools.BRUSH);
    },
    selectTool(tool) {
      batch(() => {
        $state('editor', 'selectedTool', tool);
        if (tool === this.editor.tools.RESIZER) {
          this.setScale(Math.max(this.scale, 1.5));
        }
      });
    },
    selectTab(tab) {
      batch(() => {
        $state('selectedTab', tab);
        if (tab === state.tabs.LAB) {
          this.setScale(Math.min(this.scale, 0.25));
        }
        if (tab === state.tabs.EDITOR) {
          this.selectTool(this.editor.selectedTool);
        }
      });
    },
  });

  _state.subToTurf(state.c.id);
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
