import { createRoot, createEffect, on } from "solid-js";
import { useState } from 'stores/state';
import { vec2, dirs } from 'lib/utils';
import { spriteNameWithDir } from 'lib/turf';


export class Player extends Phaser.GameObjects.Container {
  constructor(scene, turfId, patp, load) {
    const state = useState();
    const turf = () => state.ponds[turfId]?.ether;
    const player = () => turf()?.players[patp];
    const pos = vec2(player()?.pos || 0).scale(32);
    super(scene, pos.x, pos.y);
    this.s = state;
    this.turf = turf;
    this.player = player;
    this.tilePos = vec2(player().pos);
    this.oldTilePos = vec2(player().pos);
    this.patp = patp;
    this.isUs = patp === our;
    if (this.isUs) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.keys = scene.input.keyboard.addKeys({ w: 'W', a: 'A', s: 'S', d: 'D' });
      scene.cameras.main.startFollow(this);
    }
    this.loadPlayerSprites = load;
    this.recreateAvatar();
    this.setupEffects();
    this.addToUpdateList();
    // this.scene.events.on('update', (time, delta) => { this.update(time, delta)} );
    this.scene.add.existing(this);
  }

  get t() {
    return this.turf();
  }

  get p() {
    return this.player();
  }

  setupEffects() {
    createRoot((dispose) => {
      this.dispose = dispose;
      createEffect(() => {
        let pos = this.p?.pos;
        if (pos) {
          // make sure to use x and y so solid knows to track them
          // we aren't tracking player, so that's no help
          console.log('new player pos', pos.x, pos.y)
          this.tilePos = vec2(pos.x, pos.y)
        }
      });
      createEffect((lastColor) => {
        const color = this.p?.avatar.body.color;
        if (this.bodyImage && color && lastColor !== color) {
          this.bodyImage.setTint(color);
        }
        return color;
      });
      createEffect(on(() => {
        if (!this.p) return null;
        return JSON.stringify([this.p.dir, this.p.avatar.body.thing, this.p.avatar.things]);
      }, async () => {
        if (this.p?.avatar) {
          this.recreateAvatar();
        }
      }, { defer: true }));
    })
  }

  async recreateAvatar() {
    if (!(this.p && this.t)) return;
    const avatar = this.p.avatar;
    this.removeAll(true);
    if (this.name) this.name.remove();
    this.name = document.createElement('span');
    this.name.textContent = this.patp;
    this.name.className = 'absolute font-mono font-bold text-md text-white leading-none translate-x-[-50%] translate-y-[-100%]'
    this.positionName();
    document.body.appendChild(this.name);
    
    await this.loadPlayerSprites(this.t);
    this.bodyImage = scene.make.image({ key: spriteNameWithDir(avatar.body.thing.formId, avatar.body.thing.form, this.p.dir, this.patp) });
    this.bodyImage.setTint(avatar.body.color);
    if (avatar.body.thing.form.variations.length < 4 && this.p.dir === dirs.LEFT) {
      this.bodyImage.setFlipX(true);
    }
    const playerOffset = vec2(avatar.body.thing.offset).add(avatar.body.thing.form.offset);
    this.bodyImage.setDisplayOrigin(playerOffset.x, playerOffset.y);
    this.things = avatar.things.map((thing) => {
      const texture = spriteNameWithDir(thing.formId, thing.form, this.p.dir, this.patp);
      if (!texture) return null;
      const offset = vec2(thing.offset).add(thing.form.offset).add(playerOffset);
      const img = scene.make.image({ key: texture });
      if (thing.form.variations.length < 4 && this.p.dir === dirs.LEFT) {
        img.setFlipX(true);
      }
      img.setDisplayOrigin(offset.x, offset.y);
      return img;
    }).filter(thing => !!thing);
    this.add([this.bodyImage, ...this.things]);
    this.positionName();
    // this.name = scene.make.text({ text: this.patp, style: { fontSize: '8px', fontFamily: 'monospace', fontSmooth: 'never',
    // '--webkit-font-smoothing': 'none' }});
    // this.name.setDisplayOrigin(this.name.width/2 - this.bodyImage.width/2, playerOffset.y + this.name.height);
    // this.add(this.name);
    const dims = vec2(this.bodyImage.width, this.bodyImage.height);
    const cameraOffset = vec2().subtract(dims).scale(0.5).add(playerOffset);
    // console.log('player dims', this.bodyImage.width, this.bodyImage.height)
    scene.cameras.main.setFollowOffset(cameraOffset.x, cameraOffset.y);
  }

  preUpdate(time, dt) {
    // this.upreUpdate.super(time, dt);
    if (this.depth !== this.tilePos.y) {
      this.setDepth(this.tilePos.y + 0.5);
    }
    const speed = 170;
    let justMoved = false;
    let targetPos = vec2(this.tilePos).scale(32);
    this.dPos = this.dPos || vec2(this.x, this.y);
    if (!this.dPos.equals(targetPos)) {
      const dif = vec2(targetPos).subtract(this.dPos);
      let step = speed * dt / 1000;
      // step =  Phaser.Math.Interpolation.SmoothStep(Math.min(dif.length, 100)/8, 0.2 * step, step);
      if (step > dif.length()) {
        this.dPos = vec2(targetPos);
        this.setPosition(targetPos.x, targetPos.y);
      } else {
        const change = vec2(dif).normalize().scale(step);
        // this.x += change.x;
        // this.y += change.y;
        this.dPos.add(change);
        this.setPosition(Math.round(this.dPos.x), Math.round(this.dPos.y));
      }
      justMoved = true;
    }

    if (this.isUs) {
      const newTilePos = vec2(this.tilePos);
      let newDir;
      if (this.dPos.equals(targetPos)) {
        if (this.cursors.left.isDown || this.keys.a.isDown) {
          newDir = dirs.LEFT;
          newTilePos.x--;
        }
        if (this.cursors.right.isDown || this.keys.d.isDown) {
          newDir = dirs.RIGHT;
          newTilePos.x++;
        }
        if (this.cursors.up.isDown || this.keys.w.isDown) {
          newDir = dirs.UP;
          newTilePos.y--;
        }
        if (this.cursors.down.isDown || this.keys.s.isDown) {
          newDir = dirs.DOWN;
          newTilePos.y++;
        }
        const tilePosChanged = !newTilePos.equals(this.tilePos);
        
        if (newDir && newDir !== this.p.dir && this.dir !== 'turning') {
          this.dir = 'turning';
          this.s.setDir(newDir);
          setTimeout(() => {
            this.dir = this.p.dir;
          }, 50)
          // this.s.setDir(newDir);
        }
        if (tilePosChanged && (this.dir !== 'turning' || justMoved)) {
          // console.log('changed!');
          // this.s.setDir(getDirFromVec(vec2(newTilePos).subtract(this.tilePos)));
          this.s.setPos(newTilePos);
        }
      }
    }
    justMoved = false;
    setTimeout(() => this.positionName(), 0);
  }

  positionName() {
    const wv = scene.cameras.main.worldView;
    const bodyOffset = this.bodyImage ? vec2(this.bodyImage.displayOriginX, this.bodyImage.displayOriginY) : vec2(0);
    const centerOffset = this.bodyImage ? vec2(this.bodyImage.width/2, 0) : vec2(16, 0);
    const canvasOffset = vec2(shell.offsetLeft, shell.offsetTop);
    const globalPos = vec2(this.x, this.y).subtract(bodyOffset).add(centerOffset).subtract(vec2(wv.x, wv.y)).scale(1/this.s.scale).add(canvasOffset);
    this.name.style.left = globalPos.x + 'px';
    this.name.style.top = globalPos.y + 'px';
  }

  destroy(fromScene) {
    if (this.dispose) this.dispose();
    if (this.name) this.name.remove();
    super.destroy(fromScene);
  }
}
