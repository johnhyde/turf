import { onCleanup } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { input } from 'lib/utils';

export default function ChatBar() {
  const state = useState();
  let chatbox;

  function sendChat(text) {
    const joinMatch = text.match(/^\/join (.*)/)
    if (joinMatch) {
      state.switchToTurf(joinMatch[1]);
    } else {
      state.sendChat(chatbox.value);
    }
  }

  function onChatBoxLoad(el) {
    window.chatbox = chatbox = el;
    chatbox.value = '';
    onInput({});
  }
  function onKeyDown(e) {
    if (e.code === 'Enter' && chatbox.value && !e.metaKey && !e.shiftKey) {
      console.log('chat ' + chatbox.value);
      sendChat(chatbox.value);
      chatbox.value = '';
      chatbox.blur();
      e.preventDefault();
    }
    if (e.code === 'Escape') {
      chatbox.blur();
      e.preventDefault();
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
    if (document.activeElement !== chatbox) {
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
    <div class="mt-1 text-sm overflow-y-hidden">
      <textarea class="w-full max-h-full px-2 py-1 resize-none rounded-md border border-yellow-950"
        ref={onChatBoxLoad} onKeyDown={onKeyDown}
        onInput={onInput}
        use:input={{ onFocus: onInput, onBlur: onInput}}
      ></textarea>
    </div>
  );
}
