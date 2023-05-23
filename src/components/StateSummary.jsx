import { createSignal } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { bind } from 'lib/bind';
// import api from '~/api.js';
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
  const pos = () => state.playerExistence.pos;
  const $pos = (p) => state.setPos(p);
  function addTurf() {
    state.fetchTurf(('' + Math.random()).substring(2, 8));
  }
  function subToTurf() {
    state.subToTurf();
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
      <input type="number" use:bind={[() => pos().x, (x) => $pos(vec2(Number(x), pos().y))]} />
      <input type="number" use:bind={[() => pos().y, (y) => $pos(vec2(pos().x, Number(y)))]} />
      {/* <pre>
        {JSON.stringify(state.currentTurf, null, 2)}
      </pre> */}
      <h3>Current Turf:</h3>
      <p>{state.currentTurfId}</p>
      <Show when={state.currentTurf} fallback={<p>No current turf</p>}>
        <Turf id={state.currentTurfId} turf={state.currentTurf} />
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
      <button onClick={addTurf}>add turf</button>
      <button onClick={subToTurf}>sub to turf</button>
    </div>
  );
}

export default StateSummary;
