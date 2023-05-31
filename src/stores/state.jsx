import { createSignal, createContext, createEffect, createMemo, useContext, mergeProps } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import * as api from '~/api.js';
import { vec2, flattenGrid } from 'lib/utils';
import { rockToTurf, washTurf } from 'lib/pond';
// import { setTurf } from 'stores/game';

export const StateContext = createContext();

export function getState() {
  let playersList, spacesList;
  const [state, $state] = createStore({
    turfs: {},
    currentTurfId: '/pond',
    get player() {
      const player = this.current.turf?.players[our];
      if (!player) return null;
      const parent = this;
      return {
        ...player,
      };
    },
    name: 'hi there',
    editor: {
      editing: false,
      selectedItemId: null,
    },
    get current() {
      const parent = this;
      const current = {
        get id() {
          return parent.currentTurfId;
        },
        get turf() {
          return parent.turfs[this.id];
        },
        get playersList() {
          return playersList();
        },
        get spacesList() {
          return spacesList();
        }
      };
      return current;
    },
  });
  playersList = createMemo(() => {
    if (!state.current.turf) return null;
    console.log('calcing playlist')
    return Object.entries(state.current.turf.players);
  });
  spacesList = createMemo(() => {
    if (!state.current.turf) return null;
    console.log('calcing spaces list')
    return flattenGrid(state.current.turf.spaces);
  });

  const _state = mergeProps(state, {
    setName(name) {
      $state('name', name);
    },
    async fetchTurf(id) {
      console.log('fetching turf', id)
      const turf = await api.getTurf(id);
      $state('turfs', (turfs) => {
        return {...turfs, [id]: turf};
      });
    },
    onPondRes(id='/pond') {
      return (res) => {
        if (res.rock) {
          const newTurf = rockToTurf(res.rock);
          console.log(newTurf);
          $state('turfs', id, reconcile(newTurf));
        } else if (res.wave) {
          $state('turfs', id, washTurf(res.wave));
        } else {
          console.error('Pond response not a rock or wave???', res);
        }
      };
    },
    async subToTurf(id='/pond') {
      const onPondErr = () => {};
      const onPondQuit = () => {};
      api.subscribeToTurf(id, this.onPondRes(id), onPondErr, onPondQuit);
    },
    async visitTurf(id) {
      $state({ currentTurfId: id });
      if (this.currentTurfId && !this.current.turf) {
        await this.fetchTurf(id);
      }
    },
    sendWave(mark, data, id) {
      id = id || this.currentTurfId;
      this.onPondRes(this.currentTurfId, {
        wave: {
          type: mark,
          arg: data
        }
      })
      api.sendPondWave(this.currentTurfId, mark, data);
    },
    setPos(pos) {
      this.sendWave('move', {
        ship: our,
        pos,
      });
    },
    setEditing(editing) {
      $state('editor', 'editing', editing);
    },
    toggleEditing() {
      $state('editor', 'editing', (editing) => !editing);
    },
    selectItem(id) {
      $state('editor', 'selectedItemId', id);
    }
  });

  createEffect(() => {
    if (state.current.id && !state.current.turf) {
      _state.subToTurf(state.current.id);
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
