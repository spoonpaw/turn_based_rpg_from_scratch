import Phaser from 'phaser';
import GameScene from './GameScene';
import DialogText from '../classes/DialogText';

export default class DialogScene extends Phaser.Scene {
    private gameScene!: GameScene;

    constructor() {
        super('Dialog');
    }

    create(data) {

        this.gameScene = <GameScene>this.scene.get('Game');
        this.add.image(0, 477, 'prefab3')
            .setOrigin(0, 0);
        this.add.existing(this.addDialogText(data.text));

        this.gameScene.input.keyboard.enabled = false;

        this.input.keyboard.on('keydown', this.listenForPlayerActivity, this);
    }

    addDialogText(text: string) {
        return new DialogText(30, 500, text, this);
    }

    listenForPlayerActivity(event): void {
        if (event.code === 'Space') {
            this.gameScene.activeDialogScene = false;
            this.gameScene.input.keyboard.enabled = true;
            this.scene.stop();
        }
    }
}