import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';

const [game, $game] = createSignal({ name: 'goop' });
export const Game = { game, $game };