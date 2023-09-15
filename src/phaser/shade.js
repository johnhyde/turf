import { spriteName } from 'lib/turf';

export class Shade extends Phaser.GameObjects.Image {
  constructor(scene, shade, turf, add = true) {
    const huskPos = vec2(shade.pos).scale(tileFactor);
    super(scene, huskPos.x, huskPos.y, spriteName(shade.formId, shade.variation));
    let form = turf.skye[shade.formId];
    if (!form) {
      // this.destroy();
      return undefined;
    } else {
      this.offset = vec2(form.offset).add(vec2(shade.offset));
      this.setDisplayOrigin(this.offset.x, this.offset.y);
      this.setDepth(shade.pos.y);
      this.setScale(factor);
      if (add) {
        this.scene.add.existing(this);
      }
    }
  }
}
