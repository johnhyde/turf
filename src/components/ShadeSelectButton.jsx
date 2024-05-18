import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { bindNum, input, toPairs } from 'lib/utils.js';
import {
  clearShadeSelectionCallback,
  requestShadeSelection,
} from '~/phaser/game.js';
import SmallButton from '@/SmallButton.jsx';
import point from 'assets/icons/point.png';

export function ShadeSelectButton(props) {
  const [active, $active] = createSignal(false);
  function onId(id) {
    props.onShadeId?.(id);
    deactivate();
  }

  function activate() {
    $active(true);
    requestShadeSelection(onId);
  }
  function deactivate() {
    $active(false);
    clearShadeSelectionCallback(onId);
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
      <img src={point} class='w-4 h-4 my-0.5' />
    </SmallButton>
  );
}
