import { createSignal, createSelector } from 'solid-js';
import { useState } from 'stores/state.jsx';
import * as api from 'lib/api.js';
import { vec2, isTextInputFocused } from 'lib/utils';
import Button from '@/Button';
import TownPane from '@/TownPane';
import PortalsPane from '@/PortalsPane';
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
import portal from 'assets/icons/portal.png';
import town from 'assets/icons/town.png';
import muted from 'assets/icons/muted.png';
import unmuted from 'assets/icons/unmuted.png';

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
    if (!e.defaultPrevented && !isTextInputFocused()) {
      if (e.code === 'Escape') {
        if (state.selectedTab) {
          selectTab(null);
        } else {
          if (open()) {
            closeSidebar();
          } else {
            openSidebar();
          }
        }
        e.preventDefault();
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
        case 't':
          toggleTab(state.tabs.TOWN);
          openSidebar();
          break;
        case 'g':
          toggleTab(state.tabs.PORTALS);
          openSidebar();
          break;
        case 'm':
          state.toggleSound();
          break;
        default:
      }
    }
  });

  return (
    <div
      class={'p-1 flex flex-col h-full w-[245px] min-w-[245px] pointer-events-none z-10 ' + (!state.selectedTab ? 'absolute' : 'bg-yellow-800 h-full p-1')}
    >
      <Show when={open()} fallback={(
        <div class="flex-grow">
          <div class="pointer-events-auto inline-block relative">
            <Button onClick={openSidebar} src={rightCaret} tooltip='Escape' />
            {state.portals?.from.length > 0 &&
            <div
              class={'absolute top-0 right-0 m-0.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse'}
            />}
          </div>
        </div>
      )}>
        <div class={'pointer-events-auto flex flex-wrap justify-evenly content-evenly ' + (state.selectedTab ? 'pb-1 border-b border-yellow-950' : '')}>
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
          {/* these next two buttons are just spacers */}
          <Button
            src={shovel}
            disabled
            class="opacity-0"
          />
          <div class="inline-block relative">
            <Button
              onClick={[toggleTab, state.tabs.TOWN]}
              src={town}
              selected={isSelected(state.tabs.TOWN)}
              tooltip='T'
            />
            {state.portals?.dinks.pending.length > 0 && state.thisIsUs &&
            <div
              class={'absolute top-0 right-0 m-0.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse'}
            />}
          </div>
          <div class="inline-block relative">
            <Button
              onClick={[toggleTab, state.tabs.PORTALS]}
              src={portal}
              selected={isSelected(state.tabs.PORTALS)}
              tooltip='G'
            />
            {state.portals?.from.length > 0 && state.thisIsUs &&
            <div
              class={'absolute top-0 right-0 m-0.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse'}
            />}
          </div>
          <Button
            onClick={state.toggleSound.bind(state)}
            src={state.soundOn ? unmuted : muted}
            tooltip='M'
          />
        </div>
        <Show when={state.selectedTab}>
          <div class="overflow-y-hidden shrink min-w-xl pointer-events-auto">
            <div class="my-1 h-full">
              {state.selectedTab === state.tabs.TOWN && <TownPane/>}
              {state.selectedTab === state.tabs.PORTALS && <PortalsPane/>}
              {state.editor.editing && <EditPane/>}
              {state.lab.editing && <Lab/>}
              {state.selectedTab === state.tabs.HELP && <Help/>}
            </div>
          </div>
        </Show>
        <ChatLog chats={state.e?.chats || []} context={state.selectedTab} />
      </Show>
      <div class="pointer-events-auto">
        <ChatBar />
      </div>
    </div>
  );
}

export default Sidebar;
