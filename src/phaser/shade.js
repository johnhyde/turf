import { jClone } from 'lib/utils.js';
import { getForm, getSpriteFps, spriteName } from 'lib/turf.js';

export class Shade extends Phaser.GameObjects.Sprite {
  constructor(scene, shade, turf, indexDepthMod) {
    const huskPos = vec2(shade.pos).scale(tileFactor);
    super(
      scene,
      huskPos.x,
      huskPos.y,
      spriteName(turf.id, shade.formId, shade.variation),
    );
    this.turf = turf;
    this.shade = jClone(shade);
    this.form = getForm(turf, shade.formId);
    if (!this.form) {
      this.destroy();
    } else {
      this.depthMod = 0;
      this.indexDepthMod = indexDepthMod;
      this.offset = vec2(this.form.variations[shade.variation]?.offset).add(
        vec2(shade.offset),
      );
      this.setDisplayOrigin(this.offset.x, this.offset.y);
      this.updateDepth();
      this.setScale(factor);
      this.form.variations.forEach((v, i) => {
        if (typeof v.sprite !== 'string') {
          this.anims.create({
            key: i.toString(),
            frames: spriteName(turf.id, shade.formId, i),
            repeat: v.sprite.type === 'once' ? 1 : -1,
            frameRate: getSpriteFps(v.sprite), // todo: parameterize time framerate
          });
        }
      });
      this.updateVariation(shade.variation);
    }
  }

  updateDepth() {
    this.setDepth(this.y / tileFactor + this.depthMod + this.indexDepthMod);
  }

  updateVariation(varI) {
    this.shade.variation = varI;
    const variation = this.form.variations[varI];
    this.offset = vec2(variation?.offset).add(
      vec2(this.shade.offset),
    );
    this.setDisplayOrigin(this.offset.x, this.offset.y);
    const animId = varI.toString();
    if (this.anims.get(animId)) {
      this.play(animId);
    } else {
      this.stop();
      this.setTexture(spriteName(this.turf.id, this.shade.formId, varI));
    }
    if (variation?.tint != null) {
      this.setTint(variation.tint);
    } else {
      this.clearTint();
    }
  }

  setPosition(...args) {
    super.setPosition(...args);
    this.updateDepth();
    // this.parentContainer?.sort?.('depth'); // this is done in initShades in game.js
  }
}
