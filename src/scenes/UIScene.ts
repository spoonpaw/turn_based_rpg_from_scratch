import Phaser from 'phaser';
import GameScene from './GameScene';
import eventsCenter from '../utils/EventsCenter';


export default class UIScene extends Phaser.Scene {
    public gameScene!: GameScene;
    public hpText!: Phaser.GameObjects.Text;
    public heartIcon!: Phaser.GameObjects.Image;
    private warriorText!: Phaser.GameObjects.Text;
    private swordIcon!: Phaser.GameObjects.Image;
    private coinIcon!: Phaser.GameObjects.Image;
    private goldText!: Phaser.GameObjects.Text;

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
        // set up gold text and icon
        this.coinIcon = this.add.image(18, 71, 'coin');
        this.goldText = this.add.text(35, 55, `Gold: ${this.gameScene.player.gold}`, { fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont' }).setStroke('#000000', 2).setResolution(10);

        // set up warrior text and icon as well as level text
        this.warriorText = this.add.text(35, -5, 'Warrior / Level 1', { fontSize: '50px', color: '#ffffff', fontFamily: 'CustomFont' }).setStroke('#000000', 2).setResolution(10);
        this.swordIcon = this.add.image(18, 20, 'sword').setScale(1.5);

        // create the hp text game object
        this.hpText = this.add.text(35, 30, `Hit Points: ${this.gameScene.player.health}`, { fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont' }).setStroke('#000000', 2).setResolution(10);
        // create heart icon
        this.heartIcon = this.add.image(18, 46, 'heart').setScale(1.25);
    }

    setupEvents() {
        // listen for the updateHP event from the events center
        eventsCenter.on('updateHP', this.updateHP, this);

        // listen for the updateGold event from the events center
        eventsCenter.on('updateGold', this.updateGold, this);

        // listen for the updateXP event from the events center
        eventsCenter.on('updateXP', this.updateXP, this);
    }

    updateHP(hp) {
        this.hpText.text = `Hit Points: ${hp}`;
    }

    updateGold(gold) {
        this.goldText.text = `Gold: ${gold}`;
    }

    updateXP(xp) {
        this.warriorText.text = `Warrior / Level ${Math.ceil(0.3 * Math.sqrt(xp))}`;
    }
}