import { onCleanup } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { isValidPatp } from 'urbit-ob';
import { sendDM } from 'lib/api';
import { input, normalizeId, isTextInputFocused } from 'lib/utils';
import MediumButton from '@/MediumButton';

export default function ChatBar() {
  const state = useState();
  let chatbox;

  function sendChat(text) {
    const joinMatch = text.match(/^\/join (.*)/);
    const dmMatch = text.match(/^\/dm (~?[-a-z_]+) (.*)/);
    if (joinMatch) {
      alert('/join commands have been disabled.\nTry using portals instead :)');
    } else if (dmMatch) {
      const patp = normalizeId(dmMatch[1]);
      if (isValidPatp(patp)) {
        sendDM(patp, dmMatch[2]);
      }
    } else {
      state.sendChat(chatbox.value);
    }
  }

  function onChatBoxLoad(el) {
    window.chatbox = chatbox = el;
    chatbox.value = '';
    onInput({});
  }
  function submit() {
    if (chatbox.value) {
      console.log('chat ' + chatbox.value);
      sendChat(chatbox.value);
      chatbox.value = '';
      chatbox.blur();
    }
  }
  function onKeyDown(e) {
    if (e.code === 'Enter' && chatbox.value && !e.metaKey && !e.shiftKey) {
      submit();
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.code === 'Escape') {
      chatbox.blur();
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }
  function onInput(e) {
    chatbox.style.height = 0;
    const newHeight = Math.max(28, Number(chatbox.scrollHeight));
    chatbox.style.height = newHeight + 'px';
    chatbox.parentElement.style.minHeight = Math.min(48, newHeight) + 'px';
    chatbox.scroll(0, newHeight);
  }
  const globalKeyHandler = (e) => {
    if (document.activeElement !== chatbox && !isTextInputFocused()) {
      if (e.code === 'Space' || e.key === '/') {
        chatbox.focus();
        e.preventDefault();
        if (e.key === '/' && chatbox.value === '') {
          chatbox.value = '/';
        }
      }
    }
  };
  document.addEventListener('keydown', globalKeyHandler);
  onCleanup(() => document.removeEventListener('keydown', globalKeyHandler));

  return (
    <div class="mt-1 flex text-sm overflow-y-hidden">
        <textarea class="rounded-input w-full max-h-full resize-none border border-yellow-950"
          ref={onChatBoxLoad} on:keydown={onKeyDown}
          onInput={onInput}
          use:input={{ onFocus: onInput, onBlur: onInput}}
          placeholder='Press Space to chat'
        ></textarea>
        <button class="bg-yellow-700 border-yellow-950 border-2 rounded-md px-1.5 -py-2 ml-1 leading-none align-super font-bold text-xl" onClick={submit}>
          ↑
        </button>
    </div>
  );
}
