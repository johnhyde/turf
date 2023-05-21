import { getOwner, onMount } from 'solid-js';
import { initEngine } from 'stores/game';

function Game() {
  const owner = getOwner();
  onMount(() => {
    initEngine(owner, game);
    // initEngine(owner);
  });

  return (
    <div id="shell">
      <div id="game" style={{ 'background-color': 'blue' }}>
      </div>
    </div>
  );
}

export default Game;
