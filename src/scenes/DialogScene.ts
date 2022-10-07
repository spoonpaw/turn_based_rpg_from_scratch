import GameScene from './GameScene';

export default class DialogScene extends Phaser.Scene {
    private gameScene!: GameScene;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super('Dialog');
    }

    create(data: { text: string | string[]; }) {
        this.cursors = this.input.keyboard.createCursorKeys();

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

        this.gameScene.input.keyboard.enabled = false;

    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && !this.gameScene.spaceDown) {
            this.closeScene();
        }
        else if (Phaser.Input.Keyboard.JustUp(this.cursors.space) && this.gameScene.spaceDown) {
            this.gameScene.spaceDown = false;
        }
    }

    closeScene() {
        this.gameScene.input.keyboard.enabled = true;
        this.gameScene.activeDialogScene = false;
        this.scene.stop();
    }
}