import { batch, createEffect, untrack } from 'solid-js';
import { createStore } from 'solid-js/store';
import uniq from 'lodash/uniq';
import isEqual from 'lodash/isEqual';
import { useState } from 'stores/state.jsx';
import { getShade } from 'lib/turf.js';
import { TileIndicator } from './tileIndicator.js';

export class TileIndicators extends Phaser.GameObjects.Container {
  constructor(scene, turfId) {
    const state = useState();
    super(scene, 0, 0);
    this.s = state;
    this.turfId = turfId;
    this.secondaries = {};

    // this.setDepth(this.offset.y + this.size.y + 20);
    this.updateIndicators();
    this.mainIndicator = new TileIndicator(
      scene,
      turfId,
      () => this.s.editor.selectedShadeId,
    );
    this.add(this.mainIndicator);
    this.setupEffects();
    this.scene.add.existing(this);
  }

  get t() {
    return state.ponds[this.turfId]?.ether;
  }
  get shade() {
    if (this.s.editor.selectedShadeId != null) {
      const shade = getShade(this.t, this.s.editor.selectedShadeId);
      if (shade) return shade;
    }
    return null;
  }

  updateIndicators() {
    const ids = uniq([
      ...Object.keys(state.editor.selectedShadeIds),
      ...Object.keys(this.secondaries),
    ]);
    ids.forEach((shadeIdOrPos) => {
      const count = state.editor.selectedShadeIds[shadeIdOrPos];
      let indicator = this.secondaries[shadeIdOrPos];
      if (count < 1) {
        indicator?.destroy();
        this.secondaries[shadeIdOrPos] = undefined;
      } else {
        const colors = state.editor.selectedShadeColors[shadeIdOrPos];
        // const color = colors.length ? colors[colors.length - 1] : 0x0000ff;
        if (!indicator) {
          const colors = state.editor.selectedShadeColors[shadeIdOrPos];
          indicator = this.secondaries[shadeIdOrPos] = new TileIndicator(
            this.scene,
            this.turfId,
            () => shadeIdOrPos,
            {
              colors,
              style: 'crosshair-rect',
            },
          );
          this.add(indicator);
        } else {
          if (!isEqual(indicator.colors, colors)) {
            indicator.changeColors(colors);
          }
          // if (indicator)
        }
      }
    });
  }

  setupEffects() {
    createEffect(() => {
      this.updateIndicators();
    });
  }
}
