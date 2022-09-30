import GameScene from './GameScene';

export default class DialogScene extends Phaser.Scene {
    private gameScene!: GameScene;

    constructor() {
        super('Dialog');
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

        this.gameScene.input.keyboard.enabled = false;

        this.input.keyboard.on('keydown', this.listenForPlayerActivity, this);
    }

    listenForPlayerActivity(event: KeyboardEvent): void {
        if (event.code === 'Space') {
            this.gameScene.activeDialogScene = false;
            this.gameScene.input.keyboard.enabled = true;
            this.scene.stop();
        }
    }
}