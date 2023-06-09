import { createSignal, createSelector } from 'solid-js';
import { useState } from 'stores/state.jsx';
import * as api from 'lib/api.js';
import { vec2, bind } from 'lib/utils';
import Button from '@/Button';
import EditPane from '@/EditPane';
import Lab from '@/Lab';
import Help from '@/Help';
import ChatLog from '@/ChatLog';
import ChatBar from '@/ChatBar';
import leftCaret from 'assets/icons/left-caret.png';
import rightCaret from 'assets/icons/right-caret.png';
import lab from 'assets/icons/lab.png';
import shovel from 'assets/icons/shovel.png';
import help from 'assets/icons/help.png';

function Sidebar() {
  const state = useState();
  const isSelected = createSelector(() => state.selectedTab);
  function selectTab(tab) {
    state.selectTab(tab);
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

  document.addEventListener('keydown', (e) => {
    if (!e.defaultPrevented && document.activeElement.tagName !== 'TEXTAREA') {
      if (e.code === 'Escape') {
        if (state.selectedTab) {
          selectTab(null);
        } else {
          if (open()) {
            closeSidebar();
          } else {
            openSidebar();
          }
          e.preventDefault();
        }
      }
      switch (e.key) {
        case '?':
        case 'h':
          toggleTab(state.tabs.HELP);
          openSidebar();
          break;
        case 'p':
          toggleTab(state.tabs.LAB);
          openSidebar();
        break;
        case 'e':
          toggleTab(state.tabs.EDITOR);
          openSidebar();
          break;
        default:
      }
    }
  });

  return (
    <div
      class={'p-1 flex flex-col h-full w-[233px] min-w-[233px] ' + (!state.selectedTab ? 'absolute' : 'bg-yellow-800 z-[100] h-full p-1')}
    >
      <Show when={open()} fallback={(
        <div class="flex-grow">
          <Button onClick={openSidebar} src={rightCaret} tooltip='Escape' />
        </div>
      )}>
        <div class={state.selectedTab ? 'pb-1 border-b border-yellow-950' : ''}>
            <Button
              onClick={closeSidebar}
              src={leftCaret}
              tooltip='Escape'
            />
            <Button
              onClick={[toggleTab, state.tabs.HELP]}
              src={help}
              selected={isSelected(state.tabs.HELP)}
              tooltip='H or ?'
            />
            <Button
              onClick={[toggleTab, state.tabs.LAB]}
              src={lab}
              selected={isSelected(state.tabs.LAB)}
              tooltip='P'
            />
            <Button
              onClick={[toggleTab, state.tabs.EDITOR]}
              src={shovel}
              selected={isSelected(state.tabs.EDITOR)}
              tooltip='E'
            />
        </div>
        <Show when={state.selectedTab}>
          <div class="overflow-y-auto">
            <div class="my-1">
              {state.editor.editing && <EditPane/>}
              {state.lab.editing && <Lab/>}
              {state.selectedTab === 'help' && <Help/>}
            </div>
          </div>
        </Show>
        <ChatLog chats={state.e?.chats || []} context={state.selectedTab} />
      </Show>
      <ChatBar />
    </div>
  );
}

export default Sidebar;
