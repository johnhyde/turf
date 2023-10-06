import { createRoot, createEffect, createSignal, on } from "solid-js";
import { useState } from 'stores/state';
import isEqual from 'lodash/isEqual';
import { vec2, roundV, dirs, sleep, intToHex, jClone } from 'lib/utils';
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
    this.speechBubbleText = ""; //This variable is probably redundant, and could be removed, assigning directly to speechBubbleTextContainer.text instead. However, when I tried this once, it mysteriously broke.
    this.speechBubbleMillisecondsElapsed = 0;
    this.tilePos = vec2(player().pos);
    this.oldTilePos = vec2(player().pos);
    this.patp = patp;
    this.isUs = patp === our;
    if (this.isUs) {
      this.keys = {
        ...scene.input.keyboard.createCursorKeys(),
        ...scene.input.keyboard.addKeys({ w: 'W', a: 'A', s: 'S', d: 'D' }),
      };
      scene.cameras.main.startFollow(this);
    }
    this.loadPlayerSprites = load;
    this.avatar = new Phaser.GameObjects.Container(scene, 0, 0);
    this.add(this.avatar);
    const [walking, $walking] = createSignal(false);
    this.walking = walking, this.$walking = $walking;
    const [apparentDir, $apparentDir] = createSignal(null);
    this.apparentDir = apparentDir, this.$apparentDir = $apparentDir;
    this.setInteractive({
      cursor: 'pointer',
      hitArea: new Phaser.Geom.Rectangle(),
      hitAreaCallback: CreatePixelPerfectHandler(game.textures, 255),
    });
    this.on('pointerdown', this.onClick.bind(this));
    this.on('pointermove', this.onHover.bind(this));
    this.on('pointerout', this.onLeave.bind(this));
    this.recreateAvatar().then(() => {
      this.updateAnims();
      this.setupEffects();
      this.scene.add.existing(this);
    });
  }

  get t() {
    return this.turf();
  }

  get p() {
    return this.player();
  }

  get dir() {
    return this.apparentDir() ?? this.p?.dir;
  }

  setupEffects() {
    createRoot((dispose) => {
      this.dispose = dispose;
      createEffect(() => {
        let pos = this.p?.pos;
        if (pos) {
          // make sure to use x and y so solid knows to track them
          // we aren't tracking player, so that's no help
          // console.log('new player pos', pos.x, pos.y)
          this.tilePos = vec2(pos.x, pos.y)
        }
      });
      createEffect((lastColor) => {
        const color = this.p?.avatar.body.color;
        if (this.bodyImage && color && lastColor !== color) {
          if (game.renderer.type === Phaser.CANVAS) {
            this.recreateAvatar();
          } else {
            this.bodyImage.setTint(color);
          }
        }
        return color;
      });
      createEffect(on(() => {
        if (!this.p) return null;
        return [this.dir, this.walking()];
      }, async () => {
        if (this.p?.avatar) {
          await sleep(0);
          setTimeout(this.updateAnims.bind(this),0);
        }
      }));
      createEffect(on(() => {
        if (!this.p) return null;
        return jClone([this.p.avatar.body.thing, this.p.avatar.things]);
      }, async (input, prevInput) => {
        if (this.p?.avatar && !isEqual(input, prevInput)) {
          await this.recreateAvatar();
          this.updateAnims();
        }
      }, { defer: true }));
    })
  }

  async recreateAvatar() {
    if (!(this.p && this.t)) return;
    const avatar = this.p.avatar;
    
    await this.loadPlayerSprites(this.t);
    if (!(this.p && this.t)) return; // regret to inform that these might disappear while we await the above
    this.avatar.removeAll(true);
    const frameRate = 7;
    const bodyDirs = [0, 1, 2, 3].map((dir) => spriteNameWithDir(this.t.id, avatar.body.thing.formId, avatar.body.thing.form, dirs[dir], this.patp));
    this.bodyImage = scene.make.sprite({ key: bodyDirs[dirs[this.dir]], frame: 0 });
    this.bodyImage.thing = avatar.body.thing;
    if (avatar.body.thing.form.variations.length < 4 && this.dir === dirs.LEFT) {
      this.bodyImage.setFlipX(true);
    }
    bodyDirs.forEach((key, i) => {
      this.bodyImage.anims.create({
        key: dirs[i],
        frames: key,
        repeat: -1,
        frameRate,
      });
    });
    const playerOffset = vec2(avatar.body.thing.offset).add(avatar.body.thing.form.offset);
    this.bodyImage.setDisplayOrigin(playerOffset.x, playerOffset.y);
    this.bodyImage.setScale(factor);
    this.bodyImage.preDestroy = preDestroy;
    this.bodyImage.setTint(avatar.body.color);
    this.things = avatar.things.map((thing) => {
      const spriteDirs = [0, 1, 2, 3].map((dir) => spriteNameWithDir(this.t.id, thing.formId, thing.form, dirs[dir], this.patp));
      const offset = vec2(thing.offset).add(thing.form.offset).add(playerOffset);
      const defaultDir = spriteDirs.filter(key => key)[0];
      const sprite = scene.make.sprite({ key: spriteDirs[dirs[this.dir]] || defaultDir });
      if (!spriteDirs[dirs[this.dir]]) sprite.setVisible(false);
      sprite.thing = thing;
      sprite.preDestroy = preDestroy;
      if (thing.form.variations.length < 4 && this.dir === dirs.LEFT) {
        sprite.setFlipX(true);
      }
      spriteDirs.forEach((key, i) => {
        if (!key) return;
        let frameKeys = Object.keys(game.textures.get(key).frames);
        const frames = frameKeys.map((frame) => { return { key, frame }}).filter(({ frame }) => frame !== '__BASE');
        sprite.anims.create({
          key: dirs[i],
          frames,
          repeat: -1,
          frameRate,
        });
      });
      sprite.setDisplayOrigin(offset.x, offset.y);
      sprite.setScale(factor);
      return sprite;
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
    /* Make speech bubble */
    this.speechBubble = scene.add.image(0, 0, "speech-bubble").setScale(factor);
    const bubblePos = roundV(vec2(this.bodyImage.width*1.3, -this.bodyImage.height/2)).scale(factor);
    this.speechBubbleContainer = new Phaser.GameObjects.Container(scene, bubblePos.x, bubblePos.y);
    this.speechBubbleContainer.add(this.speechBubble);
    this.speechBubbleContainer.setDepth(100);
    this.add(this.speechBubbleContainer);
    this.speechBubble.setVisible(true);
    this.speechBubbleTextDisplay = scene.make.text({ text: this.speechBubbleText, style: { align: "left", fontSize: 4*factor + 'px', fontFamily: 'monospace', fontSmooth: 'never', '--webkit-font-smoothing': 'none', color: "black", wordWrap: { width: this.speechBubble.width*factor - 4*factor, useAdvancedWrap: true } } }); //the 4*factor is just an arbitrary, hand-tuned margin for the speech bubble outline width.
    this.speechBubbleTextDisplay.setMaxLines(4)
    this.speechBubbleTextDisplay.setOrigin(0.5, 0.5);
    this.speechBubbleTextDisplay.setVisible(true);
    this.speechBubbleTextDisplay.setDepth(this.speechBubble.depth+1);
    this.speechBubbleContainer.add(this.speechBubbleTextDisplay);
    /* Scaling and dimensions of camera stuff */
    const dims = vec2(this.bodyImage.width, this.bodyImage.height).scale(factor);
    const cameraOffset = vec2().subtract(dims).scale(0.5).add(vec2(playerOffset).scale(factor));
    scene.cameras.main.setFollowOffset(cameraOffset.x, cameraOffset.y);
  }

  updateAnims() {
    if (this.p) {
      this.avatar.list.forEach((sprite) => {
        if (sprite.anims) {
          const newAnim = sprite.anims.get(this.dir);
          const curAnim = sprite.anims.currentAnim;
          if (newAnim) {
            sprite.setVisible(true);
            if (newAnim !== curAnim) {
              sprite.play(this.dir);
            }
            if (this.walking()) {
              if (sprite.anims && !sprite.anims.isPlaying) {
                sprite.anims.resume(newAnim?.getFrameAt(1));
              }
            } else {
              if (sprite.anims.isPlaying) {
                sprite.anims.pause(newAnim?.getFrameAt(0));
              }
            }
          } else {
            sprite.setVisible(false);
          }
        }
        if (sprite.setFlipX){
          if (sprite.thing?.form.variations.length < 4 && this.dir === dirs.LEFT) {
            sprite.setFlipX(true);
          } else {
            sprite.setFlipX(false);
          }
        }
      });
    }
  }

  stand() {
    if (this.walking()) {
      this.$walking(false);
    }
  }

  walk() {
    if (!this.walking()) {
      this.$walking(true);
    }
  }

  speakBubble(textToSpeak) {
    this.speechBubbleText = textToSpeak;
    this.speechBubbleMillisecondsElapsed = 0;
  }

  preUpdate(time, dt) {
    if (!game.input.keyboard.enabled && this.keys) {
      Object.values(this.keys).forEach(k => k.reset());
    }
    //Action queue retirement here. The objects in the action queue are just grits. The code that fills the actionQueue is the event handlers, window.addEventListener lines in game.js:startPhaser. These trigger only on confirmed events. So, the point is that this is a little sneaky side-state that only applies to the presentation, to avoid additional bookkeeping requirements the presentation doesn't need.
    if (this.actionQueue.length > 100) { //lazy way of limiting the action queue, because I haven't had any better ideas yet.
      this.actionQueue = [];
      console.log(this.patp, this.player, "has dropped its action queue, as the queue contained more than 100 items. This generally indicates something weird is happening.");
    }
    while(this.actionQueue[0]?.type === "face") {
      this.$apparentDir(this.actionQueue[0].arg.dir);
      this.actionQueue.shift();
    }
    if (this.depth !== this.tilePos.y) {
      this.setDepth(this.tilePos.y + 0.5);
    }
    const speed = 170*factor;
    let justMoved = false;
    let targetPos = () => vec2( this.actionQueue.length? this.actionQueue[0].arg.pos : this.tilePos ).scale(tileFactor);
    this.dPos = this.dPos || vec2(this.x, this.y);
    if (this.dPos.equals(targetPos())) {
      this.actionQueue.shift(); //Remove the item from the action queue
    }
    if (!this.dPos.equals(targetPos())) {
      //just move like regular
      const dif = vec2(targetPos()).subtract(this.dPos);
      let step = speed * dt / 1000;
      if (step > dif.length()) {
        this.dPos = vec2(targetPos());
        this.setPosition(targetPos().x, targetPos().y);
      } else {
        const change = vec2(dif).normalize().scale(step);
        this.dPos.add(change);
        this.setPosition(Math.round(this.dPos.x), Math.round(this.dPos.y));
      }
      justMoved = true;
    }

    if (this.isUs) {
      const newTilePos = vec2(this.tilePos);
      let newDir;
      if (this.dPos.equals(targetPos()) && this.actionQueue.length === 0) {
        if (this.keys.left.isDown || this.keys.a.isDown) {
          newDir = dirs.LEFT;
          newTilePos.x--;
        }
        if (this.keys.right.isDown || this.keys.d.isDown) {
          newDir = dirs.RIGHT;
          newTilePos.x++;
        }
        if (this.keys.up.isDown || this.keys.w.isDown) {
          newDir = dirs.UP;
          newTilePos.y--;
        }
        if (this.keys.down.isDown || this.keys.s.isDown) {
          newDir = dirs.DOWN;
          newTilePos.y++;
        }
        const tilePosChanged = !newTilePos.equals(this.tilePos);
        
        if (newDir && newDir !== this.dir && !this.turning) {
          this.$apparentDir(null); //clear the apparentDir so it doesn't mess with the manual control.
          this.turning = true;
          this.s.setDir(newDir);
          setTimeout(() => {
            this.turning = false;
          }, 50)
        }
        if (tilePosChanged && (!this.turning || justMoved)) {
          this.s.setPos(newTilePos);
          justMoved = true;
        }
      }
    }
    if (justMoved) {
      this.walk();
    } else {
      this.stand();
    }

    if (this.speechBubbleTextDisplay) {
      this.speechBubbleMillisecondsElapsed += dt;
      this.speechBubbleTextDisplay.text = this.speechBubbleText; //this copy is hopefully optimized out, since maybe these are the same pointer behind the scenes
      const messageTime = Math.min(10000, 1000 + (this.speechBubbleText.length * 250));
      const showSpeechBubbleNow = (this.speechBubbleText != "" && this.speechBubbleMillisecondsElapsed < messageTime);
      this.speechBubbleContainer.setVisible(showSpeechBubbleNow);
    }
  }

  moveTo(pos) {
    if (this.isUs) {
      let targetPos = () => vec2( this.actionQueue.length? this.actionQueue[0].arg.pos : this.tilePos ).scale(tileFactor);
      this.dPos = this.dPos || vec2(this.x, this.y);
      if (this.dPos.equals(targetPos()) && this.actionQueue.length === 0) {
        const newTilePos = vec2(this.tilePos);
        let newDir;
        if (pos.x < this.tilePos.x) {
          newDir = dirs.LEFT;
          newTilePos.x--;
        }
        if (pos.x > this.tilePos.x) {
          newDir = dirs.RIGHT;
          newTilePos.x++;
        }
        if (pos.y < this.tilePos.y) {
          newDir = dirs.UP;
          newTilePos.y--;
        }
        if (pos.y > this.tilePos.y) {
          newDir = dirs.DOWN;
          newTilePos.y++;
        }
        if (!newTilePos.equals(this.tilePos)) {
          if (newDir && newDir !== this.dir) {
            this.s.setDir(newDir);
          }
          this.s.setPos(newTilePos);
        }
      }
    }
  }

  onClick(pointer) {
    console.log('clicked on', this.patp);
    if (this.ping && this.p && !this.isUs) {
      this.s.pingPlayer(this.patp);
      this.ping.setText('pinged!');
      this.ping.setDisplayOrigin(this.ping.width/2 - this.bodyImage.width*factor/2, this.ping.displayOriginY);
    }
  }

  onHover(pointer) {
    if (!this.isUs && !this.list.includes(this.ping)) {
      this.add(this.ping);
      this.ping.setVisible(true);
    }
  }
  
  onLeave(pointer) {
    if (!this.isUs) {
      this.ping.setVisible(false);
      this.remove(this.ping);
      this.ping.setText('(ping)');
      this.ping.setDisplayOrigin(this.ping.width/2 - this.bodyImage.width*factor/2, this.ping.displayOriginY);
    }
  }

  preDestroy(fromScene) {
    if (this.dispose) this.dispose();
    super.preDestroy(fromScene);
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
        const isName = child instanceof Phaser.GameObjects.Text;
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

function preDestroy() {
  this.anims.destroy();
  this.anims = undefined;
  this.ignoreDestroy = true;
}
