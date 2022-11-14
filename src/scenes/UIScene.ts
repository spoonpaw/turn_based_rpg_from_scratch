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
    private inventoryAndAbilityMenuFrame!: Phaser.GameObjects.Image;
    private subInventoryAndAbilityMenuFrame!: Phaser.GameObjects.Image;
    private subInventoryBagButton!: UIActionButton;
    private subInventoryButtons: UIActionButton[] = [];
    private inventoryButtons: UIActionButton[] = [];
    private inventoryIndex!: number;

    constructor() {
        super('UI');
    }

    init() {
        // grab a reference to the game scene
        this.gameScene = <GameScene>this.scene.get('Game');
    }

    create() {
        this.setupUIElements();
        this.setupEvents();
    }

    setupUIElements() {
        console.log('setting up the ui elements in the ui scene');
        
        this.inventoryAndAbilityMenuFrame = this.add.image(532, 181, 'inventoryAndAbilityMenuFrame')
            .setOrigin(0, 0);
        this.inventoryAndAbilityMenuFrame.setVisible(false);


        this.subInventoryAndAbilityMenuFrame = this.add.image(236, 430, 'subInventoryAndAbilityMenuFrame')
            .setOrigin(0, 0);
        this.subInventoryAndAbilityMenuFrame.setVisible(false);

        this.subInventoryBagButton = new UIActionButton(
            this,
            265,
            465,
            'bagbutton',
            'bagbuttonactive',
            'Inventory',
            () => {
                return;
            }
        );
        this.subInventoryBagButton.setVisible(false);
        this.subInventoryBagButton.buttonText.setVisible(false);

        this.subInventoryButtons.push(this.subInventoryBagButton);

        this.generateInventoryButtons();

        this.actionMenuFrame = this.add.image(
            460,
            650,
            'gameActionMenuFrame'
        );

        // set up gold text and icon
        this.coinIcon = this.add.image(433, 665, 'coin');
        this.goldText = this.add.text(
            448,
            647,
            `Gold: ${this.gameScene.player.gold}`,
            { fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont' })
            .setStroke('#000000', 2)
            .setResolution(10);

        // set up soldier text and icon as well as level text
        this.soldierText = this.add.text(
            75,
            620,
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
        this.heartIcon = this.add.image(433, 638, 'heart')
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
                // todo: show the inventory interface!
                this.inventoryAndAbilityMenuFrame.setVisible(true);
                for (const inventoryButton of this.inventoryButtons) {
                    inventoryButton.setVisible(true);
                    inventoryButton.buttonText.setVisible(true);
                }
                
                this.subInventoryAndAbilityMenuFrame.setVisible(true);
                
                for (const subInventoryButton of this.subInventoryButtons) {
                    subInventoryButton.setVisible(true);
                    subInventoryButton.buttonText.setVisible(true);
                }

                this.inventoryButton.select();
                this.subInventoryBagButton.select();
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
            'bookbutton',
            'bookbuttonactive',
            '',
            () => {
                console.log('ability button pressed (game scene)');
            }
        );
    }

    private generateInventoryButtons() {
        console.log('generating inventory buttons on the ui scene');
        
       
        // iterate over all inventory entries
        for (const [index, item] of this.gameScene.player.inventory.entries()) {

            const inventoryButton = new UIActionButton(
                this,
                564,
                216 + (index * 50),
                item.key,
                item.activeKey,
                item.name,
                () => {
                    // TODO: fix this meesed up game scene inventory button
                    //  it is saying that the scene is null when clicked after resetting
                    //  the game scene
                    console.log('potion button pressed from the game scene! so far so good)');
                    this.inventoryIndex = index;
                    console.log({inventoryIndex: this.inventoryIndex});
                    this.inventoryButtons[index].select();
                    for (const [inventoryButtonIndex, inventoryButton] of this.inventoryButtons.entries()) {
                        if (inventoryButtonIndex !== index) {
                            inventoryButton.deselect();
                        }
                    }
                    this.gameScene.interactionState = `inventoryaction${index}`;
                }
            );
            inventoryButton.setVisible(false);
            inventoryButton.buttonText.setVisible(false);

            this.inventoryButtons.push(inventoryButton);

        } 

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