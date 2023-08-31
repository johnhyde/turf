import { createRoot, createEffect, on } from "solid-js";
import { useState } from 'stores/state';
import { vec2, dirs } from 'lib/utils';
import { spriteNameWithDir } from 'lib/turf';


export class Player extends Phaser.GameObjects.Container {
  constructor(scene, turfId, patp, load) {
    const state = useState();
    const turf = () => state.ponds[turfId]?.ether;
    const player = () => turf()?.players[patp];
    const pos = vec2(player()?.pos || 0).scale(tileFactor);
    super(scene, pos.x, pos.y);
    this.s = state;
    this.turf = turf;
    this.player = player;
    this.actionQueue = [];
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
    this.avatar = new Phaser.GameObjects.Container(scene, 0, 0);
    this.add(this.avatar);
    this.recreateAvatar();
    this.setInteractive({
      cursor: 'pointer',
      hitArea: new Phaser.Geom.Rectangle(),
      hitAreaCallback: CreatePixelPerfectHandler(game.textures, 255),
    });
    this.on('pointerdown', this.onClick.bind(this));
    this.on('pointermove', this.onHover.bind(this));
    this.on('pointerout', this.onLeave.bind(this));
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
    this.avatar.removeAll(true);
    
    await this.loadPlayerSprites(this.t);
    if (!(this.p && this.t)) return; // regret to inform that these might disappear while we await the above
    this.bodyImage = scene.make.image({ key: spriteNameWithDir(avatar.body.thing.formId, avatar.body.thing.form, this.p.dir, this.patp) });
    this.bodyImage.setTint(avatar.body.color);
    if (avatar.body.thing.form.variations.length < 4 && this.p.dir === dirs.LEFT) {
      this.bodyImage.setFlipX(true);
    }
    const playerOffset = vec2(avatar.body.thing.offset).add(avatar.body.thing.form.offset);
    this.bodyImage.setDisplayOrigin(playerOffset.x, playerOffset.y);
    this.bodyImage.setScale(factor);
    // this.bodyImage.setInteractive({ pixelPerfect: true, alphaTolerance: 255 });
    // this.bodyImage.on('pointerdown', this.onClick.bind(this));
    this.things = avatar.things.map((thing) => {
      const texture = spriteNameWithDir(thing.formId, thing.form, this.p.dir, this.patp);
      if (!texture) return null;
      const offset = vec2(thing.offset).add(thing.form.offset).add(playerOffset);
      const img = scene.make.image({ key: texture });
      if (thing.form.variations.length < 4 && this.p.dir === dirs.LEFT) {
        img.setFlipX(true);
      }
      img.setDisplayOrigin(offset.x, offset.y);
      img.setScale(factor);
      return img;
    }).filter(thing => !!thing);
    this.avatar.add([this.bodyImage, ...this.things]);
    this.name = scene.make.text({ text: this.patp, style: { fontSize: 8*factor + 'px', fontFamily: 'monospace', fontSmooth: 'never',
    '--webkit-font-smoothing': 'none' }});
    this.name.setDisplayOrigin(this.name.width/2 - this.bodyImage.width*factor/2, playerOffset.y*factor + this.name.height);
    this.add(this.name);
    this.ping = scene.make.text({ text: '(ping)', style: { fontSize: 4*factor + 'px', fontFamily: 'monospace', fontSmooth: 'never',
    '--webkit-font-smoothing': 'none' }});
    this.ping.setDisplayOrigin(this.ping.width/2 - this.bodyImage.width*factor/2, playerOffset.y*factor + this.name.height + this.ping.height);
    this.ping.setVisible(false);
    const dims = vec2(this.bodyImage.width, this.bodyImage.height).scale(factor);
    const cameraOffset = vec2().subtract(dims).scale(0.5).add(vec2(playerOffset).scale(factor));
    // console.log('player dims', this.bodyImage.width, this.bodyImage.height)
    scene.cameras.main.setFollowOffset(cameraOffset.x, cameraOffset.y);
  }

  preUpdate(time, dt) {
    // this.upreUpdate.super(time, dt);
    //TODO: action queue retirement here. What do the objects in the action queue look like? Currently it's required to have an absolute position. And other parts of the code need to guard us against getting our self-started actions in the action queue.
    //TODO: put some of this pond.js's pondWaves?
    // if (this.actionQueue.length > 100) { //lazy way of limiting the action queue, because I haven't had any better ideas yet.
    //   this.actionQueue = [];
    //   console.log(this.patp, this.player, "has dropped its action queue, as the queue contained more than 100 items. This generally indicates something weird is happening.");
    // }
    // while(this.actionQueue[0]?.type == "face") { //TODO: handle face turns in sequence.
    //   this.actionQueue.shift();
    // }
    if (this.depth !== this.tilePos.y) {
      this.setDepth(this.tilePos.y + 0.5);
    }
    const speed = 170*factor;
    let justMoved = false;
    // let targetPos = vec2( this.actionQueue.length? this.actionQueue[0].arg.pos : this.tilePos ).scale(tileFactor);
    let targetPos = vec2(this.tilePos).scale(tileFactor);
    this.dPos = this.dPos || vec2(this.x, this.y);
    if (this.dPos.equals(targetPos)) {
      // this.actionQueue.shift(); //Remove the item from the action queue
    } else { //just move like regular
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
  }

  onClick(pointer) {
    console.log('clicked on', this.patp);
    if (this.ping && this.p) {
      this.s.pingPlayer(this.patp);
      this.ping.setText('pinged!');
      this.ping.setDisplayOrigin(this.ping.width/2 - this.bodyImage.width*factor/2, this.ping.displayOriginY);
    }
  }

  onHover(pointer) {
    console.log('hovered over', this.patp)
    if (!this.isUs && !this.list.includes(this.ping)) {
      this.add(this.ping);
      this.ping.setVisible(true);
    }
  }
  
  onLeave(pointer) {
    console.log('left', this.patp)
    this.ping.setVisible(false);
    this.remove(this.ping);
    this.ping.setText('(ping)');
    this.ping.setDisplayOrigin(this.ping.width/2 - this.bodyImage.width*factor/2, this.ping.displayOriginY);
  }

  // todo: adapt this code from https://github.com/photonstorm/phaser/issues/4492

  destroy(fromScene) {
    if (this.dispose) this.dispose();
    super.destroy(fromScene);
  }
}


function CreatePixelPerfectHandler (textureManager, alphaTolerance) {
  function pixelPerfectHitTest (hitArea, x, y, gameObject) {
    // if this gameObject has a texture and a frame, then it is something we can query for pixels - so do it and return the result
    if (gameObject.texture && gameObject.frame) {
      const alpha = textureManager.getPixelAlpha(x, y, gameObject.texture.key, gameObject.frame.name)
      return (alpha && alpha >= alphaTolerance)
    }

    // see if the gameObject might be a Container, and if it is, check the children looking for a hit
    if (gameObject.list) {
      for (const child of gameObject.list) {
        const isName = child instanceof Phaser.GameObjects.Text;
        let childX = x/child.scale + child.displayOriginX;
        if (child.flipX) {
          childX = child.width - childX;
        }
        childX = Math.floor(childX);
        let childY = y/child.scale + child.displayOriginY;
        if (child.flipY) {
          childY = child.height - childY;
        }
        childY = Math.floor(childY);
        if (isName) {
          const rect = new Phaser.Geom.Rectangle(0, 0, child.width, child.height);
          if (Phaser.Geom.Rectangle.Contains(rect, childX, childY, child)) return true;
        } else if (pixelPerfectHitTest(hitArea, childX, childY, child)) {
          return true
        }
      }
    }

    // we could find nothing that was hit
    return false
  }

  return pixelPerfectHitTest
}