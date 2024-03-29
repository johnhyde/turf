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
        const brushing = !!(editor.editing && editor.brush && editor.selectedFormId !== null);
        const placing = !!(editor.huskToPlace);
        let placingShade = null;
        if (placing) {
          if (typeof editor.huskToPlace.shade === 'object') {
            placingShade = editor.huskToPlace.shade;
          } else {
            placingShade = this.turf().cave[editor.huskToPlace.shade];
          }
        } 
        this.removeAll(true)
        if (this.turf() && (brushing || placing)) {
          const formId = placing ? placingShade?.formId || '/portal' : editor.selectedFormId;
          const shadeDef = {
            formId,
            variation: placing ? (placingShade?.variation || 0) : 0,
            pos: vec2(),
          };
          if (!shadeDef.formId) return;
          this.shade = new Shade(this.scene, shadeDef, this.turf());
          if (!this.shade.active) return;
          this.shade.setAlpha(0.7);
          this.add([this.shade]);
        } else {
          this.shade = null;
        }
      });
    })
  }

  updatePointer(pointer) {
    if (!this.turf()) return;
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
