
import TweenHelper from '../utils/TweenHelper';
import GameScene from './GameScene';
import Camera = Phaser.Cameras.Scene2D.Camera;

export default class GameOverScene extends Phaser.Scene {
    private gameOverText!: Phaser.GameObjects.Text;

    constructor() {
        super('GameOver');
    }

    create() {
        const phaserImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'title');
        phaserImage.displayHeight = this.sys.canvas.height;
        phaserImage.displayWidth = this.sys.canvas.width;

        this.cameras.main.fadeIn(3000);

        // create title text
        this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Afterlife', {
            fontSize: '128px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setStroke('#000000', 2);
        this.gameOverText.setOrigin(0.5);

        const pressAnyKeyText = this.add.text(this.scale.width / 2, this.scale.height * 0.65, 'Continue?', {
            fontSize: '40px',
            color: '#fff',
            fontFamily: 'CustomFont',
        })
            .setStroke('#000000', 2);

        pressAnyKeyText.setOrigin(0.5);

        TweenHelper.flashElement(this, pressAnyKeyText);

        this.sys.events.removeListener('wake');
        this.sys.events.on('wake', this.wake, this);

        const gameScene = <GameScene>this.scene.get('Game');

        gameScene.player.stats.currentHP = gameScene.player.stats.maxHP;
        gameScene.scene.restart();

        this.setupKeyListeners();

    }

    setupKeyListeners() {
        this.input.keyboard.enabled = true;
        this.input.enabled = true;
        this.cameras.main.once('camerafadeincomplete', (camera: Camera) => {
            this.input.keyboard.once('keydown', () => {
                this.handleInput(camera);
            });
            this.input.once('pointerdown', () => {
                this.handleInput(camera);
            });
        });
    }

    handleInput(camera: Camera) {
        this.input.keyboard.enabled = false;
        this.input.enabled = false;
        camera.fadeOut(3000);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.wake('Game');
            this.scene.stop();
            return;
        });
    }

    wake() {
        this.cameras.main.fadeIn(3000);
        const gameScene = <GameScene>this.scene.get('Game');
        gameScene.player.stats.currentHP = gameScene.player.stats.maxHP;
        gameScene.scene.restart();
        this.cameras.main.once('camerafadeincomplete', () => {
            this.setupKeyListeners();
        });
    }
}