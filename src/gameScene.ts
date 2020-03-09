import "phaser";
export class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene"
    });
  }

  init(data): void {}

  preload(): void {
    this.load.image("platform", "/assets/platformPack_tile001.png");
    this.load.image("spike", "/assets/platformPack_tile043.png");
  }

  create(data): void {}

  update(time: number, delta: number) {}
}
