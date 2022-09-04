import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import BattleScene from './scenes/BattleScene';
import BattleUIScene from './scenes/BattleUIScene';
import GameOverScene from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 768,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    antialias: false,
    antialiasGL: false,
    scene: [
        BootScene,
        TitleScene,
        GameScene,
        UIScene,
        BattleScene,
        BattleUIScene,
        GameOverScene
    ],
    backgroundColor: '#000000'
};

export default new Phaser.Game(config);