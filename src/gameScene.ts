import "phaser";
export class GameScene extends Phaser.Scene {
  addedPlatform: number;
  platformGroup: Phaser.GameObjects.Group;
  platformPool: Phaser.GameObjects.Group;

  playerJump:number

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

  create(data): void {
    this.addedPlatform = 0;

    this.platformGroup = this.add.group({
      removeCallback: platform => {
        this.platformPool.add(platform);
      }
    });

    this.playerJump = 0;
  }

  update(time: number, delta: number) {
    let minDistance  = 800;
    let rightmostPlatformHeight = 0;
    this.platformGroup.getChildren().forEach(platform => {
      let platformDistance = 800 - platform.parentContainer.x - platform.parentContainer.displayWidth / 2;
      if(platformDistance < minDistance) {
        minDistance = platformDistance;
        rightmostPlatformHeight = platform.parentContainer.y;
      }
    }, this)
  }
}
