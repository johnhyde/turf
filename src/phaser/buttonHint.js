import { createEffect } from 'solid-js';
import { useState } from 'stores/state.jsx';
import { defaultTextStyles, shiftVInDir } from 'lib/utils.js';
import { getEffectsByShade, getThingsAtPos } from 'lib/turf.js';

export class ButtonHint extends Phaser.GameObjects.Container {
  constructor(scene, turfId) {
    const state = useState();
    super(scene, 0, 0);
    this.s = state;
    this.turfId = turfId;
    this.hint = scene.make.text({
      text: 'X',
      style: {
        fontSize: 8 * factor + 'px',
        ...defaultTextStyles,
        align: 'center',
        wordWrap: {
          width: 8 * 6 * factor,
          useAdvancedWrap: true,
        },
      },
    });
    this.hint.alpha = 0.8;
    this.box = scene.make.graphics();
    this.box.fillStyle(0xbbbbbb, 0.4);
    this.box.lineStyle(1 * factor, 0xffffff, 0.7);
    this.box.fillRoundedRect(...this.roundedRect);
    this.box.strokeRoundedRect(...this.roundedRect);
    this.setVisible(false);
    this.add([this.box, this.hint]);
    this.setupEffects();
    this.scene.add.existing(this);
  }

  get t() {
    return state.ponds[this.turfId]?.ether;
  }

  get roundedRect() {
    return [
      -3 * factor,
      0,
      this.hint.width + 6 * factor,
      this.hint.height,
      3 * factor,
    ];
  }

  setupEffects() {
    createEffect(() => {
      if (this.t) {
        const interactPos = shiftVInDir(
          vec2(this.s.player.pos),
          this.s.player.dir,
        );
        const shades = getThingsAtPos(this.t, interactPos);
        const interactable = shades.some((shade) => {
          return getEffectsByShade(this.t, shade).fullFx.interact?.arg;
        });
        const gamePos = interactPos.scale(tileFactor);
        this.setPosition(
          gamePos.x + (tileFactor / 2) - (this.hint.width / 2),
          gamePos.y + this.hint.height / 2,
        );
        this.setVisible(interactable);
      } else {
        this.setVisible(false);
      }
    });
  }
}
