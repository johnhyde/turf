import { createRoot, createEffect, on } from "solid-js";
import { useState } from 'stores/state';
import { vec2, dirs, pixelsToTiles } from 'lib/utils';
import { isInTurf } from 'lib/turf';
import { Shade } from "./shade";


export class Preview extends Phaser.GameObjects.Container {
  constructor(scene, turfId) {
    const state = useState();
    const turf = () => state.ponds[turfId]?.ether;
    super(scene, 0, 0);
    this.s = state;
    this.turf = turf;
    this.shade = null;
    this.setDepth(Number.MAX_SAFE_INTEGER); // lol
    this.setupEffects();
    this.addToUpdateList();
    this.scene.add.existing(this);
  }

  get t() {
    return this.turf();
  }

  setupEffects() {
    createRoot((dispose) => {
      this.dispose = dispose;
      createEffect(() => {
        const editor = this.s.editor;
        this.removeAll(true)
        if ((editor.editing && editor.brush && editor.selectedFormId) || this.s.portalToPlace) {
          const shadeDef = {
            formId: this.s.portalToPlace ? '/portal' : editor.selectedFormId,
            variation: 0,
            pos: vec2(),
          }
          this.shade = new Shade(this.scene, shadeDef, this.turf(), true);
          this.shade.setAlpha(0.8);
          this.add([this.shade]);
        } else {
          this.shade = null;
        }
      });
    })
  }

  updatePointer(pointer) {
    const tileSize = this.turf().tileSize.x;
    const tilePos = pixelsToTiles(vec2(pointer.worldX, pointer.worldY), tileSize);
    const pos = vec2(tilePos).scale(tileFactor);
    this.setX(pos.x);
    this.setY(pos.y);
    const cam = this.scene.cameras.main;
    const nextX = pointer.x + (pointer.x - pointer.prevPosition.x);
    const nextY = pointer.y + (pointer.y - pointer.prevPosition.y);
    const onEdge = nextX < 2 || nextY < 2 || nextX > cam.width-2 || nextY > cam.height-2;
    if (!onEdge && isInTurf(this.turf(), tilePos)) {
      this.setVisible(true);
    } else {
      this.setVisible(false);
    }
  }

  destroy(fromScene) {
    if (this.dispose) this.dispose();
    super.destroy(fromScene);
  }
}