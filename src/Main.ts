import BattleScene from './scenes/BattleScene';
import BattleUIScene from './scenes/BattleUIScene';
import BootScene from './scenes/BootScene';
// import DialogScene from './scenes/DialogScene';
import GameOverScene from './scenes/GameOverScene';
import GameScene from './scenes/GameScene';
import MusicScene from './scenes/MusicScene';
// import YesNoDialogScene from './scenes/YesNoDialogScene';
import SFXScene from './scenes/SFXScene';
import TitleScene from './scenes/TitleScene';
import UIScene from './scenes/UIScene';
import ScaleModes = Phaser.Scale.ScaleModes;
import VirtualJoyStickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin';

import GamePadScene from './scenes/GamePadScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 912,
    height: 720,
    scale: {
        mode: ScaleModes.FIT
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {y: 0}
        }
    },
    antialias: false,
    antialiasGL: false,
    scene: [
        BootScene,
        TitleScene,
        MusicScene,
        GameScene,
        UIScene,
        BattleScene,
        BattleUIScene,
        GameOverScene,
        // DialogScene,
        // YesNoDialogScene,
        SFXScene,
        GamePadScene
    ],
    backgroundColor: '#000000',
    plugins: {
        global: [{
            key: 'rexVirtualJoyStick',
            plugin: VirtualJoyStickPlugin,
            start: true
        }]
    }
};

new Phaser.Game(config);