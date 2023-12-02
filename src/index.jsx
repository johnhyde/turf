/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from "@solidjs/router";
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
let violated = false;
document.addEventListener("securitypolicyviolation", (e) => {
  console.log(e.blockedURI);
  console.log(e.violatedDirective);
  console.log(e.originalPolicy);
  if (!violated) {
    violated = true;
    alert("Turf is being blocked by a Content Security Policy. Please consider using a browser extension like 'Disable Content-Security-Policy' to work around this. If that doesn't work, please DM ~midlev-mindyr.");
  }
});

render(() => {
  initApi();
  return (
  <Router>
    <App />
  </Router>
  );
}, root);
