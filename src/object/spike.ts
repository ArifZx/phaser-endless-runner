import "phaser"
class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'spike');

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }
}

export default Spike;