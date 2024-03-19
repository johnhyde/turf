import { spriteName, getForm } from 'lib/turf';

export class Shade extends Phaser.GameObjects.Image {
  constructor(scene, shade, turf, indexDepthMod) {
    const huskPos = vec2(shade.pos).scale(tileFactor);
    super(scene, huskPos.x, huskPos.y, spriteName(turf.id, shade.formId, shade.variation));
    let form = getForm(turf, shade.formId);
    if (!form) {
      this.destroy();
    } else {
      this.depthMod = 0;
      this.indexDepthMod = indexDepthMod;
      this.offset = vec2(form.offset).add(vec2(shade.offset));
      this.setDisplayOrigin(this.offset.x, this.offset.y);
      this.updateDepth();
      this.setScale(factor);
    }
  }

  updateDepth() {
    this.setDepth(this.y/tileFactor + this.depthMod + this.indexDepthMod);
  }

  setPosition(...args) {
    super.setPosition(...args);
    this.updateDepth();
    // this.parentContainer?.sort?.('depth'); // this is done in initShades in game.js
  }
}
