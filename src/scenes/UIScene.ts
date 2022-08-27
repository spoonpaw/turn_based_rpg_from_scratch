import Phaser from 'phaser';
import GameScene from './GameScene';

export default class UIScene extends Phaser.Scene {
    public gameScene!: GameScene;
    public scoreText!: Phaser.GameObjects.Text;
    public heartIcon!: Phaser.GameObjects.Image;

    constructor() {
        super('UI');
    }

    init() {
        // grab a reference to the game scene
        this.gameScene = <GameScene>this.scene.get('Game');
    }

    create() {
        this.setupUiElements();
        this.setupEvents();
    }

    setupUiElements() {
        // create the score text game object
        this.scoreText = this.add.text(35, 2, `Hit Points: ${this.gameScene.player.health}`, { fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont' });
        // create heart icon
        // this.heartIcon = this.add.image(15, 15, 'items', 3);
        this.heartIcon = this.add.image(18, 18, 'heart');
    }

    setupEvents() {
        // listen for the updateScore event from the game scene
        this.gameScene.events.on('updateScore', (score) => {
            this.scoreText.setText(`Coins: ${score}`);
        });
    }
}