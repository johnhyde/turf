import { batch, createEffect, createRoot, untrack } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state';
import { getShade } from 'lib/turf';
import { roundV } from 'lib/utils';

export class TileIndicator extends Phaser.GameObjects.Container {
  constructor(scene, turfId, shadeIdOrPos, options = {}) {
    const state = useState();
    super(scene, 0, 0);
    this.s = state;
    this.turfId = turfId;
    this.shadeIdOrPos = shadeIdOrPos;
    this.strokeWidth = options.strokeWidth ?? 4;
    this.colors = options.colors ?? [options.color ?? 0xff0000];
    this.style = options.style ?? 'rect';

    this.setDepth(this.offset.y + this.size.y + 20);
    const newRect = () =>
      new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0, 1);
    this.rects = [newRect(), newRect(), newRect(), newRect()];
    if (this.style === 'crosshair-rect') {
      this.rects = [...this.rects, newRect(), newRect(), newRect(), newRect()];
    }
    this.rects.forEach((r) => r.setOrigin(0, 0));

    this.updateShapes();
    this.updateColors();
    this.add(this.rects);
    this.setupEffects();
    this.scene.add.existing(this);
  }

  get t() {
    return state.ponds[this.turfId]?.ether;
  }
  get scale() {
    return state.scale * window.devicePixelRatio;
  }
  get stroke() {
    return this.strokeWidth * this.scale;
  }
  get shadePos() {
    const iop = this.shadeIdOrPos();
    if (iop == null) return null;
    const parts = iop.toString().split(',').map(Number);
    if (parts.length >= 2) return vec2(parts[0], parts[1]);
    const shade = getShade(this.t, parts[0]);
    if (shade) return shade.pos;
    return null;
  }
  get offset() {
    const pos = this.shadePos;
    if (pos) {
      return this.tileOffsetToOffset(pos);
    }
    return vec2();
  }
  get size() {
    return this.tileSizeToSize(1);
  }

  tileOffsetToOffset(offset) {
    return vec2(offset || 0).scale(tileFactor).subtract(vec2(this.stroke));
  }

  tileSizeToSize(size) {
    return vec2(size || 0).scale(tileFactor).add(vec2(this.stroke * 2));
  }

  offsetToTileOffset(offset) {
    return roundV(vec2(offset).add(vec2(this.stroke)).scale(1 / tileFactor));
  }

  sizeToTileSize(size) {
    return roundV(
      vec2(size).subtract(vec2(this.stroke * 2)).scale(1 / tileFactor),
    );
  }

  updateShapes() {
    const rectW = this.stroke;
    const offset = this.offset;
    const size = this.size;
    this.setPosition(offset.x, offset.y);
    if (this.style === 'rect') {
      this.rects[0].setPosition(0, size.y - rectW);
      this.rects[1].setPosition(size.x - rectW, 0);
      this.rects[0].setSize(size.x, rectW);
      this.rects[1].setSize(rectW, size.y);
      this.rects[2].setSize(size.x, rectW);
      this.rects[3].setSize(rectW, size.y);
    } else if (this.style === 'crosshair-rect') {
      this.rects[0].setPosition(size.x / 4, size.y);
      this.rects[0].setSize(size.x / 2, rectW);
      this.rects[1].setPosition(size.x, size.y / 4);
      this.rects[1].setSize(rectW, size.y / 2);
      this.rects[2].setPosition(size.x / 4, -rectW);
      this.rects[2].setSize(size.x / 2, rectW);
      this.rects[3].setPosition(-rectW, size.y / 4);
      this.rects[3].setSize(rectW, size.y / 2);
      // crosshairs
      const crossLen = size.y / 4;
      this.rects[4].setPosition((size.x - rectW) / 2, size.y + rectW / 2);
      this.rects[4].setSize(rectW, crossLen);
      this.rects[5].setPosition(size.x + rectW / 2, (size.y - rectW) / 2);
      this.rects[5].setSize(crossLen, rectW);
      this.rects[6].setPosition((size.x - rectW) / 2, -crossLen - rectW / 2);
      this.rects[6].setSize(rectW, crossLen);
      this.rects[7].setPosition(-crossLen - rectW / 2, (size.y - rectW) / 2);
      this.rects[7].setSize(crossLen, rectW);
    }
  }

  updateColors() {
    this.rects.forEach((rect, i) =>
      rect.setFillStyle(this.colors[i % this.colors.length])
    );
  }

  setupEffects() {
    createRoot((dispose) => {
      this.dispose = dispose;
      createEffect(() => {
        this.updateShapes();
      });
      createEffect(() => {
        if (this.t && state.editor.editing && this.shadePos) {
          this.setVisible(true);
        } else {
          this.setVisible(false);
        }
      });
    });
  }

  changeColors(colors) {
    colors = Array.isArray(colors) ? colors : [colors];
    this.colors = colors;
    // this.rects.forEach((rect) => rect.setFillStyle(color));
    this.updateColors();
  }

  preDestroy(fromScene) {
    if (this.dispose) {
      this.dispose();
    }
    super.preDestroy(fromScene);
  }
}
