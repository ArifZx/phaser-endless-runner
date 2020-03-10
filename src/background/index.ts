import "phaser";
export class InfinityBackground extends Phaser.GameObjects.GameObject {
  group: Phaser.GameObjects.Group;
  pool: Phaser.GameObjects.Group;
  heightPos: number;
  defaultHeight: number;
  defaultWidth: number;
  speed: number;
  texture: string;
  nextDistance: number;

  constructor(
    scene,
    texture: string,
    heightPos: number,
    height: number,
    width?: number,
    speed?: number,
    callback?
  ) {
    super(scene, "InfinityBackground");
    this.texture = texture;
    this.heightPos = heightPos;
    this.speed = speed || 0;
    this.defaultHeight = height;
    this.defaultWidth = width || this.scene.game.config.width as number;
    this.nextDistance = 0;


    this.group = this.scene.add.group({
      removeCallback: mountain => {
        this.pool.add(mountain);
      }
    });

    this.pool = this.scene.add.group({
      removeCallback: mountaint => {
        this.group.add(mountaint);
      }
    });

    if (callback) {
      callback();
    }
  }

  update() {
    let minDistance = this.defaultWidth + Math.abs(this.speed) + 300;

    this.group.getChildren().forEach(background => {
      (background.body as Phaser.Physics.Arcade.Body).setVelocityX(this.speed);
      let distance = minDistance - background.x - background.displayWidth * 0.5;
      if (distance < minDistance) {
        minDistance = distance;
      }

      if (background.x < -background.displayWidth * 0.5) {
        this.group.killAndHide(background);
        this.group.remove(background);
      }
    }, this.scene);

    if (minDistance > this.nextDistance) {
      this.addBackground(
        this.defaultWidth + Math.abs(this.speed),
        this.defaultWidth,
        this.defaultHeight
      );
    }
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  addBackground(width, x, y) {
    let background: Phaser.GameObjects.TileSprite;
    if (this.pool.getLength()) {
      background = this.pool.getFirst();
      background.x = x;
      background.y = y;
      background.active = true;
      background.visible = true;
      this.pool.remove(background);
      background.displayWidth = width;
      background.tileScaleX = 1 / background.scaleX;
    } else {
      background = this.scene.add.tileSprite(x, y, width, this.defaultHeight, this.texture);
      this.scene.physics.add.existing(background);
      (background.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      (background.body as Phaser.Physics.Arcade.Body).setVelocityX(this.speed);
      this.group.add(background);
    }
    console.log(this.pool.getLength());

    this.nextDistance = 0;
  }

  addDefaultBackground() {
    this.addBackground(
      this.defaultWidth + Math.abs(this.speed),
      this.defaultWidth,
      this.defaultHeight
    );
  }
}
