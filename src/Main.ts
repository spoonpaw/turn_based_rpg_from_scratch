import Phaser from 'phaser';
import BootScene from './scenes/BootScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 768,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 0 }
        }
    },
    scene: [BootScene],
    backgroundColor: '#000000'
};

export default new Phaser.Game(config);