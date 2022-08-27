import Phaser from 'phaser';
import Menu from './Menu';

export default class ActionsMenu extends Menu{
    constructor(x: number, y: number, scene: Phaser.Scene) {
        super(x, y, scene);
        this.addMenuItem('Attack');
    }

    confirm() {
        // do something when the player selects an action
        this.scene.events.emit('SelectedAction');
    }
}