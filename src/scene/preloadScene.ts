export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    this.load.image("platform", "/assets/platformPack_tile001.png");
    this.load.image("spike", "/assets/platformPack_tile043.png");
    this.load.image("sky", "/assets/layer_1.png");
    this.load.image("mountain", "/assets/layer_2.png");
    this.load.spritesheet("player", "/assets/platformerPack_character.png", {
      frameWidth: 96,
      frameHeight: 96
    });

    this.load.audio("jump_sfx", ["/assets/Jump.mp3", "/assets/Jump.ogg"]);
  }

  create(): void {
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player", {
        start: 2,
        end: 3
      }),
      frameRate: 30,
      repeat: -1
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player", {
        start: 0,
        end: 0
      }),
      frameRate: 10,
      repeat: -1
    });

    this.scene.start("GameScene");
  }
}
