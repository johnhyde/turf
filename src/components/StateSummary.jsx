import { createSignal } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { bind } from 'lib/bind';
import * as api from '~/api.js';
import { vec2 } from 'lib/utils';

function Turf(props) {
  const state = useState();
  return <>
    <p>
      <button onClick={[state.visitTurf.bind(state), props.id]}>{props.id}</button>: {props.turf.size.x}x{props.turf.size.y}
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
  function unsubToTurf() {
    api.unsubscribeToTurf();
  }
  function addItem(itemId) {
    state.onPondRes(state.currentTurfId)({
      "wave": {
        "arg": {
          "pos": {
            "x": 0,
            "y": 0
          },
          "variation": 0,
          itemId,
        },
        "type": "add-item"
      }
    });
  }

  return (
    <div style={{ 'background-color': 'white' }} id="sidebar">
      <p>
        name: {state.name}
      </p>
      <p>
        turf count: {Object.keys(state.turfs).length}
      </p>
      <p>
        Player Pos: {pos().x}x{pos().y}
      </p>
      <div>
        <input type="number" use:bind={[() => state.player?.pos.x, (x) => state.setPos(vec2(Number(x), state.player?.pos.y))]} />
        <input type="number" use:bind={[() => pos().y, (y) => $pos(vec2(pos().x, Number(y)))]} />
      </div>
      <div>
        <input type="number" use:bind={[() => pos().x, (x) => $pos(vec2(Number(x), pos().y))]} />
        <input type="number" use:bind={[() => pos().y, (y) => $pos(vec2(pos().x, Number(y)))]} />
      </div>
      {/* <pre>
        {JSON.stringify(state.current.turf, null, 2)}
      </pre> */}
      <h3>Current Turf:</h3>
      <p>{state.currentTurfId}</p>
      <Show when={state.current.turf} fallback={<p>No current turf</p>}>
        <p>
          {state.current.turf.chats.length}
        </p>
        <Turf id={state.currentTurfId} turf={state.current.turf} />
      </Show>
      <h3>Turfs</h3>
      <ul>
        <For each={Object.entries(state.turfs)}>{([id, turf], i) => (
          <li>
            <Turf id={id} turf={turf} />
          </li>
        )}</For>
      </ul>
      <button onClick={[state.setName, 'haha, victoey']}>change name</button>
      {/* <button onClick={addTurf}>add turf</button> */}
      <button onClick={subToTurf}>sub to turf</button>
      <button onClick={unsubToTurf}>unsub to turfs</button>
      <button onClick={[addItem, '/grass']}>grass</button>
      <button onClick={[addItem, '/floor/wood']}>floor</button>
    </div>
  );
}

export default StateSummary;
