import UIActionButton from '../classes/UIActionButton';
import eventsCenter from '../utils/EventsCenter';
import GameScene from './GameScene';

export default class UIScene extends Phaser.Scene {
    public gameScene!: GameScene;
    public hpText!: Phaser.GameObjects.Text;
    public heartIcon!: Phaser.GameObjects.Image;
    private soldierText!: Phaser.GameObjects.Text;
    private swordIcon!: Phaser.GameObjects.Image;
    private coinIcon!: Phaser.GameObjects.Image;
    private goldText!: Phaser.GameObjects.Text;
    private inventoryButton!: UIActionButton;
    private actionMenuFrame!: Phaser.GameObjects.Image;
    private characterButton!: UIActionButton;
    private abilityButton!: UIActionButton;

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
        this.actionMenuFrame = this.add.image(
            460,
            650,
            'gameActionMenuFrame'
        );

        // set up gold text and icon
        this.coinIcon = this.add.image(18, 71, 'coin');
        this.goldText = this.add.text(
            35,
            55,
            `Gold: ${this.gameScene.player.gold}`,
            { fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont' })
            .setStroke('#000000', 2)
            .setResolution(10);

        // set up soldier text and icon as well as level text
        this.soldierText = this.add.text(
            75,
            625,
            `Soldier / Level ${Math.max(
                1, Math.ceil(
                    0.3 * Math.sqrt(
                        this.gameScene.player.experience
                    )
                )
            )}`,
            { fontSize: '50px', color: '#ffffff', fontFamily: 'CustomFont' })
            .setStroke('#000000', 2)
            .setResolution(10);
        this.swordIcon = this.add.image(60, 650, 'sword')
            .setScale(1.5);

        // create the hp text game object
        this.hpText = this.add.text(
            448,
            620,
            `Hit Points: ${this.gameScene.player.stats.currentHP}`,
            { fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont' })
            .setStroke('#000000', 2)
            .setResolution(10);
        // create heart icon
        this.heartIcon = this.add.image(433, 635, 'heart')
            .setScale(1.25);

        this.inventoryButton = new UIActionButton(
            this,
            850,
            650,
            'bagbutton',
            'bagbuttonactive',
            '',
            () => {
                console.log('button pressed (game scene)');
            }
        );

        this.characterButton = new UIActionButton(
            this,
            750,
            650,
            'gameActionMenuCharacterButton',
            'gameActionMenuCharacterButtonActive',
            '',
            () => {
                console.log('character button pressed (game scene)');
            }
        );

        this.abilityButton = new UIActionButton(
            this,
            800,
            650,
            'pagebutton',
            'pagebuttonactive',
            '',
            () => {
                console.log('character button pressed (game scene)');
            }
        );
    }

    setupEvents() {
        // listen for the updateHP event from the events center
        eventsCenter.removeListener('updateHP');
        eventsCenter.on('updateHP', this.updateHP, this);

        // listen for the updateGold event from the events center
        eventsCenter.removeListener('updateGold');
        eventsCenter.on('updateGold', this.updateGold, this);

        // listen for the updateXP event from the events center
        eventsCenter.removeListener('updateXP');
        eventsCenter.on('updateXP', this.updateXP, this);
    }

    updateHP(hp: number) {
        this.hpText.text = `Hit Points: ${hp}`;
    }

    updateGold(gold:  number) {
        this.goldText.text = `Gold: ${gold}`;
    }

    updateXP(xp: number) {
        this.soldierText.setText(`Soldier / Level ${Math.max(1, Math.ceil(0.3 * Math.sqrt(xp)))}`);
    }
}