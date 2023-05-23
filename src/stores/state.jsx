import { createSignal, createContext, createEffect, useContext, mergeProps } from "solid-js";
import { createStore } from 'solid-js/store';
import * as api from '~/api.js';
import { vec2 } from 'lib/utils';
import { rockToTurf, washTurf } from 'lib/pond';
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
    async subToTurf(id='/pond') {
      const onPondRes = (res) => {
        if (res.rock) {
          $state('turfs', (turfs) => {
            console.log(rockToTurf(res.rock));
            return {...turfs, [id]: rockToTurf(res.rock, id)};
          });
        } else if (res.wave) {
          $state('turfs', id, (turf) => {
            const newTurf = washTurf(turf, res.wave);
            console.log('new turf after wave', newTurf);
            return newTurf;
          });
        } else {
          console.error('Pond response not a rock or wave???', res);
        }
      };
      const onPondErr = () => {};
      const onPondQuit = () => {};
      api.subscribeToTurf(id, onPondRes, onPondErr, onPondQuit);
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
