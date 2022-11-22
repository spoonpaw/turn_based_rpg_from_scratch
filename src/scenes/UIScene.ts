// TODO: fix the innkeeper dialogue! when speaking to the innkeeper, the dialogue frames should match the existing
//  scheme. dialogue frame should be properties of the ui scene. shown or hidden from the player as needed

import GameMessage from '../classes/GameMessage';
import UIActionButton from '../classes/UIActionButton';
import eventsCenter from '../utils/EventsCenter';
import GameScene from './GameScene';

export default class UIScene extends Phaser.Scene {
    public gameScene!: GameScene;
    public hpText!: Phaser.GameObjects.Text;
    public heartIcon!: Phaser.GameObjects.Image;
    private soldierText!: Phaser.GameObjects.Text;
    private coinIcon!: Phaser.GameObjects.Image;
    private goldText!: Phaser.GameObjects.Text;
    private inventoryButton!: UIActionButton;
    private actionMenuFrame!: Phaser.GameObjects.Image;
    private characterButton!: UIActionButton;
    private characterSheetButton!: UIActionButton;
    private abilityButton!: UIActionButton;
    private inventoryAndAbilityMenuFrame!: Phaser.GameObjects.Image;
    private inventoryAndAbilityDetailFrame!: Phaser.GameObjects.Image;
    private inventoryAndAbilityDetailText!: Phaser.GameObjects.Text;
    private useButton!: UIActionButton;
    public selectedItemAndAbilityIcon!: UIActionButton;
    private subInventoryAndAbilityMenuFrame!: Phaser.GameObjects.Image;
    private subInventoryBagButton!: UIActionButton;
    private subInventoryButtons: UIActionButton[] = [];
    private subAbilityButtons: UIActionButton[] = [];
    private subAbilityButton!: UIActionButton;
    private inventoryButtons: UIActionButton[] = [];
    private inventoryIndex!: number;
    private cancelMenuFrame!: Phaser.GameObjects.Image;
    private cancelButton!: UIActionButton;
    private message!: GameMessage;
    public confirmSelectedAbilityOrItemFrame!: Phaser.GameObjects.Image;
    public confirmSelectedAbilityOrItemFrameB!: Phaser.GameObjects.Image;
    private commandMenuText!: Phaser.GameObjects.Text;
    public interactionState!: string;
    private classString!: Phaser.GameObjects.Text;
    private levelString!: Phaser.GameObjects.Text;
    private hitPointString!: Phaser.GameObjects.Text;
    private manaPointString!: Phaser.GameObjects.Text;
    private strengthString!: Phaser.GameObjects.Text;
    private agilityString!: Phaser.GameObjects.Text;
    private vitalityString!: Phaser.GameObjects.Text;
    private intellectString!: Phaser.GameObjects.Text;
    private luckString!: Phaser.GameObjects.Text;
    private tillNextLevelString!: Phaser.GameObjects.Text;

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

        this.message = new GameMessage(this);
        this.add.existing(this.message);

        this.interactionState = 'mainselect';
    }

    setupUIElements() {
        this.cancelMenuFrame = this.add.image(315, 315, 'cancelMenuFrame')
            .setOrigin(0, 0);
        this.cancelMenuFrame.setVisible(false);

        this.inventoryAndAbilityMenuFrame = this.add.image(532, 181, 'inventoryAndAbilityMenuFrame')
            .setOrigin(0, 0);
        this.inventoryAndAbilityMenuFrame.setVisible(false);


        this.subInventoryAndAbilityMenuFrame = this.add.image(236, 430, 'subInventoryAndAbilityMenuFrame')
            .setOrigin(0, 0);
        this.subInventoryAndAbilityMenuFrame.setVisible(false);

        this.confirmSelectedAbilityOrItemFrame = this.add.image(236, 430, 'confirmSelectedAbilityOrItemFrame')
            .setOrigin(0, 0);
        this.confirmSelectedAbilityOrItemFrame.setVisible(false);

        this.confirmSelectedAbilityOrItemFrameB = this.add.image(236, 505, 'confirmSelectedAbilityOrItemFrameB')
            .setOrigin(0, 0);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);

        this.inventoryAndAbilityDetailFrame = this.add.image(3, 212, 'inventoryAndAbilityDetailFrame')
            .setOrigin(0, 0);
        this.inventoryAndAbilityDetailFrame.setVisible(false);

        // create text second
        this.commandMenuText = this.add.text(244, 440, 'Command?', {
            fontSize: '55px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.commandMenuText.setVisible(false);


        this.classString = this.add.text(540, 180, 'Class: Soldier', {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.classString.setVisible(false);

        this.levelString = this.add.text(540, 221, `Level: ${Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.player.experience)))}`, {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.levelString.setVisible(false);

        this.hitPointString = this.add.text(540, 262, `Hit Points: ${this.gameScene.player.stats.currentHP}/${this.gameScene.player.stats.maxHP}`, {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.hitPointString.setVisible(false);

        this.manaPointString = this.add.text(540, 303, 'Mana Points: 0/0', {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.manaPointString.setVisible(false);

        this.strengthString = this.add.text(540, 344, `Strength: ${Math.floor(this.gameScene.player.stats.strength)}`, {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.strengthString.setVisible(false);

        this.agilityString = this.add.text(540, 385, `Agility: ${Math.floor(this.gameScene.player.stats.agility)}`, {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.agilityString.setVisible(false);

        this.vitalityString = this.add.text(540, 426, `Vitality: ${Math.floor(this.gameScene.player.stats.vitality)}`, {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.vitalityString.setVisible(false);

        this.intellectString = this.add.text(540, 467, `Intellect: ${Math.floor(this.gameScene.player.stats.intellect)}`, {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.intellectString.setVisible(false);

        this.luckString = this.add.text(540, 508, `Luck: ${Math.floor(this.gameScene.player.stats.luck)}`, {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.luckString.setVisible(false);

        this.tillNextLevelString = this.add.text(540, 549, `Till Next Level: ${this.calculateTilNextLevel()}`, {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.tillNextLevelString.setVisible(false);

        this.cancelButton = new UIActionButton(
            this,
            347,
            350,
            'crossbutton',
            'crossbutton',
            'Cancel',
            () => {
                this.selectCancel();
            }
        );

        this.cancelButton.setVisible(false);
        this.cancelButton.buttonText.setVisible(false);

        this.selectedItemAndAbilityIcon = new UIActionButton(
            this,
            265,
            465,
            'healthpotionactive',
            'healthpotionactive',
            'Health Potion',
            () => {
                return;
            }
        );
        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);

        this.useButton = new UIActionButton(
            this,
            35,
            385,
            'checkbutton',
            'checkbutton',
            'Use',
            () => {
                console.log('setting the interaction state from the use button');
                this.interactionState = this.interactionState.split('selecting')[1];
                this.inventoryAndAbilityMenuFrame.setVisible(false);
                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.subInventoryAndAbilityMenuFrame.setVisible(false);
                this.inventoryAndAbilityDetailText.setVisible(false);
                this.subInventoryBagButton.setVisible(false);
                this.subInventoryBagButton.buttonText.setVisible(false);
                this.useButton.setVisible(false);
                this.useButton.buttonText.setVisible(false);
                this.selectedItemAndAbilityIcon.setVisible(true);
                this.selectedItemAndAbilityIcon.buttonText.setVisible(true);

                this.cancelMenuFrame.setX(698);
                this.cancelMenuFrame.setY(430);
                this.cancelMenuFrame.setVisible(true);
                this.confirmSelectedAbilityOrItemFrame.setVisible(true);
                this.confirmSelectedAbilityOrItemFrameB.setVisible(true);
                this.commandMenuText.setText('\nChoose A Target');
                this.commandMenuText.setVisible(true);

                for (const inventoryButton of this.inventoryButtons) {
                    inventoryButton.setVisible(false);
                    inventoryButton.buttonText.setVisible(false);
                }

                this.cancelButton.setX(730);
                this.cancelButton.setY(465);
                this.cancelButton.buttonText.setX(750);
                this.cancelButton.buttonText.setY(440);

            }
        );
        this.useButton.setVisible(false);
        this.useButton.buttonText.setVisible(false);

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

        this.subAbilityButton = new UIActionButton(
            this,
            265,
            465,
            'pagebutton',
            'pagebuttonactive',
            'Page 1',
            () => {
                return;
            }
        );
        this.subAbilityButton.setVisible(false);
        this.subAbilityButton.buttonText.setVisible(false);

        this.subAbilityButtons.push(this.subAbilityButton);

        this.generateInventoryButtons();

        this.actionMenuFrame = this.add.image(
            460,
            650,
            'gameActionMenuFrame'
        );

        this.inventoryAndAbilityDetailText = this.add.text(
            15,
            215,
            '',
            {
                fontSize: '50px',
                color: '#fff',
                fontFamily: 'CustomFont',
                wordWrap: {
                    width: 500,
                    useAdvancedWrap: true
                }
            }
        );
        this.inventoryAndAbilityDetailText.setVisible(false);

        // set up gold text and icon
        this.coinIcon = this.add.image(433, 665, 'coin');
        this.goldText = this.add.text(
            448,
            647,
            `Gold: ${this.gameScene.player.gold}`,
            {fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont'})
            .setStroke('#000000', 2)
            .setResolution(10);

        // set up soldier text and icon as well as level text
        this.soldierText = this.add.text(
            88,
            620,
            `Soldier / Level ${Math.max(
                1, Math.ceil(
                    0.3 * Math.sqrt(
                        this.gameScene.player.experience
                    )
                )
            )}`,
            {fontSize: '50px', color: '#ffffff', fontFamily: 'CustomFont'})
            .setStroke('#000000', 2)
            .setResolution(10);
        // this.swordIcon = this.add.image(60, 650, 'sword')
        //     .setScale(1.5);

        // create the hp text game object
        this.hpText = this.add.text(
            448,
            620,
            `Hit Points: ${this.gameScene.player.stats.currentHP}`,
            {fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont'})
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
                if (
                    this.interactionState === 'inventory' ||
                    this.interactionState.startsWith('selecting') ||
                    this.interactionState.startsWith('inventoryaction')
                ) {
                    this.selectCancel();
                    return;
                }
                else if (
                    this.interactionState === 'ability' ||
                    this.interactionState === 'charactersheet'
                ) {
                    this.selectCancel();
                }

                // query and build the inventory
                //  buttons right when this button is pressed!
                this.destroyInventoryButtons();
                this.generateInventoryButtons();

                // show the inventory interface!
                this.interactionState = 'inventory';

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

                this.cancelMenuFrame.setX(315);
                this.cancelMenuFrame.setY(315);
                this.cancelMenuFrame.setVisible(true);

                this.cancelButton.setX(347);
                this.cancelButton.setY(350);
                this.cancelButton.buttonText.setX(367);
                this.cancelButton.buttonText.setY(325);
                this.cancelButton.setVisible(true);
                this.cancelButton.buttonText.setVisible(true);
            }
        );

        this.characterButton = new UIActionButton(
            this,
            68,
            650,
            'gameActionMenuCharacterButton',
            'gameActionMenuCharacterButtonActive',
            '',
            () => {
                console.log('clicked the character button!');
                console.log({interactionState: this.interactionState});
                if (this.interactionState.startsWith('inventoryaction')) {
                    const inventorySlotNumber = Number(this.interactionState.split('inventoryaction')[1]);

                    console.log(`using inventory slot number ${inventorySlotNumber} on hero`);
                    this.gameScene.input.keyboard.enabled = false;
                    this.cancelMenuFrame.setVisible(false);
                    this.cancelButton.setVisible(false);
                    this.cancelButton.buttonText.setVisible(false);
                    this.confirmSelectedAbilityOrItemFrame.setVisible(false);
                    this.confirmSelectedAbilityOrItemFrameB.setVisible(false);
                    this.selectedItemAndAbilityIcon.setVisible(false);
                    this.selectedItemAndAbilityIcon.buttonText.setVisible(false);
                    this.commandMenuText.setVisible(false);

                    this.inventoryButton.deselect();
                    this.interactionState = 'handlinghealthpotionselect';

                    this.gameScene.player.inventory.splice(inventorySlotNumber, 1);

                    // finish using the item -> affect the target, delete item from bag
                    //  display new health on screen if needed -> re-enable the keyboard on game scene
                    console.log('just used an item on the game scene!');
                    console.log({
                        gameScenePlayerInventoryAfterRemovingUsedItem: this.gameScene.player.inventory
                    });
                    this.destroyInventoryButtons();

                    const actualAmountHealed = Math.min(
                        30,
                        this.gameScene.player.stats.maxHP - this.gameScene.player.stats.currentHP
                    );
                    this.gameScene.player.stats.currentHP += actualAmountHealed;
                    this.updateHP(this.gameScene.player.stats.currentHP);

                    eventsCenter.emit('GameMessage', `${this.gameScene.player.type} uses a health potion on ${this.gameScene.player.type}, healing them for ${actualAmountHealed} HP.`);

                    this.generateInventoryButtons();
                    this.gameScene.input.keyboard.resetKeys();

                    this.time.addEvent({
                        delay: 2000,
                        callbackScope: this,
                        callback: () => {
                            this.gameScene.input.keyboard.enabled = true;
                            this.interactionState = 'mainselect';
                        }
                    });
                }
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
                if (
                    this.interactionState === 'inventory' ||
                    this.interactionState === 'charactersheet' ||
                    this.interactionState.startsWith('selecting') ||
                    this.interactionState.startsWith('inventoryaction')
                ) {
                    this.selectCancel();
                }
                else if (this.interactionState === 'ability') {
                    this.selectCancel();
                    return;
                }
                // set up ability menu when this button is pressed
                this.interactionState = 'ability';

                this.abilityButton.select();

                this.inventoryAndAbilityMenuFrame.setVisible(true);

                this.subInventoryAndAbilityMenuFrame.setVisible(true);

                this.subAbilityButton.select();
                for (const subAbilityButton of this.subAbilityButtons) {
                    subAbilityButton.setVisible(true);
                    subAbilityButton.buttonText.setVisible(true);
                }

                this.cancelMenuFrame.setX(315);
                this.cancelMenuFrame.setY(315);
                this.cancelMenuFrame.setVisible(true);

                this.cancelButton.setX(347);
                this.cancelButton.setY(350);
                this.cancelButton.buttonText.setX(367);
                this.cancelButton.buttonText.setY(325);
                this.cancelButton.setVisible(true);
                this.cancelButton.buttonText.setVisible(true);

            }
        );

        this.characterSheetButton = new UIActionButton(
            this,
            750,
            650,
            'pagebutton',
            'pagebuttonactive',
            '',
            () => {
                if (
                    this.interactionState === 'inventory' ||
                    this.interactionState === 'ability' ||
                    this.interactionState.startsWith('selecting') ||
                    this.interactionState.startsWith('inventoryaction')
                ) {
                    this.selectCancel();
                }
                else if (this.interactionState === 'charactersheet') {
                    this.selectCancel();
                    return;
                }
                // set up the character sheet -> query and update
                //  the stats before showing the character sheet
                this.updateCharacterSheetStrings();

                this.interactionState = 'charactersheet';
                this.characterSheetButton.select();
                this.inventoryAndAbilityMenuFrame.setVisible(true);

                this.cancelMenuFrame.setX(315);
                this.cancelMenuFrame.setY(488);
                this.cancelMenuFrame.setVisible(true);

                this.cancelButton.setX(347);
                this.cancelButton.setY(523);
                this.cancelButton.buttonText.setX(367);
                this.cancelButton.buttonText.setY(498);
                this.cancelButton.setVisible(true);
                this.cancelButton.buttonText.setVisible(true);

                this.classString.setVisible(true);
                this.levelString.setVisible(true);
                this.hitPointString.setVisible(true);
                this.manaPointString.setVisible(true);
                this.strengthString.setVisible(true);
                this.agilityString.setVisible(true);
                this.vitalityString.setVisible(true);
                this.intellectString.setVisible(true);
                this.luckString.setVisible(true);
                this.tillNextLevelString.setVisible(true);
            }
        );
    }

    public selectCancel() {
        this.commandMenuText.setVisible(false);
        this.cancelMenuFrame.setVisible(false);
        this.cancelButton.setVisible(false);
        this.cancelButton.buttonText.setVisible(false);
        this.subInventoryAndAbilityMenuFrame.setVisible(false);
        this.inventoryAndAbilityMenuFrame.setVisible(false);
        this.inventoryAndAbilityDetailFrame.setVisible(false);
        this.useButton.setVisible(false);
        this.useButton.buttonText.setVisible(false);
        this.inventoryAndAbilityDetailText.setVisible(false);
        // this.message.setVisible(false);
        this.confirmSelectedAbilityOrItemFrame.setVisible(false);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);
        // this.message.text.setVisible(false);
        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);

        for (const subInventoryButton of this.subInventoryButtons) {
            subInventoryButton.setVisible(false);
            subInventoryButton.buttonText.setVisible(false);
        }

        for (const inventoryButton of this.inventoryButtons) {
            inventoryButton.setVisible(false);
            inventoryButton.buttonText.setVisible(false);
            inventoryButton.deselect();
        }

        for (const subAbilityButton of this.subAbilityButtons) {
            subAbilityButton.setVisible(false);
            subAbilityButton.buttonText.setVisible(false);
        }

        this.classString.setVisible(false);
        this.levelString.setVisible(false);
        this.hitPointString.setVisible(false);
        this.manaPointString.setVisible(false);
        this.strengthString.setVisible(false);
        this.agilityString.setVisible(false);
        this.vitalityString.setVisible(false);
        this.intellectString.setVisible(false);
        this.luckString.setVisible(false);
        this.tillNextLevelString.setVisible(false);

        this.inventoryButton.deselect();
        this.abilityButton.deselect();
        this.characterSheetButton.deselect();
        this.interactionState = 'mainselect';
    }

    private calculateTilNextLevel(): number {
        const currentExp = this.gameScene.player.experience;
        let currentLevel = Math.max(1, Math.ceil(0.3 * Math.sqrt(currentExp)));
        const nextLevel = currentLevel + 1;
        let expCounter = 0;
        while (currentLevel < nextLevel) {
            expCounter++;
            currentLevel = Math.max(1, Math.ceil(0.3 * Math.sqrt(currentExp + expCounter)));
        }
        return expCounter;

    }

    private updateCharacterSheetStrings() {
        this.levelString.setText(`Level: ${Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.player.experience)))}`);
        this.hitPointString.setText(`Hit Points: ${this.gameScene.player.stats.currentHP}/${this.gameScene.player.stats.maxHP}`);
        this.manaPointString.setText('Mana Points: 0/0');
        this.strengthString.setText(`Strength: ${Math.floor(this.gameScene.player.stats.strength)}`);
        this.agilityString.setText(`Agility: ${Math.floor(this.gameScene.player.stats.agility)}`);
        this.vitalityString.setText(`Vitality: ${Math.floor(this.gameScene.player.stats.vitality)}`);
        this.intellectString.setText(`Intellect: ${Math.floor(this.gameScene.player.stats.intellect)}`);
        this.luckString.setText(`Luck: ${Math.floor(this.gameScene.player.stats.luck)}`);
        this.tillNextLevelString.setText(`Till Next Level: ${this.calculateTilNextLevel()}`);
    }

    private destroyInventoryButtons() {
        for (const inventoryButton of this.inventoryButtons) {
            inventoryButton.destroy();
            inventoryButton.buttonText.destroy();
        }
        this.inventoryButtons = [];
    }

    private generateInventoryButtons() {
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
                    this.interactionState = `selectinginventoryaction${index}`;

                    this.inventoryIndex = index;
                    this.inventoryButtons[index].select();
                    for (const [inventoryButtonIndex, inventoryButton] of this.inventoryButtons.entries()) {
                        if (inventoryButtonIndex !== index) {
                            inventoryButton.deselect();
                        }
                    }

                    this.cancelMenuFrame.setVisible(false);

                    this.inventoryAndAbilityDetailFrame.setVisible(true);
                    this.inventoryAndAbilityDetailText.setText('Heals a friendly target for 30 HP.');
                    this.inventoryAndAbilityDetailText.setVisible(true);

                    this.useButton.setVisible(true);
                    this.useButton.buttonText.setVisible(true);

                    this.cancelButton.setX(165);
                    this.cancelButton.setY(385);

                    this.cancelButton.buttonText.setX(185);
                    this.cancelButton.buttonText.setY(360);
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

    updateGold(gold: number) {
        this.goldText.text = `Gold: ${gold}`;
    }

    updateXP(xp: number) {
        this.soldierText.setText(`Soldier / Level ${Math.max(1, Math.ceil(0.3 * Math.sqrt(xp)))}`);
    }
}