import { createSignal, createContext, createEffect, createMemo, getOwner, runWithOwner, useContext, mergeProps, batch } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import * as api from 'lib/api.js';

export const ExampleContext = createContext();


export function getExample() {
  const [example, $example] = createStore({

  });

  const _example = mergeProps(example, {
  });
  return _example;
}

export function ExampleProvider(props) {
  return (
    <ExampleContext.Provider value={getExample()}>
      {props.children}
    </ExampleContext.Provider>
  );
}

export function useExample() { return useContext(ExampleContext); }
