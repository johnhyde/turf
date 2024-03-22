import { useState } from 'stores/state.jsx';
import { createEffect, createSignal, onMount, onCleanup, on } from 'solid-js';
import { vec2, minV, maxV, roundV, equalsV, makeImage } from 'lib/utils';

export default function OffsetInput(props) {
  const state = useState();
  const [bgBitmap, $bgBitmap] = createSignal(null);
  const bgImage = () => {
    if (props.type !== 'garb') return null;
    const sprite = state.m.avatar.body.thing.form.variations[0].sprite;
    if (typeof sprite === 'string') return sprite;
    return sprite.frames[0];
  }
  createEffect(async () => {
    const url = bgImage();
    if (url) {
      const imageStuff = await makeImage(url);
      $bgBitmap(imageStuff.bitmap);
    }
  });
  let canvas;
  const minOffset = () => vec2(-tileSize);
  const maxOffset = () => vec2(props.bitmap?.width || 0, props.bitmap?.height || 0);
  let scale = 1;
  let offset = vec2();

  createEffect(on(
    () => [props.bitmap, bgBitmap(), props.deep],
    (bitmap) => {
      if (bitmap && canvas) {
        canvas.width = props.bitmap.width + tileSize;
        canvas.height = props.bitmap.height + tileSize;
        scale = canvas.width/128;
        drawStuff(bitmap);
      }
    }
  ));

  function drawStuff(bitmap, offset, ctx) {
    if (!bitmap) bitmap = props.bitmap;
    if (!offset) offset = props.offset ? vec2(props.offset) : null;
    const bg = bgBitmap();
    if (bitmap && offset && canvas) {
      if (!ctx) ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (props.deep === 'fore') drawBg(ctx, bg);
      ctx.drawImage(props.bitmap, tileSize/2, tileSize/2);
      if (props.deep !== 'fore') drawBg(ctx, bg);
      ctx.imageSmoothingEnabled = false;
      ctx.strokeStyle = "red";
      ctx.lineWidth = Math.max(1, Math.round(2*scale));
      ctx.setLineDash([Math.max(3, 6*scale), Math.max(2, 2*scale)]);
      ctx.strokeRect(
        offset.x + tileSize/2 - ctx.lineWidth/2,
        offset.y + tileSize/2 - ctx.lineWidth/2,
        tileSize + ctx.lineWidth,
        tileSize + ctx.lineWidth,
      );
    }
  }

  function drawBg(ctx, bg) {
    if (bg) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.drawImage(bg, props.offset.x + tileSize/2, props.offset.y + tileSize/2);
      ctx.restore();
    }
  }

  createEffect(on(() => vec2(props.offset), (propsOffset) => {
    drawStuff(null, propsOffset);
    if (!equalsV(roundV(offset), propsOffset)) {
      console.log('resetting offset', offset, propsOffset);
      offset = vec2(propsOffset);
    }
  }));

  onMount(() => {
    document.addEventListener('mouseup', stopDrag);
  });
  onCleanup(() => {
    document.removeEventListener('mouseup', stopDrag);
  });
 
  let isDragging = false;
  let lastX, lastY;

  function startDrag(e) {
    isDragging = true;
    lastX = e.offsetX*scale;
    lastY = e.offsetY*scale;
  }

  function drag(e) {
    if (isDragging) {
      console.log('mouse moved in canvas', e);
      const deltaX = e.offsetX*scale - lastX;
      const deltaY = e.offsetY*scale - lastY;
      offset.x = offset.x + deltaX;
      offset.y = offset.y + deltaY;
      props.$offset(minV(maxV(roundV(offset), minOffset()), maxOffset()));
      lastX += deltaX;
      lastY += deltaY;
    }
  }

  function stopDrag() {
    isDragging = false;
  }

  return (
    <canvas ref={canvas}
      class="w-[128px] mx-auto border border-black"
      style={{ 'image-rendering': 'pixelated' }}
      onMouseDown={startDrag}
      onMouseMove={drag}
    >

    </canvas>
  );
}
