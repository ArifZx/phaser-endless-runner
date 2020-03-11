import "phaser";
import { GameScene } from "./scene/gameScene";
import { PreloadScene } from "./scene/preloadScene";
const config: Phaser.Types.Core.GameConfig = {
  title: "Endless Runner",
  width: 1024,
  height: 600,
  parent: "game",
  scene: [PreloadScene, GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  type: Phaser.AUTO,
  zoom: 1,
  backgroundColor: "#0ED1F1"
};

export class EndlessRunnerGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.onload = () => {
  var game = new EndlessRunnerGame(config);
};
