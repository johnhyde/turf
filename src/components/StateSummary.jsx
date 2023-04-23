import { useState } from 'stores/state.jsx';
// import api from '~/api.js';

function StateSummary() {
  const state = useState();
  function addTurf() {
    state.fetchTurf(Math.random());
  }

  return (
    <div>
      <p>
        name: {state.name}
      </p>
      <p>
        turf count: {state.turfs.length}
      </p>
      <ul>
        <For each={state.turfs}>{(turf, i) => {
          <li>
            <p>
              {turf.id}: {turf.tiles.width}x{turf.tiles.height}
            </p>
            <p>
              {turf.chat.slice(-1)}
            </p>
          </li>
        }}</For>
      </ul>
      <button onClick={[state.setName, 'haha, victoey']}>change name</button>
      <button onClick={addTurf}>add turf</button>
    </div>
  );
}

export default StateSummary;
