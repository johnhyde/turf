import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { bindNum, input, toPairs } from 'lib/utils.js';
import {
  clearPositionSelectionCallback,
  requestPositionSelection,
} from '~/phaser/game.js';
import SmallButton from '@/SmallButton.jsx';
import crosshairs from 'assets/icons/crosshairs.png';

export function SelectPositionButton(props) {
  const [active, $active] = createSignal(false);
  function onPos(pos, end = false) {
    if (pos) props.onPos?.(vec2(pos));
    if (end) deactivate();
  }

  function activate() {
    $active(true);
    requestPositionSelection(onPos);
  }
  function deactivate() {
    $active(false);
    clearPositionSelectionCallback(onPos);
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && active()) {
      deactivate();
      e.stopPropagation();
      e.preventDefault();
    }
  };

  root.addEventListener('keydown', onKeyDown);
  onCleanup(() => {
    deactivate();
    root.removeEventListener('keydown', onKeyDown);
  });

  return (
    <SmallButton
      onClick={activate}
      class={'pt-0.5' + (active() ? ' !bg-yellow-600' : '')}
      onKeyDown={onKeyDown}
    >
      <img src={crosshairs} class='w-4 h-4 my-0.5' />
    </SmallButton>
  );
}
