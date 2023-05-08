/* @refresh reload */
import { render } from 'solid-js/web';
import { createRoot } from "solid-js";

import 'css/index.css';
import App from './App';
import { initEngine } from 'stores/game';

window.desk = window.desk || 'turf';
window.ship = window.ship || 'zod';

// const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  );
}

render(() => <App />, root);
// initEngine();
// initEngine(null, game);