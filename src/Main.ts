import BattleScene from './scenes/BattleScene';
import BattleUIScene from './scenes/BattleUIScene';
import BootScene from './scenes/BootScene';
import GameOverScene from './scenes/GameOverScene';
import GameScene from './scenes/GameScene';
import MusicScene from './scenes/MusicScene';
import SFXScene from './scenes/SFXScene';
import TitleScene from './scenes/TitleScene';
import UIScene from './scenes/UIScene';
import ScaleModes = Phaser.Scale.ScaleModes;
import VirtualJoyStickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin';

import GamePadScene from './scenes/GamePadScene';
import KeyboardScene from './scenes/KeyboardScene';
import PlayerNameSelectScene from './scenes/PlayerNameSelectScene';

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
            gravity: {y: 0},
            fixedStep: true
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
        SFXScene,
        GamePadScene,
        KeyboardScene,
        PlayerNameSelectScene
    ],
    roundPixels: false,
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