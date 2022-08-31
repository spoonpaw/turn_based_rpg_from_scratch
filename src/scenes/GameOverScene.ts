import Phaser from 'phaser';
import TweenHelper from '../utils/TweenHelper';
import GameScene from './GameScene';
import eventsCenter from '../utils/EventsCenter';

export default class GameOverScene extends Phaser.Scene{
    public gameOverText!: Phaser.GameObjects.Text;
    private titleText!: Phaser.GameObjects.Text;

    constructor() {
        super('GameOver');
    }

    create() {
        const phaserImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'title');
        phaserImage.displayHeight = this.sys.canvas.height;
        phaserImage.displayWidth = this.sys.canvas.width;

        this.cameras.main.fadeIn(3000);

        // create title text
        this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Afterlife', {
            fontSize: '128px',
            color: '#fff',
            fontFamily: 'CustomFont'
        });
        this.titleText.setOrigin(0.5);

        const pressAnyKeyText = this.add.text(this.scale.width / 2, this.scale.height * 0.65, 'Press Any Key', {
            fontSize: '40px',
            color: '#fff',
            fontFamily: 'CustomFont',

        });
        pressAnyKeyText.setOrigin(0.5);

        TweenHelper.flashElement(this, pressAnyKeyText);

        this.resetGameScene();

        this.setupKeyListeners();

        this.sys.events.on('wake', this.wake, this);
    }

    setupKeyListeners() {
        this.cameras.main.once('camerafadeincomplete', (camera) => {
            this.input.keyboard.once('keydown', () => {
                // this.input.enabled = false;
                camera.fadeOut(3000);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.switch('Game');
                });
            });
            this.input.once('pointerdown', () => {
                // this.input.enabled = false;
                camera.fadeOut(3000);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.switch('Game');
                });
            });
        });
    }

    resetGameScene() {
        const gameScene = <GameScene>this.scene.get('Game');

        const health = gameScene.player.health;
        const maxHealth = gameScene.player.maxHealth;
        const damage = gameScene.player.damage;
        const gold = gameScene.player.gold;
        const experience = gameScene.player.experience;

        const allSprites = gameScene.children.list.filter(x => x instanceof Phaser.GameObjects.Sprite);
        allSprites.forEach(x => x.destroy());

        gameScene.create();
        gameScene.player.health = health;
        gameScene.player.maxHealth = maxHealth;
        gameScene.player.damage = damage;
        gameScene.player.gold = gold;
        gameScene.player.experience = experience;

        eventsCenter.emit('updateHP', gameScene.player.health);
        eventsCenter.emit('updateGold', gameScene.player.gold);
        eventsCenter.emit('updateXP', gameScene.player.experience);
    }

    wake() {
        this.cameras.main.fadeIn(3000);
        this.resetGameScene();
        this.setupKeyListeners();
    }
}