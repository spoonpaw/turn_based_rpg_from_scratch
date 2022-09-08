import Phaser from 'phaser';

export default class DialogText extends Phaser.GameObjects.Text {
    constructor(
        x: number,
        y: number,
        text: string | string[],
        scene: Phaser.Scene
    ) {
        super(scene, x, y, text, {
            color: '#ffffff', align: 'left', fontFamily: 'CustomFont', wordWrap: {
                width: 725,
                useAdvancedWrap: true
            }
        });
        this.setResolution(10);
        this.setFontSize(60);
    }
}