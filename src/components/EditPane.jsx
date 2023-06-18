import { createSignal, createSelector } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state.jsx';
import { bind } from 'lib/utils';
import FormSelect from '@/FormSelect';

export default function EditPane() {
  const state = useState();
  function defaultGrowth() {
    return {
      top: 0,
      bot: 0,
      lef: 0,
      rit: 0,
    };
  }
  const [growth, $growth] = createStore({
    ...defaultGrowth(),
    get tl() {
      return vec2(this.lef, this.top);
    },
    get br() {
      return vec2(this.rit, this.bot);
    },
  });
  function resizeTurf() {
    const newOffset = vec2(state.e.offset).subtract(growth.tl);
    const newSize = vec2(state.e.size).add(growth.tl).add(growth.br);
    if (newSize.x > 0 && newSize.y > 0) {
      state.resizeTurf(newOffset, newSize);
      $growth(defaultGrowth());
    }
  }
  const isSelected = createSelector(() => state.editor.selectedFormId);
  function selectTool(tool) {
    state.selectForm(null);
    state.selectTool(tool);
  }
  return (
    <div>
      {/* <p>
        Edit Mode
      </p> */}
      {/* <button onClick={state.toggleEditing.bind(state)}>Cancel</button> */}
      {/* <button onClick={state.toggleEditing.bind(state)}>Save</button> */}
      {/* <button onClick={state.toggleEditing.bind(state)}>Done</button> */}
      <div class="border grid grid-cols-2">
        <label>Top</label>
        <input type="number" use:bind={[() => growth.top, (n) => $growth('top', Number(n))]} />
        <label>Bottom</label>
        <input type="number" use:bind={[() => growth.bot, (n) => $growth('bot', Number(n))]} />
        <label>Left</label>
        <input type="number" use:bind={[() => growth.lef, (n) => $growth('lef', Number(n))]} />
        <label>Right</label>
        <input type="number" use:bind={[() => growth.rit, (n) => $growth('rit', Number(n))]} />
      </div>
      <button onClick={resizeTurf}>Resize Turf</button>
      <div class="border">
        <p>
          <button onClick={[selectTool, state.editor.tools.ERASER]}>Erase</button>
          <button onClick={[selectTool, state.editor.tools.CYCLER]}>Cycler</button>
        </p>
        <FormSelect
          forms={Object.entries(state.e?.skye || {})}
          select={state.selectForm.bind(state)}
          selectedId={state.editor.selectedFormId}
        />
      </div>
    </div>
  );
}
