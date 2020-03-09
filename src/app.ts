import "phaser"
const config: Phaser.Types.Core.GameConfig = {
  title: "Endless Runner",
  width: 800,
  height: 600,
  parent: 'game',
  scene: [],
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  backgroundColor: 0x0000ff
}

export class EndlessRunnerGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.onload = () => {
  var game = new EndlessRunnerGame(config);
};
