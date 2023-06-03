import { getOwner, onMount } from 'solid-js';
import { initEngine } from '~/melon/game';
import { startPhaser } from '~/phaser/game';

function Game() {
  const owner = getOwner();
  onMount(() => {
    // initEngine(owner, 'game');
    startPhaser(owner, gameContainer);
  });

  return (
    <div id="shell">
      <div id="gameContainer" style={{ 'background-color': 'green' }}>
      </div>
    </div>
  );
}

export default Game;
