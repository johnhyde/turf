import { getOwner, onMount } from 'solid-js';
import { startPhaser } from '~/phaser/game';
import Overlay from '@/Overlay';

function Game() {
  const owner = getOwner();
  onMount(() => {
    // initEngine(owner, 'game');
    startPhaser(owner, gameContainer);
  });

  return (
    // <div id="shell" class="relative">
    <div id="shell" >
      <Overlay/>
      <div id="gameContainer" style={{ 'background-color': 'green' }}>
      </div>
    </div>
  );
}

export default Game;
