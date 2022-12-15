// import UiButton from '../classes/UiButton';
import UIActionButton from '../classes/UIActionButton';
import eventsCenter from '../utils/EventsCenter';
import GameScene from './GameScene';

export default class YesNoDialogScene extends Phaser.Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private gameScene!: GameScene;
    private justSpace!: Phaser.Input.Keyboard.Key;
    private noButton!: UIActionButton;
    private yesButton!: UIActionButton;

    public constructor() {
        super('YesNoDialog');
    }

    public closeScene() {
        this.gameScene.input.keyboard.enabled = true;
        // this.gameScene.activeDialogScene = false;
        this.scene.stop();
    }

    public create(data: { text: string | string[]; }) {
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

        // this.add.image(0, 310, 'prefab4')
        //     .setOrigin(0, 0);
        this.add.image(40, 380, 'leftsidedialogframe')
            .setOrigin(0, 0);
        this.add.text(50, 380, data.text, {
            color: '#ffffff', align: 'left', fontFamily: 'CustomFont', wordWrap: {
                width: 610,
                useAdvancedWrap: true
            }
        })
            .setResolution(10)
            .setFontSize(50)
            .setLineSpacing(-22);

        // this.add.image(670, 390, 'prefab5')
        //     .setOrigin(0, 0);

        this.add.image(670, 380, 'rightsidedialogoptionsframe')
            .setOrigin(0, 0);

        this.yesButton = new UIActionButton(this, 710, 415, 'checkbutton', 'checkbuttonactive', 'Yes', () => {
            eventsCenter.emit('confirm');
            this.closeScene();
        });

        // TODO: fix issue where space needs to be double clicked to reopen the
        this.noButton = new UIActionButton(this, 710, 465, 'crossbutton', 'crossbuttonactive', 'No', () => {
            this.closeScene();
            this.gameScene.input.keyboard.resetKeys();
        });

        // this.yesButton = new UiButton(this, 770, 430, 'button', 'buttonhover', 'Yes', () => {
        //     eventsCenter.emit('confirm');
        //     this.closeScene();
        // });
        //
        // this.noButton = new UiButton(this, 770, 490, 'button2', 'button2hover', 'No', () => {
        //     this.closeScene();
        // });
        this.gameScene.input.keyboard.enabled = false;
    }

    public update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && !this.gameScene.spaceDown) {
            this.closeScene();
        }
        else if (Phaser.Input.Keyboard.JustUp(this.cursors.space) && this.gameScene.spaceDown) {
            this.gameScene.spaceDown = false;
        }
    }
}