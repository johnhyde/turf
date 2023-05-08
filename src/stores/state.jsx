import { createSignal, createContext, createEffect, useContext, mergeProps } from "solid-js";
import { createStore } from 'solid-js/store';
import * as api from '~/api.js';
// import { setTurf } from 'stores/game';

export const StateContext = createContext();

export function getState() {
  const [state, $state] = createStore({
    turfs: {},
    currentTurfId: null,
    get currentTurf() { return this.turfs[this.currentTurfId]; },
    player: {
      image: new ImageData(26, 36),
    },
    playerExistence: {
      pos: vec2(),
    },
    name: 'hi there',
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
    async visitTurf(id) {
      $state({ currentTurfId: id });
      if (this.currentTurfId && !this.currentTurf) {
        await this.fetchTurf(id);
      }
    },
    setPos(pos) {
      $state('playerExistence','pos', pos);
    },
  });

  // createEffect(() => {
  //   if (state.currentTurf) {
  //     setTurf();
  //   }
  // });
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
