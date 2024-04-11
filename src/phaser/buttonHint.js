import { createEffect } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { defaultTextStyles, shiftVInDir } from 'lib/utils.js';
import { getEffectsByHusk, getShadesAtPos } from 'lib/turf.js';

export class ButtonHint extends Phaser.GameObjects.Container {
  constructor(scene, turfId) {
    const state = useState();
    super(scene, 0, 0);
    this.s = state;
    this.turfId = turfId;
    this.hint = scene.make.text({
      text: 'press X to interact',
      style: {
        fontSize: 6 * factor + 'px',
        ...defaultTextStyles,
        align: 'center',
        wordWrap: {
          width: 8 * 6 * factor,
          useAdvancedWrap: true,
        },
      },
    });
    this.hint.setVisible(false);
    this.add(this.hint);
    this.setupEffects();
    this.scene.add.existing(this);
  }

  get t() {
    return state.ponds[this.turfId]?.ether;
  }

  setupEffects() {
    createEffect(() => {
      if (this.t) {
        const interactPos = shiftVInDir(
          vec2(this.s.player.pos),
          this.s.player.dir,
        );
        const shades = getShadesAtPos(this.t, interactPos);
        const interactable = shades.some((shade) => {
          return getEffectsByHusk(this.t, shade).fullFx.interact?.arg;
        });
        const gamePos = interactPos.scale(tileFactor);
        this.hint.setPosition(
          gamePos.x + (tileFactor / 2) - (this.hint.width / 2),
          // gamePos.x,
          gamePos.y,
        );
        this.hint.setVisible(interactable);
      } else {
        this.hint.setVisible(false);
      }
    });
  }
}
