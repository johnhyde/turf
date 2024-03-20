import { createEffect, batch, untrack } from "solid-js";
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state';
import { getShade } from 'lib/turf';
import { roundV } from 'lib/utils';

export class TileIndicator extends Phaser.GameObjects.Container {
  constructor(scene, turfId, strokeWidth = 4) {
    const state = useState();
    super(scene, 0, 0);
    this.s = state;
    this.turfId = turfId;
    this.strokeWidth = strokeWidth;

    this.setDepth(this.offset.y + this.size.y + 20);
    this.rects = [
      new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0xff0000, 1),
      new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0xff0000, 1),
      new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0xff0000, 1),
      new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0xff0000, 1),
    ];
    this.rects.forEach(r => r.setOrigin(0, 0));
    
    this.updateShapes();
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
  get shade() {
    if (this.s.editor.selectedShadeId != null) {
      const shade = getShade(this.t, this.s.editor.selectedShadeId);
      if (shade) return shade;
    }
    return null;
  }
  get offset() {
    if (this.s.editor.selectedTilePos) {
      return this.tileOffsetToOffset(this.s.editor.selectedTilePos);
    }
    const shade = this.shade;
    if (shade) {
      return this.tileOffsetToOffset(shade.pos);
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
    return vec2(size || 0).scale(tileFactor).add(vec2(this.stroke*2));
  }

  offsetToTileOffset(offset) {
    return roundV(vec2(offset).add(vec2(this.stroke)).scale(1/tileFactor));
  }

  sizeToTileSize(size) {
    return roundV(vec2(size).subtract(vec2(this.stroke*2)).scale(1/tileFactor));
  }

  updateShapes() {
    const rectW = this.stroke;
    const offset = this.offset;
    const size = this.size;
    this.setPosition(offset.x, offset.y);
    this.rects[0].setPosition(0, size.y - rectW);
    this.rects[1].setPosition(size.x - rectW, 0);
    this.rects[0].setSize(size.x, rectW);
    this.rects[1].setSize(rectW, size.y);
    this.rects[2].setSize(size.x, rectW);
    this.rects[3].setSize(rectW, size.y);
  }

  setupEffects() {
    createEffect(() => {
      this.updateShapes();
    });
    createEffect(() => {
      if (this.t && state.editor.editing && (this.shade || state.editor.selectedTilePos)) {
        this.setVisible(true);
      } else {
        this.setVisible(false);
      }
    })
  }
}
