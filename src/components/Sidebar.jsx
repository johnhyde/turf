import { createSignal, createSelector } from 'solid-js';
import { useState } from 'stores/state.jsx';
import * as api from 'lib/api.js';
import { vec2, bind } from 'lib/utils';
import Button from '@/Button';
import EditPane from '@/EditPane';
import Lab from '@/Lab';
import Help from '@/Help';
import leftCaret from 'assets/icons/left-caret.png';
import rightCaret from 'assets/icons/right-caret.png';
import lab from 'assets/icons/lab.png';
import shovel from 'assets/icons/shovel.png';
import help from 'assets/icons/help.png';

function Sidebar() {
  const state = useState();
  const isSelected = createSelector(() => state.selectedTab);
  function selectTab(tab) {
    state.$('selectedTab', tab);
  }
  function toggleTab(tab) {
    if (state.selectedTab === tab) {
      selectTab(null);
    } else {
      selectTab(tab);
    }
  }
  const [open, $open] = createSignal(true);
  function openSidebar() {
    $open(true);
  }
  function closeSidebar() {
    selectTab(null);
    $open(false);
  }

  return (
    <div
      class={'p-1 ' + (!state.selectedTab ? 'absolute' : 'bg-yellow-800 z-[100] h-full overflow-y-auto p-1 w-[233px]')}
      >
    {/* <div class="bg-yellow-800 z-[100] h-full overflow-y-auto p-1 w-[250px]"> */}
      <Show when={open()} fallback={(
          <Button onClick={openSidebar} src={rightCaret} />
        // </div>
      )}>
        <Button onClick={closeSidebar} src={leftCaret} />
        <Button onClick={[toggleTab, 'help']} src={help} selected={isSelected('help')} />
        <Button onClick={[toggleTab, 'lab']} src={lab} selected={isSelected('lab')} />
        <Button onClick={[toggleTab, 'editor']} src={shovel} selected={isSelected('editor')} />
        <Show when={state.selectedTab}>
          <div class="mt-1 pt-1 border-t border-yellow-950">
            {state.editor.editing && <EditPane/>}
            {state.lab.editing && <Lab/>}
            {state.selectedTab === 'help' && <Help/>}
          </div>
        </Show>
      </Show>
    </div>
  );
}

export default Sidebar;
