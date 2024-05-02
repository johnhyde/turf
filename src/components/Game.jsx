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
    const colorStyles = {
      'width': '100%',
      'height': '100%',
      'background-color': '#a6e4e8',
    };
    if (!state.e) {
      return colorStyles;
    }
    const back = state.e.back;
    if (back.color != null) {
      return { ...colorStyles, 'background-color': intToHex(back.color) };
    } else if (back.sprite != null) {
      const png = back.sprite;
      if (typeof png !== 'string') {
        console.error('animated backgrounds not yet supported');
      }
      return {
        'background-image': `url("${png}")`,
        'background-repeat': 'repeat',
        'image-rendering': 'pixelated',
        'scale': 4 / state.scale,
        'width': 25 * state.scale + '%',
        'height': 25 * state.scale + '%',
      };
    }
  };

  return (
    <div id='shell' class='relative'>
      <div class='absolute origin-top-left' style={backgroundStyle()} />
      <div id='gameContainer' class='absolute w-full h-full' />
      <Overlay />
    </div>
  );
}

export default Game;
