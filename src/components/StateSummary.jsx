import { createSignal, createMemo } from 'solid-js';
import { useState } from 'stores/state.jsx';
import * as api from 'lib/api.js';
import { vec2, bind } from 'lib/utils';

function Turf(props) {
  if (!props.turf) return null;
  const state = useState();
  return <>
    <p>
      {props.turf.size.x}x{props.turf.size.y}; offset: {props.turf.offset.x}x{props.turf.offset.y}
    </p>
  </>;
}

function StateSummary() {
  const state = useState();
  const pos = () => state.player?.pos || vec2();
  const $pos = (p) => state.setPos(p);
  function addTurf() {
    state.fetchTurf(('' + Math.random()).substring(2, 8));
  }
  function subToTurf(patp) {
    const turfId = '/pond/' + patp;
    state.subToTurf(turfId);
    state.$('currentTurfId', turfId);
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
    <div class="overflow-y-auto">
      <p>
        Player Pos: {pos().x}x{pos().y}
      </p>
      <p>
        view scale
      </p>
      <div>
        <input type="range" min="0.25" max="2" step="0.25" use:bind={[() => state.scale, (s) => state.setScale(s)]} />
      </div>
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
      <button onClick={[subToTurf, our]}>sub to turf</button>
      <button onClick={[subToTurf, '~bindev-midlev-mindyr']}>sub to bindev</button>
      <button onClick={[subToTurf, '~fasdev-naltuc-ravteb']}>sub to fasdev</button>
      <button onClick={unsubToTurfs}>unsub to turfs</button>
    </div>
  );
}

export default StateSummary;
