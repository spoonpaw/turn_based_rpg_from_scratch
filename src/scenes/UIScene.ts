import GameMessage from '../classes/GameMessage';
import Item from '../classes/Item';
import Innkeeper from '../classes/npcs/Innkeeper';
import Merchant from '../classes/npcs/Merchant';
import UIActionButton from '../classes/UIActionButton';
import {ItemInterface} from '../items/items';
import eventsCenter from '../utils/EventsCenter';
import GameScene from './GameScene';
import MusicScene from './MusicScene';
import SFXScene from './SFXScene';

export default class UIScene extends Phaser.Scene {
    public cancelButton!: UIActionButton;
    public cancelMenuFrame!: Phaser.GameObjects.Image;
    public confirmSelectedAbilityOrItemFrame!: Phaser.GameObjects.Image;
    public confirmSelectedAbilityOrItemFrameB!: Phaser.GameObjects.Image;
    public currentNPC!: Merchant | Innkeeper;
    public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    public defenseString!: Phaser.GameObjects.Text;
    public gameScene!: GameScene;
    public goldFrame!: Phaser.GameObjects.Image;
    public goldIcon!: Phaser.GameObjects.Image;
    public goldText!: Phaser.GameObjects.Text;
    public heartIcon!: Phaser.GameObjects.Image;
    public hpText!: Phaser.GameObjects.Text;
    public interactButton!: UIActionButton;
    public interactFrame!: Phaser.GameObjects.Image;
    public interactionState!: string;
    public inventoryAndAbilityDetailFrame!: Phaser.GameObjects.Image;
    public inventoryAndAbilityDetailText!: Phaser.GameObjects.Text;
    public inventoryAndAbilityMenuFrame!: Phaser.GameObjects.Image;
    public leftSideDialogFrame!: Phaser.GameObjects.Image;
    public leftSideDialogText!: Phaser.GameObjects.Text;
    public merchantInventoryButtons: UIActionButton[] = [];
    // public musicMuteButton!: UIActionButton;
    public musicScene!: MusicScene;
    public noButton!: UIActionButton;
    public purchaseButton!: UIActionButton;
    public rightSideDialogOptionsFrame!: Phaser.GameObjects.Image;
    public selectedItemAndAbilityIcon!: UIActionButton;
    public sfxScene!: SFXScene;
    public subInventoryAndAbilityMenuFrame!: Phaser.GameObjects.Image;
    public subInventoryBagButton!: UIActionButton;
    public subInventoryEquipmentButton!: UIActionButton;
    public subInventoryQuestButton!: UIActionButton;
    public useButton!: UIActionButton;
    public yesButton!: UIActionButton;
    private abilityButton!: UIActionButton;
    private actionMenuFrame!: Phaser.GameObjects.Image;
    private agilityString!: Phaser.GameObjects.Text;
    private bodyItemButton!: UIActionButton;
    private bodyString!: Phaser.GameObjects.Text;
    private characterButton!: UIActionButton;
    private characterSheetButton!: UIActionButton;
    private classString!: Phaser.GameObjects.Text;
    private commandMenuText!: Phaser.GameObjects.Text;
    private equipButton!: UIActionButton;
    private equipmentButtons: UIActionButton[] = [];
    private equipmentStrings: Phaser.GameObjects.Text[] = [];
    private headItemButton!: UIActionButton;
    private headString!: Phaser.GameObjects.Text;
    private hitPointString!: Phaser.GameObjects.Text;
    private intellectString!: Phaser.GameObjects.Text;
    private inventoryButton!: UIActionButton;
    private inventoryButtons: UIActionButton[] = [];
    private inventoryIndex!: number;
    private levelString!: Phaser.GameObjects.Text;
    private luckString!: Phaser.GameObjects.Text;
    private mainHandItemButton!: UIActionButton;
    private mainHandString!: Phaser.GameObjects.Text;
    private manaIcon!: Phaser.GameObjects.Image;
    private manaPointString!: Phaser.GameObjects.Text;
    private manaText!: Phaser.GameObjects.Text;
    private message!: GameMessage;
    private offHandItemButton!: UIActionButton;
    private offHandString!: Phaser.GameObjects.Text;
    private selectedItemAndAbilityCommandText!: Phaser.GameObjects.Text;
    private strengthString!: Phaser.GameObjects.Text;
    private subAbilityButton!: UIActionButton;
    private subAbilityButtons: UIActionButton[] = [];
    private subInventoryButtons: UIActionButton[] = [];
    private tillNextLevelString!: Phaser.GameObjects.Text;
    private vitalityString!: Phaser.GameObjects.Text;

    public constructor() {
        super('UI');
    }

    public create() {
        this.musicScene = <MusicScene>this.scene.get('Music');
        this.sfxScene = <SFXScene>this.scene.get('SFX');

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.setupUIElements();
        this.setupEvents();

        this.message = new GameMessage(this);
        this.add.existing(this.message);

        this.interactionState = 'mainselect';
    }

    public destroyEquipmentButtons() {
        for (const equipmentButton of this.equipmentButtons) {
            equipmentButton.destroy();
            equipmentButton.buttonText.destroy();
        }
        this.equipmentButtons = [];
    }

    public destroyInventoryButtons() {
        for (const inventoryButton of this.inventoryButtons) {
            inventoryButton.destroy();
            inventoryButton.buttonText.destroy();
        }
        this.inventoryButtons = [];
    }

    public destroyMerchantInventoryButtons() {
        for (const merchantInventoryButton of this.merchantInventoryButtons) {
            merchantInventoryButton.destroy();
            merchantInventoryButton.buttonText.destroy();
        }
        this.merchantInventoryButtons = [];

    }

    public generateEquipmentButtons() {

        if (!this.gameScene.player.equipment.head) {
            this.headItemButton = new UIActionButton(
                this,
                564,
                250,
                'bagbutton',
                'bagbuttonactive',
                'Empty',
                () => {
                    return;
                }
            );
        }
        else {
            this.headItemButton = new UIActionButton(
                this,
                564,
                250,
                this.gameScene.player.equipment.head.key,
                this.gameScene.player.equipment.head.activeKey,
                this.gameScene.player.equipment.head.name,

                () => {
                    return;
                }
            );
        }
        this.headItemButton.setVisible(false);
        this.headItemButton.buttonText.setVisible(false);
        this.equipmentButtons.push(this.headItemButton);

        if (!this.gameScene.player.equipment.body) {
            this.bodyItemButton = new UIActionButton(
                this,
                564,
                345,
                'bagbutton',
                'bagbuttonactive',
                'Empty',
                () => {
                    return;
                }
            );
        }
        else {
            this.bodyItemButton = new UIActionButton(
                this,
                564,
                345,
                this.gameScene.player.equipment.body.key,
                this.gameScene.player.equipment.body.activeKey,
                this.gameScene.player.equipment.body.name,

                () => {
                    return;
                }
            );
        }
        this.bodyItemButton.setVisible(false);
        this.bodyItemButton.buttonText.setVisible(false);
        this.equipmentButtons.push(this.bodyItemButton);

        if (!this.gameScene.player.equipment.weapon) {
            this.mainHandItemButton = new UIActionButton(
                this,
                564,
                440,
                'bagbutton',
                'bagbuttonactive',
                'Empty',
                () => {
                    return;
                }
            );
        }
        else {
            this.mainHandItemButton = new UIActionButton(
                this,
                564,
                440,
                this.gameScene.player.equipment.weapon.key,
                this.gameScene.player.equipment.weapon.activeKey,
                this.gameScene.player.equipment.weapon.name,

                () => {
                    return;
                }
            );
        }
        this.mainHandItemButton.setVisible(false);
        this.mainHandItemButton.buttonText.setVisible(false);
        this.equipmentButtons.push(this.mainHandItemButton);

        if (!this.gameScene.player.equipment.offhand) {
            this.offHandItemButton = new UIActionButton(
                this,
                564,
                535,
                'bagbutton',
                'bagbuttonactive',
                'Empty',
                () => {
                    return;
                }
            );
        }
        else {
            this.offHandItemButton = new UIActionButton(
                this,
                564,
                535,
                this.gameScene.player.equipment.offhand.key,
                this.gameScene.player.equipment.offhand.activeKey,
                this.gameScene.player.equipment.offhand.name,

                () => {
                    return;
                }
            );
        }
        this.offHandItemButton.setVisible(false);
        this.offHandItemButton.buttonText.setVisible(false);
        this.equipmentButtons.push(this.offHandItemButton);
    }

    public generateMerchantInventoryButtons(inventory: ItemInterface[]) {
        // iterate over all weapon merchant inventory entries

        for (const [index, item] of inventory.entries()) {
            const itemButton = new UIActionButton(
                this,
                564,
                216 + (index * 50),
                item.key,
                item.activekey,
                item.name,
                () => {
                    this.interactionState = `merchantbuyitem${index}`;
                    // select the clicked item button
                    for (const [buttonIndex, uiButton] of this.merchantInventoryButtons.entries()) {
                        if (index === buttonIndex) {
                            uiButton.select();
                        }
                        else {
                            uiButton.deselect();
                        }
                    }
                    this.cancelMenuFrame.setVisible(false);
                    this.cancelButton.setVisible(false);
                    this.cancelButton.buttonText.setVisible(false);
                    this.inventoryAndAbilityDetailFrame.setVisible(true);
                    this.purchaseButton.setVisible(true);
                    this.purchaseButton.buttonText.setText(`Purchase for ${item.cost} gold`);
                    this.purchaseButton.buttonText.setVisible(true);

                    if (item.type === 'weapon' || item.type === 'bodyarmor') {
                        this.inventoryAndAbilityDetailText.setText(
                            `${item.description}\n\n
                            Strength: ${item.stats!.strength}, Agility: ${item.stats!.agility},
                                Vitality: ${item.stats!.vitality}, Intellect: ${item.stats!.intellect},
                                Luck: ${item.stats!.luck}, Defense: ${item.stats!.defense},
                                Classes: All,
                                Min. Level: 1`
                        );
                    }
                    this.inventoryAndAbilityDetailText.setVisible(true);
                }
            );
            this.merchantInventoryButtons.push(itemButton);
        }

    }

    public init() {
        // grab a reference to the game scene
        this.gameScene = <GameScene>this.scene.get('Game');
    }

    public selectCancel() {

        if (this.gameScene.operatingSystem !== 'desktop') {
            // this.scene.launch('GamePad');
            this.gameScene.gamePadScene?.scene.restart();
        }
        // entering ui scene 'selectcancel' method
        eventsCenter.removeListener('space');
        if (!this.gameScene.input.keyboard!.enabled) {
            this.gameScene.input.keyboard!.resetKeys();
        }
        this.commandMenuText.setVisible(false);
        this.selectedItemAndAbilityCommandText.setVisible(false);
        this.cancelMenuFrame.setVisible(false);
        this.cancelButton.setVisible(false);
        this.cancelButton.buttonText.setVisible(false);
        this.subInventoryAndAbilityMenuFrame.setVisible(false);
        this.inventoryAndAbilityMenuFrame.setVisible(false);
        this.goldFrame.setVisible(false);
        this.goldIcon.setVisible(false);
        this.goldText.setVisible(false);
        this.inventoryAndAbilityDetailFrame.setVisible(false);
        this.useButton.setVisible(false);
        this.useButton.buttonText.setVisible(false);
        this.equipButton.setVisible(false);
        this.equipButton.buttonText.setVisible(false);
        this.inventoryAndAbilityDetailText.setVisible(false);
        // this.message.setVisible(false);
        this.confirmSelectedAbilityOrItemFrame.setVisible(false);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);
        // this.message.text.setVisible(false);
        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);
        this.leftSideDialogFrame.setVisible(false);
        this.leftSideDialogText.setVisible(false);
        this.rightSideDialogOptionsFrame.setVisible(false);
        this.yesButton.setVisible(false);
        this.yesButton.buttonText.setVisible(false);
        this.noButton.setVisible(false);
        this.noButton.buttonText.setVisible(false);
        this.purchaseButton.setVisible(false);
        this.purchaseButton.buttonText.setVisible(false);

        for (const subInventoryButton of this.subInventoryButtons) {
            if (subInventoryButton.visible) {
                subInventoryButton.setVisible(false);
                subInventoryButton.buttonText.setVisible(false);
            }
        }

        for (const inventoryButton of this.inventoryButtons) {
            if (inventoryButton.visible) {
                inventoryButton.setVisible(false);
                inventoryButton.buttonText.setVisible(false);
                inventoryButton.deselect();
            }
        }

        for (const merchantInventoryButton of this.merchantInventoryButtons) {
            if (merchantInventoryButton.visible) {
                merchantInventoryButton.setVisible(false);
                merchantInventoryButton.buttonText.setVisible(false);
                merchantInventoryButton.deselect();
            }
        }

        for (const subAbilityButton of this.subAbilityButtons) {
            if (subAbilityButton.visible) {
                subAbilityButton.setVisible(false);
                subAbilityButton.buttonText.setVisible(false);
            }
        }

        for (const equipmentString of this.equipmentStrings) {
            if (equipmentString.visible) {
                equipmentString.setVisible(false);
            }
        }

        for (const equipmentButton of this.equipmentButtons) {
            if (equipmentButton.visible) {
                equipmentButton.setVisible(false);
                equipmentButton.buttonText.setVisible(false);
            }
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
        this.defenseString.setVisible(false);
        this.tillNextLevelString.setVisible(false);

        this.inventoryButton.deselect();
        this.abilityButton.deselect();
        this.characterSheetButton.deselect();
        this.interactionState = 'mainselectnodialog';
        this.gameScene.input.keyboard!.enabled = true;
    }

    public setupEvents() {
        // listen for the updateHP event from the events center
        // eventsCenter.removeListener('updateHP');
        // eventsCenter.on('updateHP', this.updateHP, this);

        // listen for the updateGold event from the events center
        // eventsCenter.removeListener('updateGold');
        // eventsCenter.on('updateGold', this.updateGold, this);
        eventsCenter.removeListener('updateMP');
        eventsCenter.on('updateMP', this.updateMP, this);

        // listen for the updateXP event from the events center
        // eventsCenter.removeListener('updateXP');
        // eventsCenter.on('updateXP', this.updateXP, this);
    }

    public setupUIElements() {

        // START FRAME SECTION
        this.actionMenuFrame = this.add.image(
            460,
            650,
            'gameActionMenuFrame'
        );

        this.leftSideDialogFrame = this.add.image(40, 380, 'leftsidedialogframe')
            .setOrigin(0, 0);
        this.leftSideDialogFrame.setVisible(false);

        this.rightSideDialogOptionsFrame = this.add.image(670, 380, 'rightsidedialogoptionsframe')
            .setOrigin(0, 0);
        this.rightSideDialogOptionsFrame.setVisible(false);

        this.cancelMenuFrame = this.add.image(315, 315, 'cancelMenuFrame')
            .setOrigin(0, 0);
        this.cancelMenuFrame.setVisible(false);

        this.inventoryAndAbilityMenuFrame = this.add.image(532, 181, 'inventoryAndAbilityMenuFrame')
            .setOrigin(0, 0);
        this.inventoryAndAbilityMenuFrame.setVisible(false);

        this.goldFrame = this.add.image(532, 108, 'goldFrame')
            .setOrigin(0, 0);
        this.goldFrame.setVisible(false);

        this.subInventoryAndAbilityMenuFrame = this.add.image(236, 430, 'subInventoryAndAbilityMenuFrame')
            .setOrigin(0, 0);
        this.subInventoryAndAbilityMenuFrame.setVisible(false);

        this.confirmSelectedAbilityOrItemFrame = this.add.image(236, 430, 'confirmSelectedAbilityOrItemFrame')
            .setOrigin(0, 0);
        this.confirmSelectedAbilityOrItemFrame.setVisible(false);

        this.confirmSelectedAbilityOrItemFrameB = this.add.image(236, 505, 'confirmSelectedAbilityOrItemFrameB')
            .setOrigin(0, 0);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);

        this.inventoryAndAbilityDetailFrame = this.add.image(3, 105, 'inventoryAndAbilityDetailFrame')
            .setOrigin(0, 0);
        this.inventoryAndAbilityDetailFrame.setVisible(false);

        this.interactFrame = this.add.image(
            Number(this.game.config.width) / 2,
            550,
            'cancelMenuFrame'
        );
        this.interactFrame.setVisible(false);

        // END FRAME SECTION

        // START TEXT SECTION

        this.goldText = this.add.text(584, 112, '0 gp', {
            color: '#ffffff', align: 'left', fontFamily: 'CustomFont', wordWrap: {
                width: 610,
                useAdvancedWrap: true
            }
        })
            .setResolution(10)
            .setFontSize(50);
        this.goldText.setVisible(false);

        this.leftSideDialogText = this.add.text(50, 380, '', {
            color: '#ffffff', align: 'left', fontFamily: 'CustomFont', wordWrap: {
                width: 610,
                useAdvancedWrap: true
            }
        })
            .setResolution(10)
            .setFontSize(50)
            .setLineSpacing(-18);

        this.commandMenuText = this.add.text(244, 440, 'Command?', {
            fontSize: '55px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.commandMenuText.setVisible(false);

        this.selectedItemAndAbilityCommandText = this.add.text(
            244,
            510,
            'Choose A Target',
            {
                fontSize: '55px',
                color: '#fff',
                fontFamily: 'CustomFont'
            }
        )
            .setResolution(10);
        this.selectedItemAndAbilityCommandText.setVisible(false);


        // START EQUIPMENT STRING SECTION

        this.headString = this.add.text(540, 180, 'Head:', {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.headString.setVisible(false);
        this.equipmentStrings.push(this.headString);

        this.bodyString = this.add.text(540, 275, 'Body:', {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.bodyString.setVisible(false);
        this.equipmentStrings.push(this.bodyString);

        this.mainHandString = this.add.text(540, 370, 'Main Hand:', {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.mainHandString.setVisible(false);
        this.equipmentStrings.push(this.mainHandString);

        this.offHandString = this.add.text(540, 465, 'Off Hand:', {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.offHandString.setVisible(false);
        this.equipmentStrings.push(this.offHandString);

        // END EQUIPMENT STRING SECTION

        // START CHARACTER SHEET STRING SECTION

        this.classString = this.add.text(540, 185, 'Class: Soldier', {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.classString.setVisible(false);

        this.levelString = this.add.text(540, 221, `Level: ${Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.player.experience)))}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.levelString.setVisible(false);

        this.hitPointString = this.add.text(540, 257, `Hit Points: ${this.gameScene.player.stats.currentHP}/${this.gameScene.player.stats.maxHP}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.hitPointString.setVisible(false);

        this.manaPointString = this.add.text(540, 293, 'Mana Points: 0/0', {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.manaPointString.setVisible(false);

        this.strengthString = this.add.text(540, 329, `Strength: ${Math.floor(this.gameScene.player.getCombinedStat('strength'))}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.strengthString.setVisible(false);

        this.agilityString = this.add.text(540, 365, `Agility: ${Math.floor(this.gameScene.player.stats.agility)}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.agilityString.setVisible(false);

        this.vitalityString = this.add.text(540, 401, `Vitality: ${Math.floor(this.gameScene.player.stats.vitality)}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.vitalityString.setVisible(false);

        this.intellectString = this.add.text(540, 437, `Intellect: ${Math.floor(this.gameScene.player.stats.intellect)}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.intellectString.setVisible(false);

        this.luckString = this.add.text(540, 473, `Luck: ${Math.floor(this.gameScene.player.stats.luck)}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.luckString.setVisible(false);

        this.defenseString = this.add.text(540, 509, `Defense: ${this.gameScene.player.getCombinedStat('defense')}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.defenseString.setVisible(false);

        this.tillNextLevelString = this.add.text(540, 545, `Till Next Level: ${this.calculateTilNextLevel()}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.tillNextLevelString.setVisible(false);

        // END CHARACTER SHEET STRING SECTION

        // END TEXT SECTION

        // START BUTTON SECTION
        this.interactButton = new UIActionButton(
            this,
            385,
            550,
            'checkbutton',
            'checkbuttonactive',
            'Interact',
            () => {
                this.gameScene.readyToInteractObject?.runDialog();
                return;
            }
        );
        this.interactButton.setVisible(false);
        this.interactButton.buttonText.setVisible(false);


        this.yesButton = new UIActionButton(
            this,
            710,
            415,
            'checkbutton',
            'checkbuttonactive',
            'Yes',
            () => {
                eventsCenter.emit('yes');
            }
        );
        this.yesButton.setVisible(false);
        this.yesButton.buttonText.setVisible(false);

        this.noButton = new UIActionButton(
            this,
            710,
            465,
            'crossbutton',
            'crossbuttonactive',
            'No',
            () => {
                this.interactionState = 'cancelmouse';

                if (this.gameScene.operatingSystem !== 'desktop') {
                    // this.scene.launch('GamePad');
                    this.gameScene.gamePadScene?.scene.restart();
                }
                eventsCenter.removeListener('space');

                this.goldFrame.setVisible(false);
                this.goldIcon.setVisible(false);
                this.goldText.setVisible(false);
                this.leftSideDialogFrame.setVisible(false);
                this.leftSideDialogText.setText('');
                this.leftSideDialogText.setVisible(false);
                this.rightSideDialogOptionsFrame.setVisible(false);
                this.yesButton.setVisible(false);
                this.yesButton.buttonText.setVisible(false);
                this.noButton.setVisible(false);
                this.noButton.buttonText.setVisible(false);

                this.gameScene.input.keyboard!.enabled = true;
                this.gameScene.input.keyboard!.resetKeys();
            }
        );
        this.noButton.setVisible(false);
        this.noButton.buttonText.setVisible(false);

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

        this.purchaseButton = new UIActionButton(
            this,
            35,
            392,
            'checkbutton',
            'checkbutton',
            'Purchase',
            () => {
                // purchase button clicked

                if (
                    this.currentNPC instanceof Merchant &&
                    this.currentNPC.inventory &&
                    this.interactionState.startsWith('merchantbuyitem')
                ) {
                    // get the item index from the interaction state
                    const itemIndex = this.interactionState.split('merchantbuyitem')[1];
                    const selectedItem = this.currentNPC.inventory[Number(itemIndex)];
                    // purchasing ${selectedItem.name}
                    // get the player's gold, if it's too low then he gets nothing

                    if (this.gameScene.player.inventory.length === 8) {
                        // hide all the merchant related frames
                        this.inventoryAndAbilityMenuFrame.setVisible(false);
                        this.subInventoryAndAbilityMenuFrame.setVisible(false);
                        this.inventoryAndAbilityDetailFrame.setVisible(false);
                        this.inventoryAndAbilityDetailText.setVisible(false);
                        this.purchaseButton.setVisible(false);
                        this.purchaseButton.buttonText.setVisible(false);
                        this.subInventoryBagButton.setVisible(false);
                        this.subInventoryBagButton.buttonText.setVisible(false);

                        for (const merchantInventoryButton of this.merchantInventoryButtons) {
                            merchantInventoryButton.setVisible(false);
                            merchantInventoryButton.buttonText.setVisible(false);
                        }
                        this.leftSideDialogFrame.setVisible(true);
                        this.leftSideDialogText.setText('Merchant:\nThou art ov\'r encumb\'r\'d!');
                        this.leftSideDialogText.setVisible(true);

                        this.cancelMenuFrame.setX(670);
                        this.cancelMenuFrame.setY(380);
                        this.cancelMenuFrame.setVisible(true);
                        this.cancelButton.setX(702);
                        this.cancelButton.setY(415);
                        this.cancelButton.setVisible(true);
                        this.cancelButton.buttonText.setX(722);
                        this.cancelButton.buttonText.setY(390);
                        this.cancelButton.buttonText.setText('Farewell');
                        this.cancelButton.buttonText.setVisible(true);
                    }
                    else if (this.gameScene.player.gold < selectedItem.cost) {
                        // process the rejection

                        // hide all the merchant related frames
                        this.inventoryAndAbilityMenuFrame.setVisible(false);
                        this.subInventoryAndAbilityMenuFrame.setVisible(false);
                        this.inventoryAndAbilityDetailFrame.setVisible(false);
                        this.inventoryAndAbilityDetailText.setVisible(false);
                        this.purchaseButton.setVisible(false);
                        this.purchaseButton.buttonText.setVisible(false);
                        this.subInventoryBagButton.setVisible(false);
                        this.subInventoryBagButton.buttonText.setVisible(false);

                        for (const merchantInventoryButton of this.merchantInventoryButtons) {
                            merchantInventoryButton.setVisible(false);
                            merchantInventoryButton.buttonText.setVisible(false);
                        }
                        this.leftSideDialogFrame.setVisible(true);
                        this.leftSideDialogText.setText('Merchant:\nYou haven\'t enough coin!');
                        this.leftSideDialogText.setVisible(true);

                        this.cancelMenuFrame.setX(670);
                        this.cancelMenuFrame.setY(380);
                        this.cancelMenuFrame.setVisible(true);
                        this.cancelButton.setX(702);
                        this.cancelButton.setY(415);
                        this.cancelButton.setVisible(true);
                        this.cancelButton.buttonText.setX(722);
                        this.cancelButton.buttonText.setY(390);
                        this.cancelButton.buttonText.setText('Farewell');
                        this.cancelButton.buttonText.setVisible(true);
                    }
                    else {
                        // handle buying the item, take the gold from the player
                        //  and put the item in their inventory
                        //  process the purchase

                        // hide all the merchant related frames
                        this.inventoryAndAbilityMenuFrame.setVisible(false);
                        this.subInventoryAndAbilityMenuFrame.setVisible(false);
                        this.inventoryAndAbilityDetailFrame.setVisible(false);
                        this.inventoryAndAbilityDetailText.setVisible(false);
                        this.purchaseButton.setVisible(false);
                        this.purchaseButton.buttonText.setVisible(false);
                        this.subInventoryBagButton.setVisible(false);
                        this.subInventoryBagButton.buttonText.setVisible(false);

                        for (const merchantInventoryButton of this.merchantInventoryButtons) {
                            merchantInventoryButton.setVisible(false);
                            merchantInventoryButton.buttonText.setVisible(false);
                        }
                        this.leftSideDialogFrame.setVisible(true);
                        this.leftSideDialogText.setText('Merchant:\nThanketh thee f\'r thy patronage!');
                        this.leftSideDialogText.setVisible(true);

                        this.cancelMenuFrame.setX(670);
                        this.cancelMenuFrame.setY(380);
                        this.cancelMenuFrame.setVisible(true);
                        this.cancelButton.setX(702);
                        this.cancelButton.setY(415);
                        this.cancelButton.setVisible(true);
                        this.cancelButton.buttonText.setX(722);
                        this.cancelButton.buttonText.setY(390);
                        this.cancelButton.buttonText.setText('Farewell');
                        this.cancelButton.buttonText.setVisible(true);

                        this.gameScene.player.inventory.push(
                            new Item(
                                selectedItem.key,
                                selectedItem.activekey,
                                selectedItem.name,
                                selectedItem.type,
                                selectedItem.cost,
                                selectedItem.description,
                                undefined,
                                selectedItem.classes,
                                selectedItem.stats
                            )
                        );
                        this.gameScene.player.gold -= selectedItem.cost;
                        this.updateGold();
                    }
                }
            }
        );
        this.purchaseButton.setVisible(false);
        this.purchaseButton.buttonText.setVisible(false);

        this.useButton = new UIActionButton(
            this,
            35,
            392,
            'checkbutton',
            'checkbutton',
            'Use',
            () => {
                // setting the interaction state from the use button
                this.interactionState = this.interactionState.split('selecting')[1];

                this.goldFrame.setVisible(false);
                this.goldIcon.setVisible(false);
                this.goldText.setVisible(false);
                this.inventoryAndAbilityMenuFrame.setVisible(false);
                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.subInventoryAndAbilityMenuFrame.setVisible(false);
                this.inventoryAndAbilityDetailText.setVisible(false);
                this.subInventoryBagButton.setVisible(false);
                this.subInventoryBagButton.buttonText.setVisible(false);
                this.subInventoryEquipmentButton.setVisible(false);
                this.subInventoryEquipmentButton.buttonText.setVisible(false);
                this.subInventoryQuestButton.setVisible(false);
                this.subInventoryQuestButton.buttonText.setVisible(false);
                this.useButton.setVisible(false);
                this.useButton.buttonText.setVisible(false);
                this.selectedItemAndAbilityIcon.setVisible(true);
                this.selectedItemAndAbilityIcon.buttonText.setVisible(true);

                this.cancelMenuFrame.setX(698);
                this.cancelMenuFrame.setY(430);
                this.cancelMenuFrame.setVisible(true);
                this.confirmSelectedAbilityOrItemFrame.setVisible(true);
                this.confirmSelectedAbilityOrItemFrameB.setVisible(true);

                this.selectedItemAndAbilityCommandText.setText('Choose A Target');
                this.selectedItemAndAbilityCommandText.setVisible(true);

                // this.commandMenuText.setText('\nChoose A Target');
                // this.commandMenuText.setVisible(true);

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

        this.equipButton = new UIActionButton(
            this,
            35,
            392,
            'checkbutton',
            'checkbutton',
            'Equip',
            () => {
                // equip button clicked!!!

                const inventorySlotNumber = Number(this.interactionState.split('inventoryaction')[1]);

                // remove the selected item from the main inventory,
                //  add it to the corresponding equipment slot!
                //  refer to
                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.inventoryAndAbilityDetailText.setVisible(false);
                this.equipButton.setVisible(false);
                this.equipButton.buttonText.setVisible(false);
                this.cancelButton.setX(347);
                this.cancelButton.setY(350);
                this.cancelButton.buttonText.setY(325);
                this.cancelButton.buttonText.setX(367);
                this.cancelMenuFrame.setX(315);
                this.cancelMenuFrame.setY(315);
                this.cancelMenuFrame.setVisible(true);

                const itemToEquip = this.gameScene.player.inventory[inventorySlotNumber];
                if (itemToEquip.type === 'weapon') {
                    this.gameScene.player.equipment.weapon = itemToEquip;
                }
                else if (itemToEquip.type === 'bodyarmor') {
                    this.gameScene.player.equipment.body = itemToEquip;
                }

                this.gameScene.player.inventory.splice(inventorySlotNumber, 1);

                this.destroyInventoryButtons();

                this.generateInventoryButtons();
                for (const inventoryButton of this.inventoryButtons) {
                    inventoryButton.setVisible(true);
                    inventoryButton.buttonText.setVisible(true);
                }
            }
        );
        this.equipButton.setVisible(false);
        this.equipButton.buttonText.setVisible(false);

        // START SUBINVENTORY BAG BUTTONS SECTION

        this.subInventoryBagButton = new UIActionButton(
            this,
            265,
            465,
            'bagbutton',
            'bagbuttonactive',
            'Inventory',
            () => {
                if (
                    this.interactionState === 'inventory' ||
                    this.interactionState.startsWith('merchant')
                ) {
                    return;
                }
                this.interactionState = 'inventory';
                this.subInventoryBagButton.select();
                this.subInventoryEquipmentButton.deselect();
                this.subInventoryQuestButton.deselect();
                for (const equipmentString of this.equipmentStrings) {
                    equipmentString.setVisible(false);
                }
                for (const equipmentButton of this.equipmentButtons) {
                    equipmentButton.setVisible(false);
                    equipmentButton.buttonText.setVisible(false);
                }
                this.destroyInventoryButtons();
                this.generateInventoryButtons();
                for (const inventoryButton of this.inventoryButtons) {
                    inventoryButton.deselect();
                    inventoryButton.setVisible(true);
                    inventoryButton.buttonText.setVisible(true);
                }
            }
        );
        this.subInventoryBagButton.setVisible(false);
        this.subInventoryBagButton.buttonText.setVisible(false);

        this.subInventoryButtons.push(this.subInventoryBagButton);

        this.subInventoryEquipmentButton = new UIActionButton(
            this,
            265,
            515,
            'bagbutton',
            'bagbuttonactive',
            'Equipment',
            () => {
                this.interactionState = 'equipment';
                // subinventory equipment button clicked
                // destroy all the inventory buttons!!
                this.destroyInventoryButtons();
                this.subInventoryBagButton.deselect();
                this.subInventoryQuestButton.deselect();
                this.subInventoryEquipmentButton.select();

                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.inventoryAndAbilityDetailText.setVisible(false);
                this.useButton.setVisible(false);
                this.useButton.buttonText.setVisible(false);
                this.equipButton.setVisible(false);
                this.equipButton.buttonText.setVisible(false);

                for (const equipmentString of this.equipmentStrings) {
                    equipmentString.setVisible(true);
                }

                // REFRESH THE EQUIPMENT LIST
                this.destroyEquipmentButtons();
                this.generateEquipmentButtons();

                for (const equipmentButton of this.equipmentButtons) {
                    equipmentButton.setVisible(true);
                    equipmentButton.buttonText.setVisible(true);
                }

                this.cancelButton.setX(347);
                this.cancelButton.setY(350);

                this.cancelButton.buttonText.setY(325);
                this.cancelButton.buttonText.setX(367);

                this.cancelMenuFrame.setX(315);
                this.cancelMenuFrame.setY(315);

                this.cancelMenuFrame.setVisible(true);
                this.cancelButton.setVisible(true);
                this.cancelButton.buttonText.setText('Cancel');
                this.cancelButton.buttonText.setVisible(true);
            }
        );
        this.subInventoryEquipmentButton.setVisible(false);
        this.subInventoryEquipmentButton.buttonText.setVisible(false);

        this.subInventoryButtons.push(this.subInventoryEquipmentButton);

        this.generateEquipmentButtons();

        this.subInventoryQuestButton = new UIActionButton(
            this,
            265,
            565,
            'bagbutton',
            'bagbuttonactive',
            'Quest',
            () => {
                return;
            }
        );
        this.subInventoryQuestButton.setVisible(false);
        this.subInventoryQuestButton.buttonText.setVisible(false);

        this.subInventoryButtons.push(this.subInventoryQuestButton);

        // END SUBINVENTORY BAG BUTTONS SECTION

        // START SUBABILITY BUTTONS SECTION

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

        // END SUBABILITY BUTTONS SECTION
        // END BUTTON SECTION

        this.generateInventoryButtons();

        this.inventoryAndAbilityDetailText = this.add.text(
            15,
            110,
            '',
            {
                fontSize: '45px',
                color: '#fff',
                fontFamily: 'CustomFont',
                wordWrap: {
                    width: 500,
                    useAdvancedWrap: true
                }
            }
        );
        this.inventoryAndAbilityDetailText.setLineSpacing(-16);
        this.inventoryAndAbilityDetailText.setVisible(false);
        this.inventoryAndAbilityDetailText.setResolution(10);

        // set up gold text and icon
        this.manaIcon = this.add.image(100, 663, 'mana');

        let currentMP;
        let maxMP;

        if (this.gameScene.player.type === 'Soldier') {
            currentMP = 0;
            maxMP = 0;
        }
        else {
            currentMP = this.gameScene.player.stats.currentMP;
            maxMP = this.gameScene.player.stats.maxMP;
        }

        this.manaText = this.add.text(
            115,
            647,
            `MP: ${currentMP} / ${maxMP}`,
            {fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont'})
            .setStroke('#000000', 2)
            .setResolution(10);

        // create the hp text game object
        this.hpText = this.add.text(
            115,
            620,
            `HP: ${this.gameScene.player.stats.currentHP} / ${this.gameScene.player.stats.maxHP}`,
            {fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont'})
            .setStroke('#000000', 2)
            .setResolution(10);
        // create heart icon
        this.heartIcon = this.add.image(100, 638, 'heart')
            .setScale(1.25);

        this.goldIcon = this.add.image(563, 142, 'coin')
            .setScale(1.25);
        this.goldIcon.setVisible(false);

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
                    this.interactionState === 'equipment' ||
                    this.interactionState.startsWith('selecting') ||
                    this.interactionState.startsWith('inventoryaction')
                ) {
                    this.selectCancel();
                    if (this.gameScene.operatingSystem !== 'desktop') {
                        // this.scene.launch('GamePad');
                        this.gameScene.gamePadScene?.scene.restart();
                    }
                    return;
                }
                else if (
                    this.interactionState === 'ability' ||
                    this.interactionState === 'charactersheet' ||
                    this.interactionState.startsWith('merchant') ||
                    this.interactionState.startsWith('innkeeper')
                ) {
                    this.selectCancel();
                }
                // this.sfxScene.playSound('select');
                // this.gameScene.gamePadScene?.scene.stop();

                // query and build the inventory
                //  buttons right when this button is pressed!
                this.destroyInventoryButtons();
                this.generateInventoryButtons();

                // show the inventory interface!
                this.interactionState = 'inventory';

                this.updateGold();
                this.goldFrame.setVisible(true);
                this.goldIcon.setVisible(true);
                this.goldText.setVisible(true);

                this.inventoryAndAbilityMenuFrame.setVisible(true);
                for (const inventoryButton of this.inventoryButtons) {
                    inventoryButton.setVisible(true);
                    inventoryButton.buttonText.setVisible(true);
                }

                this.subInventoryAndAbilityMenuFrame.setVisible(true);
                this.subInventoryBagButton.buttonText.setText('Inventory');

                for (const subInventoryButton of this.subInventoryButtons) {
                    subInventoryButton.setVisible(true);
                    subInventoryButton.buttonText.setVisible(true);
                }

                this.inventoryButton.select();
                this.subInventoryBagButton.select();
                this.subInventoryEquipmentButton.deselect();
                this.subInventoryQuestButton.deselect();

                this.cancelMenuFrame.setX(315);
                this.cancelMenuFrame.setY(315);
                this.cancelMenuFrame.setVisible(true);

                this.cancelButton.setX(347);
                this.cancelButton.setY(350);
                this.cancelButton.buttonText.setX(367);
                this.cancelButton.buttonText.setY(325);
                this.cancelButton.setVisible(true);
                this.cancelButton.buttonText.setText('Cancel');
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
                // uncomment to log interaction state by clicking player portrait
                // console.log({interactionState: this.interactionState});
                if (this.interactionState.startsWith('inventoryaction')) {
                    const inventorySlotNumber = Number(this.interactionState.split('inventoryaction')[1]);

                    // using inventory slot number ${inventorySlotNumber} on hero
                    this.gameScene.input.keyboard!.enabled = false;
                    this.cancelMenuFrame.setVisible(false);
                    this.cancelButton.setVisible(false);
                    this.cancelButton.buttonText.setVisible(false);
                    this.confirmSelectedAbilityOrItemFrame.setVisible(false);
                    this.confirmSelectedAbilityOrItemFrameB.setVisible(false);
                    this.selectedItemAndAbilityIcon.setVisible(false);
                    this.selectedItemAndAbilityIcon.buttonText.setVisible(false);
                    this.commandMenuText.setVisible(false);
                    this.selectedItemAndAbilityCommandText.setVisible(false);

                    this.inventoryButton.deselect();
                    this.interactionState = 'handlinghealthpotionselect';

                    this.gameScene.player.inventory.splice(inventorySlotNumber, 1);

                    // finish using the item -> affect the target, delete item from bag
                    //  display new health on screen if needed -> re-enable the keyboard on game scene
                    // just used an item on the game scene!
                    this.destroyInventoryButtons();

                    const actualAmountHealed = Math.min(
                        30,
                        this.gameScene.player.stats.maxHP - this.gameScene.player.stats.currentHP
                    );
                    this.gameScene.player.stats.currentHP += actualAmountHealed;
                    this.updateHP(this.gameScene.player.stats.currentHP, this.gameScene.player.stats.maxHP);

                    this.sfxScene.playSound('potion');
                    eventsCenter.emit('GameMessage', `${this.gameScene.player.type} uses a health potion on ${this.gameScene.player.type}, healing them for ${actualAmountHealed} HP.`);

                    this.generateInventoryButtons();
                    this.gameScene.input.keyboard!.resetKeys();

                    this.time.addEvent({
                        delay: 2000,
                        callbackScope: this,
                        callback: () => {
                            this.gameScene.input.keyboard!.enabled = true;
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
                    this.interactionState === 'equipment' ||
                    this.interactionState === 'charactersheet' ||
                    this.interactionState.startsWith('selecting') ||
                    this.interactionState.startsWith('inventoryaction') ||
                    this.interactionState.startsWith('merchant') ||
                    this.interactionState.startsWith('innkeeper')
                ) {
                    this.selectCancel();
                }
                else if (
                    this.interactionState === 'ability'
                ) {
                    this.selectCancel();
                    if (this.gameScene.operatingSystem !== 'desktop') {
                        // this.scene.launch('GamePad');
                        this.gameScene.gamePadScene?.scene.restart();
                    }
                    return;
                }
                // this.sfxScene.playSound('select');
                // set up ability menu when this button is pressed
                this.interactionState = 'ability';
                // if (this.gameScene.operatingSystem !== 'desktop') {
                //     this.scene.sleep('GamePad');
                // }

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
                this.cancelButton.buttonText.setText('Cancel');
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
                    this.interactionState === 'equipment' ||
                    this.interactionState === 'ability' ||
                    this.interactionState.startsWith('selecting') ||
                    this.interactionState.startsWith('inventoryaction') ||
                    this.interactionState.startsWith('merchant') ||
                    this.interactionState.startsWith('innkeeper')
                ) {
                    this.selectCancel();
                }
                else if (this.interactionState === 'charactersheet') {
                    this.selectCancel();
                    if (this.gameScene.operatingSystem !== 'desktop') {
                        // this.scene.launch('GamePad');
                        this.gameScene.gamePadScene?.scene.restart();
                    }
                    return;
                }
                // set up the character sheet -> query and update
                //  the stats before showing the character sheet
                this.updateCharacterSheetStrings();
                // this.gameScene.gamePadScene?.scene.stop();

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
                this.cancelButton.buttonText.setText('Cancel');
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
                this.defenseString.setVisible(true);
                this.tillNextLevelString.setVisible(true);
            }
        );
    }

    public update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            eventsCenter.emit('space');
            // this.gameScene.spaceDown = true;
            if (
                this.interactionState === 'cancelmouse' ||
                this.interactionState === 'mainselectnodialog'
            ) {
                this.interactionState = 'mainselect';

                if (this.gameScene.weaponMerchant || this.gameScene.innKeeper || this.gameScene.armorMerchant) {
                    // space bar pressed on game scene (npc[s] found)

                    // listening for interactivity on npcs
                    if (this.gameScene.weaponMerchant) this.gameScene.weaponMerchant.listenForInteractEvent();
                    if (this.gameScene.armorMerchant) this.gameScene.armorMerchant.listenForInteractEvent();
                    if (this.gameScene.innKeeper) this.gameScene.innKeeper.listenForInteractEvent();
                }
            }
            else if (
                // this.interactionState === 'inventory' ||
                this.interactionState === 'ability' ||
                this.interactionState === 'charactersheet' ||
                this.interactionState.startsWith('selectinginventoryaction') ||
                this.interactionState.startsWith('inventory') ||
                this.interactionState.startsWith('equipment')
            ) {
                this.selectCancel();
            }
        }
        if (Phaser.Input.Keyboard.JustUp(this.cursors.space)) {
            this.gameScene.spaceDown = false;

        }
    }

    public updateGold() {
        this.goldText.setText(`${this.gameScene.player.gold} gp`);
    }

    public updateHP(hp: number, maxHp: number) {
        this.hpText.text = `HP: ${hp} / ${maxHp}`;
    }

    public updateMP(currentMP: number, maxMP: number) {
        // this.goldText.text = `Gold: ${gold}`;
        if (this.gameScene.player.type === 'Soldier') {
            currentMP = 0;
            maxMP = 0;
        }

        this.manaText.text = `MP: ${currentMP} / ${maxMP}`;
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

    private generateInventoryButtons() {
        // iterate over all inventory entries
        // generate inventory buttons
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
                    // if consumable, get the description of the item for this text and
                    //  show the use button

                    //  if equipment, show stats and equip button
                    if (item.type === 'consumable') {
                        this.inventoryAndAbilityDetailText.setText(item.description);
                        this.equipButton.setVisible(false);
                        this.equipButton.buttonText.setVisible(false);
                        this.useButton.setVisible(true);
                        this.useButton.buttonText.setVisible(true);

                    }
                    else if (
                        item.type === 'weapon' ||
                        item.type === 'bodyarmor'
                    ) {
                        this.inventoryAndAbilityDetailText.setText(
                            `${item.description}\n\n
                            Strength: ${item.stats!.strength}, Agility: ${item.stats!.agility},
                                Vitality: ${item.stats!.vitality}, Intellect: ${item.stats!.intellect},
                                Luck: ${item.stats!.luck}, Defense: ${item.stats!.defense},
                                Classes: All,
                                Min. Level: 1`
                        );
                        this.useButton.setVisible(false);
                        this.useButton.buttonText.setVisible(false);
                        this.equipButton.setVisible(true);
                        this.equipButton.buttonText.setVisible(true);
                    }
                    this.inventoryAndAbilityDetailText.setVisible(true);

                    this.cancelButton.setX(185);
                    this.cancelButton.setY(392);

                    this.cancelButton.buttonText.setX(205);
                    this.cancelButton.buttonText.setY(367);
                }
            );
            inventoryButton.setVisible(false);
            inventoryButton.buttonText.setVisible(false);

            this.inventoryButtons.push(inventoryButton);
        }
    }

    private updateCharacterSheetStrings() {
        this.levelString.setText(`Level: ${Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.player.experience)))}`);
        this.hitPointString.setText(`Hit Points: ${this.gameScene.player.stats.currentHP}/${this.gameScene.player.stats.maxHP}`);
        this.manaPointString.setText('Mana Points: 0/0');
        this.strengthString.setText(`Strength: ${Math.floor(this.gameScene.player.getCombinedStat('strength'))}`);
        this.agilityString.setText(`Agility: ${Math.floor(this.gameScene.player.stats.agility)}`);
        this.vitalityString.setText(`Vitality: ${Math.floor(this.gameScene.player.stats.vitality)}`);
        this.intellectString.setText(`Intellect: ${Math.floor(this.gameScene.player.stats.intellect)}`);
        this.luckString.setText(`Luck: ${Math.floor(this.gameScene.player.stats.luck)}`);
        this.defenseString.setText(`Defense: ${Math.floor(this.gameScene.player.getCombinedStat('defense'))}`);
        this.tillNextLevelString.setText(`Till Next Level: ${this.calculateTilNextLevel()}`);
    }
}