import "phaser";
import GameOption from "./gameOptions";
import gameOptions from "./gameOptions";
export class GameScene extends Phaser.Scene {
  addedPlatform: number;
  nextPlatformDistance: number;
  platformGroup: Phaser.GameObjects.Group;
  platformPool: Phaser.GameObjects.Group;

  player: Phaser.Physics.Arcade.Sprite;
  playerJump: number;
  speed: number;
  maxSpeed: number;

  constructor() {
    super({
      key: "GameScene"
    });
  }

  init(data): void {
    this.nextPlatformDistance = 0;
    this.addedPlatform = 0;
    this.speed = 30;
    this.maxSpeed = 30;
  }

  create(data): void {
    this.addedPlatform = 0;

    this.platformGroup = this.add.group({
      removeCallback: platform => {
        this.platformPool.add(platform);
      }
    });

    this.platformPool = this.add.group({
      removeCallback: platform => {
        this.platformGroup.add(platform);
      }
    });

    const { width, height } = this.game.config;
    this.addPlatform(width, (width as number) / 2, (height as number) * 0.95);

    this.input.keyboard.on("keyup-UP", event => {
      this.maxSpeed += 10;
      console.log("max speed", this.maxSpeed);
    });

    this.input.keyboard.on("keyup-DOWN", event => {
      this.maxSpeed -= 10;
      console.log("max speed", this.maxSpeed);
    });

    this.input.keyboard.on("keydown-SPACE", event => {
      this.jump();
    });

    this.player = this.physics.add.sprite(
      gameOptions.playerStartPosition,
      (this.game.config.height as number) * 0.7,
      "player"
    );

    this.player.setGravityY(gameOptions.playerGravity);

    this.physics.add.collider(
      this.player,
      this.platformGroup,
      () => {
        if (!this.player.anims.isPlaying) {
          this.player.anims.play("run");
        }
      },
      null,
      this
    );
  }

  update(time: number, delta: number) {
    this.playerJump = 0;
    this.speed = this.maxSpeed
      ? Phaser.Math.Interpolation.Linear([this.speed, this.maxSpeed], 0.8)
      : 0.0;
    let minDistance = (this.game.config.width as number) + this.maxSpeed + 300;

    if (!this.speed && this.player.anims.getCurrentKey() !== "idle") {
      this.player.anims.play("idle")
    } else if (this.speed && this.player.body.touching.down && this.player.anims.getCurrentKey() !== "run") {
      this.player.anims.play("run")
    }

    if (this.player.anims.getCurrentKey() === "run") {
      if (this.speed) {
        this.player.anims.msPerFrame = Phaser.Math.Clamp(
          255 - this.maxSpeed * 0.2,
          12,
          600
        );
      } else {
        this.player.anims.stop();
      }
    }

    this.player.x = gameOptions.playerStartPosition;

    this.platformGroup.getChildren().forEach(platform => {
      (platform.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.speed);
      let platformDistance =
        minDistance - platform.x - platform.displayWidth / 2;
      if (platformDistance < minDistance) {
        minDistance = platformDistance;
      }
      if (platform.x < -platform.displayWidth * 0.5) {
        this.platformGroup.killAndHide(platform);
        this.platformGroup.remove(platform);
      }
    }, this);

    if (minDistance > this.nextPlatformDistance) {
      let nextPlatformWidth = this.game.config.width as number;
      let platformHeight = (this.game.config.height as number) * 0.95;
      this.addPlatform(
        nextPlatformWidth * this.maxSpeed,
        nextPlatformWidth,
        platformHeight
      );
    }
  }

  addPlatform(width, x, y) {
    this.addedPlatform++;
    let platform: Phaser.GameObjects.TileSprite;
    if (this.platformPool.getLength()) {
      platform = this.platformPool.getFirst();
      platform.x = x;
      platform.y = y;
      platform.active = true;
      platform.visible = true;
      this.platformPool.remove(platform);
      platform.displayWidth = width;
      platform.tileScaleX = 1 / platform.scaleX;
    } else {
      platform = this.add.tileSprite(x, y, width, 64, "platform");
      this.physics.add.existing(platform);
      (platform.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      (platform.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.speed);
      this.platformGroup.add(platform);
    }

    this.nextPlatformDistance = 0;
  }

  jump() {
    if (this.player.body.touching.down) {
      this.player.setVelocityY(-gameOptions.jumpForce);
    }
  }
}
