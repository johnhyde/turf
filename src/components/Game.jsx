import { getOwner, onMount } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { startPhaser } from '~/phaser/game.js';
import { intToHex } from 'lib/utils.js';
import Overlay from '@/Overlay.jsx';

function Game() {
  const state = useState();
  const owner = getOwner();
  onMount(() => {
    // initEngine(owner, 'game');
    startPhaser(owner, gameContainer);
  });

  const backgroundStyle = () => {
    if (!state.e) {
      return { 'background-color': '#a6e4e8' };
    }
    const back = state.e.back;
    if (back?.type === 'color') {
      return { 'background-color': intToHex(back.arg) };
    } else if (back?.type === 'sprite') {
      const png = back.arg;
      if (typeof png !== 'string') {
        console.error('animated backgrounds not yet supported');
      }
      return {
        'background-image': `url("${png}")`,
        'background-repeat': 'repeat',
      };
    }
  };

  return (
    // <div id="shell" class="relative">
    <div id='shell'>
      <Overlay />
      <div id='gameContainer' style={backgroundStyle()}>
      </div>
    </div>
  );
}

export default Game;
