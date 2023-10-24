/* @refresh reload */
import { render } from 'solid-js/web';
import { createRoot } from "solid-js";

import Phaser from "phaser";

import 'css/reset.css';
import 'css/index.css';
import { initApi } from 'lib/api';

window.desk = window.desk || 'turf';
window.ship = window.ship || 'zod';
window.our = '~' + ship;
window.ourPond = '/pond/' + our;
window.dev = import.meta.env.DEV;

import App from './App';
// console.log(`Initializing Urbit API at ${Date()}`);
// const api = new UrbitApi('', '', window.desk);

// api.ship = window.ship;
// api.verbose = import.meta.env.DEV;
// window.api = api;
// const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  );
}

render(() => {
  initApi();
  return <App />;
}, root);
