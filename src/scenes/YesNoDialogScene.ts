import Phaser from 'phaser';
import GameScene from './GameScene';
import UiButton from '../classes/UiButton';
import eventsCenter from '../utils/EventsCenter';

export default class YesNoDialogScene extends Phaser.Scene {
    private gameScene!: GameScene;
    private yesButton!: UiButton;
    private noButton!: UiButton;

    constructor() {
        super('YesNoDialog');
    }

    create(data: { text: string | string[]; }) {
        this.gameScene = <GameScene>this.scene.get('Game');
        this.add.image(0, 420, 'prefab4')
            .setOrigin(0, 0);
        this.add.text(30, 445, data.text, {
            color: '#ffffff', align: 'left', fontFamily: 'CustomFont', wordWrap: {
                width: 625,
                useAdvancedWrap: true
            }
        })
            .setResolution(10)
            .setFontSize(50)
            .setLineSpacing(-15);

        this.add.image(670, 470, 'prefab5')
            .setOrigin(0, 0);

        this.yesButton = new UiButton(this, 770, 540, 'button', 'buttonhover', 'Yes', () => {
            eventsCenter.emit('confirm');
            this.closeScene();
        });

        this.noButton = new UiButton(this, 770, 600, 'button2', 'button2hover', 'No', () => {
            this.closeScene();
        });

        this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                if (!this.gameScene.spaceDown) {
                    this.closeScene();
                }
            }
        });

        this.input.keyboard.on('keyup', (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                if (this.gameScene.spaceDown) {
                    this.gameScene.spaceDown = false;
                }
            }
        });

        this.gameScene.input.keyboard.enabled = false;
    }

    closeScene() {
        this.gameScene.input.keyboard.resetKeys();
        this.gameScene.input.keyboard.enabled = true;
        this.gameScene.activeDialogScene = false;
        this.gameScene.spaceDown = false;
        this.scene.stop();
    }
}