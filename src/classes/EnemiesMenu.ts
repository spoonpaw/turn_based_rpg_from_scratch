import Phaser from 'phaser';
import Menu from './Menu';

export default class EnemiesMenu extends Menu{
    constructor(x: number, y: number, scene: Phaser.Scene) {
        super(x, y, scene);
    }

    confirm() {
        // do something when the player selects an enemy
        this.scene.events.emit('Enemy', this.menuItemIndex);
    }
}