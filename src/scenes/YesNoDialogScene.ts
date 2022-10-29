import GameScene from './GameScene';
import UiButton from '../classes/UiButton';
import eventsCenter from '../utils/EventsCenter';

export default class YesNoDialogScene extends Phaser.Scene {
    private gameScene!: GameScene;
    private yesButton!: UiButton;
    private noButton!: UiButton;
    private justSpace!: Phaser.Input.Keyboard.Key;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super('YesNoDialog');
    }

    create(data: { text: string | string[]; }) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.justSpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, true, false);

        this.gameScene = <GameScene>this.scene.get('Game');

        this.gameScene.cursors.up.reset();
        this.gameScene.cursors.down.reset();
        this.gameScene.cursors.left.reset();
        this.gameScene.cursors.right.reset();

        this.gameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).reset();
        this.gameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).reset();
        this.gameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).reset();
        this.gameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).reset();

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
        this.gameScene.input.keyboard.enabled = false;
    }

    closeScene() {
        this.gameScene.input.keyboard.enabled = true;
        this.gameScene.activeDialogScene = false;
        this.scene.stop();
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && !this.gameScene.spaceDown) {
            this.closeScene();
        }
        else if (Phaser.Input.Keyboard.JustUp(this.cursors.space) && this.gameScene.spaceDown) {
            this.gameScene.spaceDown = false;
        }
    }

}