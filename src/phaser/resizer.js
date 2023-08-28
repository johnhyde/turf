import { createEffect, batch, untrack } from "solid-js";
import { createStore } from 'solid-js/store';
import { useState } from 'stores/state';
import { roundV } from 'lib/utils';

export class Resizer extends Phaser.GameObjects.Container {
  constructor(scene, turfId, strokeWidth = 8) {
    const state = useState();
    super(scene, 0, 0);
    this.s = state;
    this.turfId = turfId;
    this.strokeWidth = strokeWidth;
    const [n, $n] = createStore(null);
    this.n = n;
    this.$n = $n;

    this.setDepth(this.offset.y + this.size.y + 20);
    this.rects = [
      new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0xff0000, 1),
      new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0xff0000, 1),
      new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0xff0000, 1),
      new Phaser.GameObjects.Rectangle(scene, 0, 0, 0, 0, 0xff0000, 1),
    ];
    this.rects.forEach(r => r.setOrigin(0, 0));
    this.tris = [
      new Phaser.GameObjects.Triangle(scene, 0, 0, 0, 0, 2, 0, 1, 1, 0xff0000, 1),
      new Phaser.GameObjects.Triangle(scene, 0, 0, 0, 0, 2, 0, 1, 1, 0xff0000, 1).setAngle(-90),
      new Phaser.GameObjects.Triangle(scene, 0, 0, 0, 0, 2, 0, 1, 1, 0xff0000, 1).setAngle(180),
      new Phaser.GameObjects.Triangle(scene, 0, 0, 0, 0, 2, 0, 1, 1, 0xff0000, 1).setAngle(90),
    ];
    
    this.tris.forEach((t, i) => {
      t.setInteractive({ draggable: true });
      t.on('drag', (_pointer, dragX, dragY) => {
        batch(() => {
          this.updateN(i, vec2(dragX, dragY));
          // this.saveN(); // this breaks dragging
        });
      });
      t.on('dragend', () => {
        batch(() => {
          this.saveN();
          this.$n(null);
        });
      });
    });
    this.updateShapes();
    this.add([...this.rects, ...this.tris]);
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
  get offset() {
    return this.tileOffsetToOffset(this.t?.offset);
  }
  get size() {
    return this.tileSizeToSize(this.t?.size);
  }
  get nOffset() {
    return this.n?.offset ? vec2(this.n?.offset) : this.offset;
  }
  get nSize() {
    return this.n?.size ? vec2(this.n?.size) : this.size;
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
    const offset = this.nOffset;
    const size = this.nSize;
    this.setPosition(offset.x, offset.y);
    this.rects[0].setPosition(0, size.y - rectW);
    this.rects[1].setPosition(size.x - rectW, 0);
    this.rects[0].setSize(size.x, rectW);
    this.rects[1].setSize(rectW, size.y);
    this.rects[2].setSize(size.x, rectW);
    this.rects[3].setSize(rectW, size.y);
    const triOffset = rectW + (16 * this.scale); 
    this.tris[0].setPosition(size.x / 2, size.y + triOffset);
    this.tris[1].setPosition(size.x + triOffset, size.y / 2);
    this.tris[2].setPosition(size.x / 2, -triOffset);
    this.tris[3].setPosition(-triOffset, size.y / 2);

    this.tris.forEach((t, i) => {
      t.setScale(20 * this.scale);
    });
  }

  updateN(dir, drag) {
    const rectW = this.stroke;
    const min = 32*factor + rectW*2;
    const triOffset = rectW + (16*factor * this.scale);
    const br = vec2(this.offset).add(this.size);
    const offsetDrag = vec2(drag).add(this.offset).add(vec2(triOffset));
    batch(() => {
      this.$n('size', (size) => {
        switch (dir) {
          case 0:
            return {
              x: this.nSize.x,
              y: Math.max(min, drag.y - triOffset),
            };
          case 1:
            return {
              x: Math.max(min, drag.x - triOffset),
              y: this.nSize.y,
            };
          case 2:
            return {
              x: this.nSize.x,
              y: Math.max(min, br.y - offsetDrag.y),
            };
          case 3:
            return {
              x: Math.max(min, br.x - offsetDrag.x),
              y: this.nSize.y,
            };
          default: return null;
        }
      });
      if (dir === 2) {
        this.$n('offset', {
          x: this.nOffset.x,
          y: Math.min(br.y - min, offsetDrag.y),
        });
      }
      if (dir === 3) {
        this.$n('offset', {
          x: Math.min(br.x - min, offsetDrag.x),
          y: this.nOffset.y,
        });
      }
    });
  }

  saveN() {
    this.s.resizeTurf(
      this.offsetToTileOffset(this.nOffset),
      this.sizeToTileSize(this.nSize)
    );
  }

  setupEffects() {
    createEffect(() => {
      this.updateShapes();
    });
    createEffect(() => {
      if (state.editor.editing && state.editor.resizer) {
        this.setVisible(true);
      } else {
        this.setVisible(false);
      }
    })
  }
}
