import Phaser from 'phaser';
import TweenHelper from '../utils/TweenHelper';
import GameScene from './GameScene';

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
        });
        this.gameOverText.setOrigin(0.5);

        const pressAnyKeyText = this.add.text(this.scale.width / 2, this.scale.height * 0.65, 'Press Any Key', {
            fontSize: '40px',
            color: '#fff',
            fontFamily: 'CustomFont',

        });
        pressAnyKeyText.setOrigin(0.5);

        TweenHelper.flashElement(this, pressAnyKeyText);

        this.sys.events.removeListener('wake');
        this.sys.events.on('wake', this.wake, this);

        const gameScene = <GameScene>this.scene.get('Game');

        gameScene.player.health = gameScene.player.maxHealth;
        gameScene.scene.restart();

        this.setupKeyListeners();

    }

    setupKeyListeners() {
        this.input.keyboard.enabled = true;
        this.input.enabled = true;
        this.cameras.main.once('camerafadeincomplete', (camera) => {
            this.input.keyboard.once('keydown', () => {
                this.input.keyboard.enabled = false;
                this.input.enabled = false;
                camera.fadeOut(3000);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.wake('Game');
                    this.scene.stop();
                    return;
                });
            });
            this.input.once('pointerdown', () => {
                this.input.keyboard.enabled = false;
                this.input.enabled = false;
                camera.fadeOut(3000);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.wake('Game');
                    this.scene.stop();
                    return;
                });
            });
        });
    }

    wake() {
        this.cameras.main.fadeIn(3000);
        const gameScene = <GameScene>this.scene.get('Game');
        gameScene.player.health = gameScene.player.maxHealth;
        gameScene.scene.restart();
        this.cameras.main.once('camerafadeincomplete', () => {
            this.setupKeyListeners();
        });
    }
}