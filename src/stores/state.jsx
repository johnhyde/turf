import { createSignal, createContext, useContext, mergeProps } from "solid-js";
import { createStore } from 'solid-js/store';
import * as api from '~/api.js';

export const StateContext = createContext();

export function StateProvider(props) {
  const [state, setState] = createStore({
    turfs: [],
    player: {
      image: new ImageData(26, 36)
    },
    name: 'hi there',
  });
  const stateApi = mergeProps(state, {
    setName(name) {
      setState('name', name);
    },
    async fetchTurf(id) {
      setState('turfs', [...state.turfs, await api.getTurf(id)]);
    },
  });

  return (
    <StateContext.Provider value={stateApi}>
      {props.children}
    </StateContext.Provider>
  );
}

export function useState() { return useContext(StateContext); }
