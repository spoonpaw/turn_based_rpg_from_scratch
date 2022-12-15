import GameScene from './GameScene';

export default class DialogScene extends Phaser.Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private gameScene!: GameScene;

    public constructor() {
        super('Dialog');
    }

    public closeScene() {
        this.gameScene.input.keyboard.enabled = true;
        // this.gameScene.activeDialogScene = false;
        this.scene.stop();
    }

    public create(data: { text: string | string[]; }) {
        this.cursors = this.input.keyboard.createCursorKeys();

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