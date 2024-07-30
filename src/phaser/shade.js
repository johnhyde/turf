import { hexToInt, jClone } from 'lib/utils.js';
import { getForm, getSpriteFps, spriteName } from 'lib/turf.js';
import { moveTheThing } from './move.js';

export class Shade extends Phaser.GameObjects.Sprite {
  constructor(scene, shade, id, turf, indexDepthMod) {
    const huskPos = vec2(shade.pos).scale(tileFactor);
    super(
      scene,
      huskPos.x,
      huskPos.y,
      spriteName(turf.id, shade.formId, shade.variation),
    );
    this.turf = turf;
    this.shade = jClone(shade);
    this.ord = id != null ? (id || 0) % 10 : null;
    this.form = getForm(turf, shade.formId);
    this.tilePos = vec2(shade.pos);
    if (!this.form) {
      this.destroy();
    } else {
      this.actionQueue = [];
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
      this.varyVariation(shade.variation);
      // this.glow = this.postFX.addGlow(0xffffff);
      // this.setGlowActive(false);
    }
  }

  preUpdate(time, dt) {
    super.preUpdate(time, dt);
    // if (Math.random() > 0.7) {
    if (this.ord != null && frameCount % 10 === this.ord) {
      const cam = this.scene.cameras.main;
      this.setVisible(
        !(this.x + 2 * this.displayWidth < cam.worldView.x ||
          this.x - this.displayWidth > cam.worldView.x + cam.worldView.width ||
          this.y + 2 * this.displayHeight < cam.worldView.y ||
          this.y - this.displayHeight > cam.worldView.y + cam.worldView.height),
      );
    }
    moveTheThing(this, dt, () => {}, this.setPosition.bind(this));
  }

  updateDepth() {
    // console.log(
    //   `this.y ${this.y} / tileFactor + this.depthMod ${this.depthMod} + this.indexDepthMod ${this.indexDepthMod}`,
    // );
    this.setDepth(this.y / tileFactor + this.depthMod + this.indexDepthMod);
    standNeedsSort = true;
  }

  seemVariation(varI) {
    this.seem = varI;
    this.updateVariation();
  }

  varyVariation(varI) {
    this.shade.variation = varI;
    this.seem = null;
    this.updateVariation();
  }

  updateVariation() {
    const varI = this.seem ?? this.shade.variation;
    const variation = this.form.variations[varI];
    const animId = varI.toString();
    if (this.anims.get(animId)) {
      this.play(animId);
    } else {
      this.stop();
      this.setTexture(spriteName(this.turf.id, this.shade.formId, varI));
    }
    this.offset = vec2(variation?.offset).add(
      vec2(this.shade.offset),
    );
    this.setDisplayOrigin(this.offset.x, this.offset.y);
    if (variation?.tint != null) {
      this.setTint(variation.tint);
    } else {
      this.clearTint();
    }
  }

  setTilePos(...args) {
    this.tilePos = vec2(...args);
  }

  setPosition(...args) {
    super.setPosition(...args);
    this.updateDepth();
    // this.parentContainer?.sort?.('depth'); // this is done in initShades in game.js
  }

  setGlowActive(active) {
    if (this.scene.game.renderer.type === Phaser.WEBGL) {
      if (active) {
        if (!this.glow) {
          this.glow = this.postFX.addGlow(0xfffc99);
        }
      } else if (this.glow) {
        this.postFX.remove(this.glow);
        this.glow = null;
      }
    }
  }

  setSelected(color) {
    if (this.scene.game.renderer.type === Phaser.WEBGL) {
      const active = color != null;
      if (active) {
        if (!this.selectGlow) {
          this.selectGlow = this.postFX.addGlow(color);
        }
        this.selectGlow.color = color;
      } else if (this.selectGlow) {
        this.postFX.remove(this.selectGlow);
        this.selectGlow = null;
      }
    }
  }
}
