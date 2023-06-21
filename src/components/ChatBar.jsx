import { onCleanup } from 'solid-js';
import { useState } from 'stores/state.jsx';

export default function ChatBar() {
  const state = useState();

  function onChatBoxLoad(el) {
    window.chatbox = chatbox = el;
    chatbox.value = '';
    onInput({});
  }
  function onKeyDown(e) {
    if (e.code === 'Enter' && chatbox.value && !e.metaKey && !e.shiftKey) {
      console.log('chat ' + chatbox.value);
      state.sendChat(chatbox.value);
      chatbox.value = '';
      blur();
      e.preventDefault();
    }
    if (e.code === 'Escape') {
      blur();
      e.preventDefault();
      return false;
    }
  }
  let chatbox;
  function onInput(e) {
    chatbox.style.height = 0;
    const newHeight = Math.max(28, Number(chatbox.scrollHeight));
    chatbox.style.height = newHeight + 'px';
    chatbox.parentElement.style.minHeight = Math.min(48, newHeight) + 'px';
    chatbox.scroll(0, newHeight);
  }
  function blur() {
    chatbox.blur();
    onInput();
  };
  function focus() {
    chatbox.focus();
    onInput();
  }
  function onFocus() {
    game.input.keyboard.enabled = false;
    game.canvas.addEventListener('click', blur);
  }
  function onBlur() {
    game.input.keyboard.enabled = true;
    game.canvas.removeEventListener('click', blur);
  }
  const globalKeyHandler = (e) => {
    if (e.code === 'Space' && document.activeElement !== chatbox) {
      focus();
      e.preventDefault();
    }
  };
  document.addEventListener('keydown', globalKeyHandler);
  onCleanup(() => document.removeEventListener('keydown', globalKeyHandler));

  return (
    <div class="mt-1 text-sm overflow-y-hidden">
      <textarea class="w-full max-h-full px-2 py-1 resize-none rounded-md border border-yellow-950" ref={onChatBoxLoad} onKeyDown={onKeyDown} onInput={onInput} onFocus={onFocus} onBlur={onBlur}></textarea>
    </div>
  );
}
