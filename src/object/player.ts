import "phaser";
import gameOptions from "../gameOptions";

class Player extends Phaser.Physics.Arcade.Sprite {
  speed: number;
  initialX: number;
  currentMsPerFrame: number;

  constructor(scene: Phaser.Scene, x, y) {
    super(scene, x, y, "player");

    this.initialX = x;
    this.currentMsPerFrame = 255;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setGravityY(gameOptions.playerGravity);
    this.setFriction(0, 0);
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.x = this.initialX;

    if (!this.speed && this.anims.getCurrentKey() !== "idle") {
      this.anims.play("idle");
    } else if (
      this.speed &&
      this.body.touching.down &&
      this.anims.getCurrentKey() !== "run"
    ) {
      this.anims.play("run");
    }

    if (this.anims.getCurrentKey() === "run") {
      if (this.speed) {
        const tempMsPerFrame = Math.floor(
          Phaser.Math.Clamp(255 - this.speed * 0.2, 30, 600)
        );

        if (this.currentMsPerFrame != tempMsPerFrame && Math.abs(this.currentMsPerFrame - tempMsPerFrame) >= 15) {
          if(Math.abs(this.currentMsPerFrame - this.anims.msPerFrame) >= 15) {
            this.anims.msPerFrame = tempMsPerFrame;
          }
          this.currentMsPerFrame = tempMsPerFrame;
        }
      } else {
        this.anims.stop();
      }
    }
  }

  jump() {
    if (this.body.touching.down) {
      this.setVelocityY(-gameOptions.jumpForce);
    }
  }

  die() {
    this.setVelocityY(-200);
  }
}

export default Player;
