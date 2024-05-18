import {
  batch,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
} from 'solid-js';
import { intToHex, randBrightColorInt } from 'lib/utils.js';
import { useState } from 'stores/state.jsx';
import SmallButton from '@/SmallButton.jsx';
import eye from 'assets/icons/eye.png';
import notEye from 'assets/icons/not-eye.png';

export function ShowShadeButton(props) {
  const state = useState();
  const colorInt = randBrightColorInt();
  const color = intToHex(colorInt);
  const [shown, $shown] = createSignal(props.showByDefault === true);
  // track separately from props.id for cleaning up when props.id is no longer available
  const [id, $id] = createSignal();
  createEffect(([prevId, prevShown]) => {
    if (prevId !== props.id) {
      if (prevId != null && prevShown) unhighlight();
      if (shown()) highlight();
    } else if (shown() !== prevShown) {
      if (shown()) {
        highlight();
      } else {
        unhighlight();
      }
    }
    return [props.id, shown()];
  }, [null, null]);

  function highlight() {
    if (props.id == null) return;
    batch(() => {
      state.highlightShade(props.id, colorInt);
      $id(props.id);
    });
  }
  function unhighlight() {
    if (id() != null) state.unhighlightShade(id(), colorInt);
  }
  function show() {
    $shown(true);
    // state.highlightShade(props.id);
  }
  function hide() {
    $shown(false);
    // state.unhighlightShade(props.id);
  }

  // onMount(() => {
  //   if (shown()) show();
  // });

  onCleanup(() => {
    if (shown()) unhighlight();
  });

  return (
    <SmallButton
      onClick={() => {
        if (shown()) {
          hide();
        } else show();
      }}
      class={'pt-0.5 border-2' + (shown() ? ' !bg-yellow-600' : '')}
      style={{
        'border-color': color,
      }}
    >
      <img src={shown() && props.id ? eye : notEye} class='w-4 h-4 my-0.5' />
    </SmallButton>
  );
}
