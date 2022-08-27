import Phaser from 'phaser';

export default class MenuItem extends Phaser.GameObjects.Text {
    constructor(
        x: number,
        y: number,
        text: string | string[],
        scene: Phaser.Scene
    ) {
        super(scene, x, y, text, {color: '#ffffff', align: 'left', fontFamily: 'CustomFont'});
        this.setFontSize(60);
    }

    select() {
        this.setColor('#f8ff38');
    }

    deselect() {
        this.setColor('#ffffff');
    }

    // when the associated enemy or player unit is killed
    unitKilled() {
        this.active = false;
        this.visible = false;
    }
}