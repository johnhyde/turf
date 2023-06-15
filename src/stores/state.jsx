import { createSignal, createContext, createEffect, createMemo, useContext, mergeProps, batch } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import * as api from 'lib/api.js';
import { vec2, flattenGrid, hexToInt } from 'lib/utils';
import { Pond, getWallsAtPos, getWallVariationAtPos } from 'lib/pond';

export const StateContext = createContext();

export function getState() {
  let playersList, spacesList;
  const [state, $state] = createStore({
    ponds: {},
    currentTurfId: '/pond',
    get player() {
      const player = this.e?.players[our];
      if (!player) return null;
      const parent = this;
      return {
        ...player,
      };
    },
    name: 'hi there',
    editor: {
      editing: false,
      selectedFormId: null,
      selectedTool: null,
      tools: {
        BRUSH: 'brush',
        ERASER: 'eraser',
        CYCLER: 'CYCLER',
      },
      get eraser() {
        return this.selectedTool === this.tools.ERASER;
      },
      get cycler() {
        return this.selectedTool === this.tools.CYCLER;
      },
    },
    lab: {
      editing: false,
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
        get playersList() {
          return playersList();
        },
        get spacesList() {
          return spacesList();
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
  playersList = createMemo(() => {
    if (!state.e) return null;
    console.log('calcing playlist')
    return Object.entries(state.e.players);
  });
  spacesList = createMemo(() => {
    if (!state.e) return null;
    console.log('calcing spaces list')
    return flattenGrid(state.e.spaces);
  });

  const _state = mergeProps(state, {
    $: $state,
    setName(name) {
      $state('name', name);
    },
    subToTurf(id='/pond') {
      if (!state.ponds[id]) {
        $state('ponds', id, new Pond(id));
      } else {
        state.ponds[id].subscribe();
      }
    },
    sendPondWave(mark, data, id) {
      id = id || this.currentTurfId;
      const pond = this.ponds[id];
      if (pond) {
        pond.sendWave(mark, data, id);
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
    addHusk(pos, formId, variation = 0) {
      const normPos = vec2(pos).subtract(this.e.offset);
      const currentSpace = this.e.spaces[normPos.x]?.[normPos.y]
      const currentTile = currentSpace?.tile;
      const currentShades = (currentSpace?.shades || []).map(sid => this.e.cave[sid]);
      const tileAlreadyHere = currentTile?.formId === formId;
      const shadeAlreadyHere = currentShades.some((shade) => shade.formId === formId);
      if (!tileAlreadyHere && !shadeAlreadyHere) {
        this.sendPondWave('add-husk', {
          pos,
          formId,
          variation: Number.parseInt(variation)
        });
        return true;
      }
      return false;
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
    setEditing(editing) {
      $state('editor', 'editing', editing);
    },
    toggleEditing() {
      $state('editor', 'editing', (editing) => !editing);
    },
    toggleLab() {
      $state('lab', 'editing', (editing) => !editing);
    },
    selectForm(id, _) {
      $state('editor', 'selectedFormId', id);
      this.selectTool(this.editor.tools.BRUSH);
    },
    selectTool(tool) {
      $state('editor', 'selectedTool', tool);
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
