import { createSignal, createMemo } from 'solid-js';
import { useState } from 'stores/state.jsx';
import * as api from 'lib/api.js';
import { vec2, bind, getDateString } from 'lib/utils';

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
    api.unsubscribeToPool();
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
      <ul>
        <For each={Object.entries(state.e?.players || {})}>
          {([patp, player]) => (
            <li>
              {patp}: {player.wake ? getDateString(player.wake) : 'n/a'}
            </li>
          )}
        </For>
      </ul>
      <p>
        Player Pos: {pos().x}x{pos().y}
      </p>
      <p>
        view scale
      </p>
      <div>
        <input type="range" min="-2" max="4" step="1" use:bind={[() => state.scaleLog, (s) => state.setScaleLog]} />
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
      <ul>
        <li>
          <button onClick={[subToTurf, our]}>sub to our</button>
        </li>
        <li>
          <button onClick={[subToTurf, '~nec']}>sub to nec</button>
        </li>
        <li>
          <button onClick={[subToTurf, '~bindev-midlev-mindyr']}>sub to bindev</button>
        </li>
        <li>
          <button onClick={[subToTurf, '~fasdev-naltuc-ravteb']}>sub to fasdev</button>
        </li>
        <li>
          <button onClick={unsubToTurfs}>unsub to turfs</button>
        </li>
      </ul>
      <input class="text-black" placeholder='@p' name="join" onKeyDown={(e) => { if (e.code == 'Enter') { subToTurf(e.target.value)}}}></input>
      {/* <button onClick={} */}
    </div>
  );
}

export default StateSummary;
