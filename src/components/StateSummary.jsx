import { createSignal, createMemo } from 'solid-js';
import { useState } from 'stores/state.jsx';
import * as api from 'lib/api.js';
import { vec2, bind } from 'lib/utils';
import EditPane from '@/EditPane';
import Lab from '@/Lab';

function Turf(props) {
  if (!props.turf) return null;
  const state = useState();
  return <>
    <p>
      {props.turf.size.x}x{props.turf.size.y}; offset: {props.turf.offset.x}x{props.turf.offset.y}
    </p>
    <For each={props.turf.chats}>{(chat, i) => (
      <p>
        {chat.from}: {chat.text}
      </p>
    )}</For>
  </>;
}

function StateSummary() {
  const state = useState();
  const pos = () => state.player?.pos || vec2();
  const $pos = (p) => state.setPos(p);
  function addTurf() {
    state.fetchTurf(('' + Math.random()).substring(2, 8));
  }
  function subToTurf() {
    state.subToTurf();
  }
  function unsubToTurfs() {
    api.unsubscribeToTurf();
  }
  function addHusk(formId) {
    state.onPondRes(state.currentTurfId)({
      "wave": {
        "arg": {
          "pos": {
            "x": 0,
            "y": 0
          },
          "variation": 0,
          formId,
        },
        "type": "add-husk"
      }
    });
  }

  return (
    <div class="bg-white overflow-y-auto p-2 w-[250px]" id="sidebar">
      <p>
        Player Pos: {pos().x}x{pos().y}
      </p>
      {/* <div>
        <input type="number" use:bind={[() => state.player?.pos.x, (x) => state.setPos(vec2(Number(x), state.player?.pos.y))]} />
        <input type="number" use:bind={[() => pos().y, (y) => $pos(vec2(pos().x, Number(y)))]} />
      </div>
      <div>
        <input type="number" use:bind={[() => pos().x, (x) => $pos(vec2(Number(x), pos().y))]} />
        <input type="number" use:bind={[() => pos().y, (y) => $pos(vec2(pos().x, Number(y)))]} />
      </div> */}
      <p>
        view scale
      </p>
      <div>
        <input type="range" min="0.25" max="1.5" step="0.25" use:bind={[() => state.scale, (s) => state.$('scale', s)]} />
      </div>
      {/* <pre>
        {JSON.stringify(state.e, null, 2)}
      </pre> */}
      <h3>Current Turf:</h3>
      <p>{state.currentTurfId}</p>
      <Show when={state.e} fallback={<p>No current turf</p>}>
        {/* <p>
          {state.e.chats.length}
        </p> */}
        <Turf id={state.currentTurfId} turf={state.e} />
      </Show>
      {/* <h3>Turfs</h3>
      <ul>
        <For each={Object.entries(state.ponds)}>{([id, pond], i) => (
          <li>
            <Turf id={id} turf={pond.turf} />
          </li>
        )}</For>
      </ul> */}
      <button onClick={subToTurf}>sub to turf</button>
      <button onClick={unsubToTurfs}>unsub to turfs</button>
    </div>
  );
}

export default StateSummary;
