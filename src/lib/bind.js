import { createRenderEffect } from 'solid-js';

export function bind(el, accessor) {
  const [s, set] = accessor();
  el.addEventListener("input", (e) => set(e.currentTarget.value));
  createRenderEffect(() => el.value = s()); 
}
