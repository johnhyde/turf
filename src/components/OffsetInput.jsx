import { createEffect, onMount, onCleanup, on } from 'solid-js';
import { vec2, minV, maxV } from 'lib/utils';

export default function OffsetInput(props) {
  let canvas;
  const minOffset = () => vec2(-tileSize);
  const maxOffset = () => vec2(props.bitmap?.width || 0, props.bitmap?.height || 0);

  createEffect(on(
    () => props.bitmap,
    (bitmap) => {
      if (bitmap && canvas) {
        canvas.width = props.bitmap.width + tileSize;
        canvas.height = props.bitmap.height + tileSize;
        drawStuff(bitmap)
      }
    }
  ));

  function drawStuff(bitmap, offset, ctx) {
    if (!bitmap) bitmap = props.bitmap;
    if (!offset) offset = props.offset ? vec2(props.offset) : null;
    if (bitmap && offset && canvas) {
      if (!ctx) ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(props.bitmap, tileSize/2, tileSize/2);
      ctx.imageSmoothingEnabled = false;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(
        offset.x + tileSize/2 - ctx.lineWidth/2,
        offset.y + tileSize/2 - ctx.lineWidth/2,
        tileSize + ctx.lineWidth,
        tileSize + ctx.lineWidth,
      );
    }
  }

  createEffect(on(() => vec2(props.offset), (offset) => drawStuff(null, offset)));

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
    lastX = e.offsetX;
    lastY = e.offsetY;
  }

  function drag(e) {
    if (isDragging) {
      console.log('mouse moved in canvas', e);
      const deltaX = e.offsetX - lastX;
      const deltaY = e.offsetY - lastY;
      const offset = vec2(props.offset);
      offset.x = offset.x + deltaX;
      offset.y = offset.y + deltaY;
      props.$offset(minV(maxV(offset, minOffset()), maxOffset()));
      lastX = e.offsetX;
      lastY = e.offsetY;
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
