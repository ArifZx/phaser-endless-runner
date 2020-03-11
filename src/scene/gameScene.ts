import "phaser";
import gameOptions from "../gameOptions";
import Player from "../object/player";
import Spike from "../object/spike";
import { zeroAppend } from "../util";
export class GameScene extends Phaser.Scene {
  addedPlatform: number;
  nextPlatformDistance: number;
  platformGroup: Phaser.GameObjects.Group;
  platformPool: Phaser.GameObjects.Group;

  skyGroup: Phaser.GameObjects.Group;
  skyDistance: number;

  spikeGroup: Phaser.GameObjects.Group;
  spikePool: Phaser.GameObjects.Group;

  highScore: number;
  score: number;
  scoreText: Phaser.GameObjects.Text;
  hintText: Phaser.GameObjects.Text;
  gameOverText: Phaser.GameObjects.Text;

  player: Player;
  currentMsFrame: number;
  playerJump: number;
  speed: number;
  maxSpeed: number;

  seconds: number;

  isGameOver: boolean;

  prevSpeed: number;
  prevMaxSpeed: number;
  startTime: number;

  constructor() {
    super({
      key: "GameScene"
    });
  }

  init(data): void {
    this.nextPlatformDistance = 0;
    this.addedPlatform = 0;
    this.speed = 30;
    this.maxSpeed = gameOptions.startSpeed;
    this.skyDistance = -5;
    this.isGameOver = false;
    this.player = data.player;
    this.startTime = this.time.now || 0;
    this.highScore = parseInt(localStorage.getItem("highScore")) || 0;
  }

  create(data): void {
    const { width, height } = this.game.config;

    this.addedPlatform = 0;

    this.skyGroup = this.add.group({
      removeCallback: sky => {
        this.skyGroup.add(sky);
      }
    });

    this.initializeSky();

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

    this.addPlatform(width, (width as number) / 2, (height as number) * 0.95);

    this.spikeGroup = this.add.group({
      removeCallback: spike => {
        this.spikePool.add(spike);
      }
    });

    this.spikePool = this.add.group({
      removeCallback: spike => {
        this.spikeGroup.add(spike);
      }
    });

    this.player = new Player(
      this,
      gameOptions.playerStartPosition,
      (this.game.config.height as number) * 0.7
    );

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

    this.physics.add.overlap(
      this.player,
      this.spikeGroup,
      () => {
        if (!this.isGameOver) {
          localStorage.setItem(
            "highScore",
            Math.max(this.highScore, this.score).toString()
          );
        }
        this.isGameOver = true;
      },
      null,
      this
    );

    this.scoreText = this.add.text((width as number) - 48 - 16, 16, "00", {
      fontSize: "48px",
      fill: "#000"
    });

    this.gameOverText = this.add.text(0, 0, `Game Over\nUse 'R' for restart`, {
      fontSize: "48px",
      fill: "#000",
      align: "center"
    });

    this.gameOverText.setPosition(
      ((width as number) - this.gameOverText.displayWidth) * 0.5,
      ((height as number) - this.gameOverText.displayHeight) * 0.5
    );

    this.scoreText.setDepth(100);

    this.input.keyboard.on(
      "keyup-UP",
      event => {
        this.maxSpeed += 10;
      },
      this
    );

    this.input.keyboard.on(
      "keyup-DOWN",
      event => {
        this.maxSpeed -= 10;
      },
      this
    );

    this.input.keyboard.on(
      "keyup-R",
      event => {
        this.scene.start("GameScene", { player: this.player });
      },
      this
    );

    this.input.keyboard.on("keydown-SPACE", this.player.jump, this.player);
    this.input.on('pointerdown', () => {
      this.player.jump();
    });
    
  }

  paused() {
    this.prevSpeed = this.speed;
    this.speed = 0;

    this.prevMaxSpeed = this.maxSpeed;
    this.maxSpeed = 0;

    this.player.setSpeed(this.speed);
    this.player.setGravityY(0);
    this.updateSpeedGroup();
  }

  unpaused() {
    this.speed = this.prevSpeed;
    this.maxSpeed = this.prevMaxSpeed;
    this.player.setSpeed(this.speed);
    this.player.setGravityY(gameOptions.playerGravity);
    this.updateSpeedGroup();
  }

  updateSpeedGroup() {
    this.player.setSpeed(this.speed);

    this.skyGroup.getChildren().forEach(sky => {
      (sky.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.speed * 0.3);
    });

    this.spikeGroup.getChildren().forEach(spike => {
      (spike.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.speed);
    });

    this.platformGroup.getChildren().forEach(platform => {
      (platform.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.speed);
    });
  }

  update(time: number, delta: number) {
    if (this.isGameOver) {
      this.paused();
      this.player.die();
      this.gameOverText.setAlpha(1);
    } else {
      this.gameOverText.setAlpha(0);

      if (this.score != Math.floor((time - this.startTime) * 0.01)) {
        this.score = Math.floor((time - this.startTime) * 0.01);
      }

      if (this.seconds != Math.floor(time * 0.001)) {
        this.seconds =
          Math.floor(time * 0.001) - Math.floor(this.startTime * 0.001);
        this.maxSpeed = Math.max(
          gameOptions.startSpeed,
          Math.floor(
            (this.maxSpeed +
              this.maxSpeed * 0.11 +
              (75 * Math.pow(this.seconds, 2.68)) / this.maxSpeed +
              this.seconds * -0.56) /
              8
          )
        );
      }

      this.speed = this.maxSpeed
        ? Phaser.Math.Interpolation.Linear([this.speed, this.maxSpeed], 0.8)
        : 0.0;

      this.updateSpeedGroup();

      this.player.x = gameOptions.playerStartPosition;

      this.skyGroup.getChildren().forEach(sky => {
        if (sky.x < -sky.displayWidth * 0.5) {
          sky.x = sky.displayWidth * 1.5 + this.skyDistance;
        }
      }, this);

      let minDistance =
        (this.game.config.width as number) + this.maxSpeed + 300;
      this.platformGroup.getChildren().forEach(platform => {
        let platformDistance =
          (this.game.config.width as number) -
          platform.x -
          platform.displayWidth * 0.5;
        if (platformDistance < minDistance) {
          minDistance = platformDistance;
        }
        if (platform.x < -platform.displayWidth * 0.5) {
          this.platformGroup.killAndHide(platform);
          this.platformGroup.remove(platform);
        }
      }, this);

      this.spikeGroup.getChildren().forEach(spike => {
        if (spike.x < -spike.displayWidth * 0.5) {
          this.spikeGroup.killAndHide(spike);
          this.spikeGroup.remove(spike);
        }
      }, this);

      if (minDistance > this.nextPlatformDistance) {
        let nextPlatformWidth = this.game.config.width as number;
        let platformHeight = (this.game.config.height as number) * 0.95;
        this.addPlatform(
          nextPlatformWidth + this.maxSpeed,
          nextPlatformWidth,
          platformHeight
        );
      }
    }

    this.scoreText.setText(
      `Hi:${zeroAppend(this.highScore)}  ${zeroAppend(this.score)}`
    );
    this.scoreText.x =
      (this.game.config.width as number) - this.scoreText.displayWidth - 16;
  }

  initializeSky() {
    this.addSky();
    this.addSky();
  }

  addSky() {
    let sky: Phaser.GameObjects.TileSprite;
    const { width, height } = this.game.config;

    if (this.skyGroup.getLength() < 1) {
      sky = this.add.tileSprite(0, height as number, 3072, 1536, "sky");
      sky.x = sky.x + sky.displayWidth * 0.5;
    } else if (this.skyGroup.getLength() < 2) {
      sky = this.add.tileSprite(0, height as number, 3072, 1536, "sky");
      sky.x = sky.x + sky.displayWidth * 1.5 + this.skyDistance;
    }

    if (sky) {
      sky.tileScaleX = 1 / sky.scaleX;
      this.physics.add.existing(sky);
      (sky.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      this.skyGroup.add(sky);
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

    for (let i = 0; i < Phaser.Math.Between(1, 2); i++) {
      if (this.addedPlatform > 1 && Phaser.Math.Between(0, 100) < 30) {
        if (this.spikePool.getLength()) {
          let spike = this.spikePool.getFirst();
          spike.x = x + i * 64;
          spike.y = y - 64;
          spike.active = true;
          spike.visible = true;
          this.spikePool.remove(spike);
        } else {
          let spike = new Spike(this, x + i * 64, y - 64);
          spike.setImmovable(true);
          spike.setVelocityX(-this.speed);
          this.spikeGroup.add(spike);
        }
      }
    }

    this.nextPlatformDistance = 0;
  }
}
