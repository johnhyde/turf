import { spriteName } from 'lib/turf';

export class Shade extends Phaser.GameObjects.Image {
  constructor(scene, shade, turf, add = true) {
    const huskPos = vec2(shade.pos).scale(turf.tileSize.x);
    super(scene, huskPos.x, huskPos.y, spriteName(shade.formId, shade.variation));
    let form = turf.skye[shade.formId];
    this.setDisplayOrigin(form.offset.x, form.offset.y);
    this.setDepth(shade.pos.y);
    // this.addToUpdateList();
    if (add) {
      this.scene.add.existing(this);
    }
  }
}
