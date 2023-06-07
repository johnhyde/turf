import { createSignal, createContext, createEffect, createMemo, useContext, mergeProps } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import * as api from '~/api.js';
import { vec2, flattenGrid } from 'lib/utils';
import { getPond, Pond, rockToTurf, washTurf } from 'lib/pond';

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
      },
      get eraser() {
        return this.selectedTool === this.tools.ERASER;
      },
    },
    scale: 1,
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
    sendWave(mark, data, id) {
      id = id || this.currentTurfId;
      const pond = this.ponds[id];
      if (pond) {
        pond.sendWave(mark, data, id);
      }
    },
    setPos(pos) {
      this.sendWave('move', {
        ship: our,
        pos,
      });
    },
    addHusk(pos, formId) {
      const normPos = vec2(pos).subtract(this.e.offset);
      const currentSpace = this.e.spaces[normPos.x]?.[normPos.y]
      const currentTile = currentSpace?.tile;
      const currentShades = (currentSpace?.shades || []).map(sid => this.e.cave[sid]);
      const tileAlreadyHere = currentTile?.formId === formId;
      const shadeAlreadyHere = currentShades.some((shade) => shade.formId === formId);
      if (!tileAlreadyHere && !shadeAlreadyHere) {
        this.sendWave('add-husk', {
          pos,
          formId,
          variation: 0,
        });
      }
    },
    delShade(shadeId) {
      this.sendWave('del-shade', {
        shadeId: Number.parseInt(shadeId),
      });
    },
    setEditing(editing) {
      $state('editor', 'editing', editing);
    },
    toggleEditing() {
      $state('editor', 'editing', (editing) => !editing);
    },
    selectForm(id) {
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
