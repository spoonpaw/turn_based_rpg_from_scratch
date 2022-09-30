import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import GameOverScene from './scenes/GameOverScene';
import DialogScene from './scenes/DialogScene';
import YesNoDialogScene from './scenes/YesNoDialogScene';
import BattleScene from './scenes/BattleScene';
import BattleUIScene from './scenes/BattleUIScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 912,
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
        GameOverScene,
        DialogScene,
        YesNoDialogScene
    ],
    backgroundColor: '#000000'
};

new Phaser.Game(config);