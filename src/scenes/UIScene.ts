import {cloneDeep} from 'lodash';

import Bot from '../classes/Bot';
import GameMessage from '../classes/GameMessage';
import Item from '../classes/Item';
import Innkeeper from '../classes/npcs/Innkeeper';
import Merchant from '../classes/npcs/Merchant';
import Player from '../classes/Player';
import UIActionButton from '../classes/UIActionButton';
import {ItemInterface} from '../items/items';
import eventsCenter from '../utils/EventsCenter';
import {updateCancelButton} from '../utils/updateCancelButton';
import GameScene from './GameScene';
import MusicScene from './MusicScene';
import SFXScene from './SFXScene';

export default class UIScene extends Phaser.Scene {
    public buyButton!: UIActionButton;
    public cancelButton!: UIActionButton;
    public cancelMenuFrame!: Phaser.GameObjects.Image;
    public characterDetailDisplay!: Phaser.GameObjects.Image;
    public characterDetailDisplayFrame!: Phaser.GameObjects.Image;
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
    public inventoryToSellButtons: UIActionButton[] = [];
    public leftSideDialogFrame!: Phaser.GameObjects.Image;
    public leftSideDialogText!: Phaser.GameObjects.Text;
    public merchantInventoryButtons: UIActionButton[] = [];
    public musicScene!: MusicScene;
    public noButton!: UIActionButton;
    public player2Button!: UIActionButton;
    public player2HeartIcon!: Phaser.GameObjects.Image;
    public player2ManaIcon!: Phaser.GameObjects.Image;
    public player2ManaText!: Phaser.GameObjects.Text;
    public player2hpText!: Phaser.GameObjects.Text;
    public purchaseItemButton!: UIActionButton;
    public rightSideDialogFrame!: Phaser.GameObjects.Image;
    public rightSideDialogOptionsFrame!: Phaser.GameObjects.Image;
    public rightSideDialogText!: Phaser.GameObjects.Text;
    public selectedItemAndAbilityIcon!: UIActionButton;
    public sellButton!: UIActionButton;
    public sellItemButton!: UIActionButton;
    public sfxScene!: SFXScene;
    public subInventoryAndAbilityMenuFrame!: Phaser.GameObjects.Image;
    public subInventoryBagButton!: UIActionButton;
    public subInventoryEquipmentButton!: UIActionButton;
    public subInventoryQuestButton!: UIActionButton;
    public useItemButton!: UIActionButton;
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
    private unequipButton!: UIActionButton;
    private vitalityString!: Phaser.GameObjects.Text;
    private dropButton!: UIActionButton;
    private player1CharacterSheetButton!: UIActionButton;
    private player2CharacterSheetButton!: UIActionButton;
    private player3CharacterSheetButton!: UIActionButton;
    private nameText!: Phaser.GameObjects.Text;
    private invisiblePlayer1Button!: Phaser.GameObjects.Rectangle;
    private invisiblePlayer2Button!: Phaser.GameObjects.Rectangle;

    public constructor() {
        super('UI');
    }

    public create() {
        this.musicScene = <MusicScene>this.scene.get('Music');
        this.sfxScene = <SFXScene>this.scene.get('SFX');

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.setupFrames();
        this.setupText();
        this.setupButtonsAndBadges();
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
                    this.interactionState = 'equipmentbody';
                    this.headItemButton.deselect();
                    this.offHandItemButton.deselect();
                    this.mainHandItemButton.deselect();
                    this.bodyItemButton.select();
                    const bodyArmor = this.gameScene.player.equipment.body;
                    this.cancelMenuFrame.setVisible(false);
                    this.cancelButton.setY(392);
                    this.cancelButton.buttonText.setY(367);
                    this.inventoryAndAbilityDetailFrame.setVisible(true);
                    this.inventoryAndAbilityDetailText.setText(
                        `${bodyArmor?.description}\n\n
                            Strength: ${bodyArmor?.stats?.strength}, Agility: ${bodyArmor?.stats?.agility},
                                Vitality: ${bodyArmor?.stats?.vitality}, Intellect: ${bodyArmor?.stats?.intellect},
                                Luck: ${bodyArmor?.stats?.luck}, Defense: ${bodyArmor?.stats?.defense},
                                Classes: ${bodyArmor?.classes},
                                Minimum Level: ${bodyArmor?.minimumLevel}`);

                    this.inventoryAndAbilityDetailText.setVisible(true);
                    this.unequipButton.setVisible(true);
                    this.unequipButton.buttonText.setVisible(true);
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
                    this.interactionState = 'equipmentweapon';
                    this.headItemButton.deselect();
                    this.offHandItemButton.deselect();
                    this.mainHandItemButton.select();
                    this.bodyItemButton.deselect();
                    const weapon = this.gameScene.player.equipment.weapon;
                    this.cancelMenuFrame.setVisible(false);
                    this.cancelButton.setY(392);
                    this.cancelButton.buttonText.setY(367);
                    this.inventoryAndAbilityDetailFrame.setVisible(true);
                    this.inventoryAndAbilityDetailText.setText(
                        `${weapon?.description}\n\n
                            Strength: ${weapon?.stats?.strength}, Agility: ${weapon?.stats?.agility},
                                Vitality: ${weapon?.stats?.vitality}, Intellect: ${weapon?.stats?.intellect},
                                Luck: ${weapon?.stats?.luck}, Defense: ${weapon?.stats?.defense},
                                Classes: ${weapon?.classes},
                                Minimum Level: ${weapon?.minimumLevel}`);

                    this.inventoryAndAbilityDetailText.setVisible(true);
                    this.unequipButton.setVisible(true);
                    this.unequipButton.buttonText.setVisible(true);
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
                    this.inventoryAndAbilityDetailFrame.setVisible(true);
                    this.purchaseItemButton.setVisible(true);
                    this.purchaseItemButton.buttonText.setText(`Purchase for ${item.cost} gold`);
                    this.purchaseItemButton.buttonText.setVisible(true);

                    this.updateAndShowCancelButton(10, 460, 'Cancel', true);

                    if (item.type === 'consumable') {
                        this.inventoryAndAbilityDetailText.setText(
                            item.description
                        );
                    }

                    else if (item.type === 'weapon' || item.type === 'bodyarmor') {
                        this.inventoryAndAbilityDetailText.setText(
                            `${item.description}\n\n
                            Strength: ${item.stats!.strength}, Agility: ${item.stats!.agility},
                                Vitality: ${item.stats!.vitality}, Intellect: ${item.stats!.intellect},
                                Luck: ${item.stats!.luck}, Defense: ${item.stats!.defense},
                                Classes: ${item.classes},
                                Minimum Level: ${item.minimumLevel}`
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
        this.useItemButton.setVisible(false);
        this.useItemButton.buttonText.setVisible(false);
        this.dropButton.setVisible(false);
        this.dropButton.buttonText.setVisible(false);
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
        this.rightSideDialogFrame.setVisible(false);
        this.rightSideDialogText.setVisible(false);
        this.rightSideDialogOptionsFrame.setVisible(false);
        this.yesButton.setVisible(false);
        this.yesButton.buttonText.setVisible(false);
        this.noButton.setVisible(false);
        this.noButton.buttonText.setVisible(false);
        this.purchaseItemButton.setVisible(false);
        this.purchaseItemButton.buttonText.setVisible(false);
        this.buyButton.setVisible(false);
        this.buyButton.buttonText.setVisible(false);
        this.sellButton.setVisible(false);
        this.sellButton.buttonText.setVisible(false);
        this.sellItemButton.setVisible(false);
        this.sellItemButton.buttonText.setVisible(false);
        this.unequipButton.setVisible(false);
        this.unequipButton.buttonText.setVisible(false);
        this.characterDetailDisplay.setVisible(false);
        this.characterDetailDisplayFrame.setVisible(false);
        this.nameText.setVisible(false);

        for (const subInventoryButton of this.subInventoryButtons) {
            if (subInventoryButton.visible) {
                subInventoryButton.setVisible(false);
                subInventoryButton.buttonText.setVisible(false);
            }
        }

        this.destroyInventoryButtons();

        this.destroyMerchantInventoryButtons();

        for (const subAbilityButton of this.subAbilityButtons) {
            if (subAbilityButton.visible) {
                subAbilityButton.setVisible(false);
                subAbilityButton.buttonText.setVisible(false);
            }
        }

        this.player1CharacterSheetButton.setVisible(false);
        this.player1CharacterSheetButton.buttonText.setVisible(false);
        this.player2CharacterSheetButton.setVisible(false);
        this.player2CharacterSheetButton.buttonText.setVisible(false);

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

        this.destroyInventoryToSellButtons();

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

        eventsCenter.removeListener('updateMP');
        eventsCenter.on('updateMP', this.updateMP, this);

    }

    public showMerchantRejection(rejectionText: string) {
        // hide all the merchant related frames
        this.hideMerchantFrames();
        this.leftSideDialogFrame.setVisible(true);
        this.leftSideDialogText.setText(`Merchant:\n${rejectionText}`);
        this.leftSideDialogText.setVisible(true);

        this.updateAndShowCancelButton(670, 380, 'Farewell', true);
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

                if (
                    this.gameScene.weaponMerchant ||
                    this.gameScene.innKeeper ||
                    this.gameScene.armorMerchant ||
                    this.gameScene.itemMerchant ||
                    this.gameScene.botScientist
                ) {
                    // space bar pressed on game scene (npc[s] found)

                    // listening for interactivity on npcs
                    if (this.gameScene.weaponMerchant) this.gameScene.weaponMerchant.listenForInteractEvent();
                    if (this.gameScene.armorMerchant) this.gameScene.armorMerchant.listenForInteractEvent();
                    if (this.gameScene.innKeeper) this.gameScene.innKeeper.listenForInteractEvent();
                    if (this.gameScene.itemMerchant) this.gameScene.itemMerchant.listenForInteractEvent();
                }
            }
            else if (
                // this.interactionState === 'inventory' ||
                this.interactionState === 'ability' ||
                this.interactionState.startsWith('charactersheet') ||
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

    public updateAndShowCancelButton(x: number, y: number, text: string, show: boolean) {
        // call the new function to update the cancel button and its components, and control the visibility of the cancel frame
        updateCancelButton(this.cancelButton, this.cancelMenuFrame, x, y, text, show);
    }

    public updateGold() {
        this.goldText.setText(`${this.gameScene.player.gold} gp`);
    }

    public updateHP(hp: number, maxHp: number) {
        this.hpText.setText(`HP: ${hp} / ${maxHp}`);
    }

    public updateMP(currentMP: number, maxMP: number) {
        // this.goldText.text = `Gold: ${gold}`;
        if (this.gameScene.player.type.name.endsWith('Soldier')) {
            currentMP = 0;
            maxMP = 0;
        }

        this.manaText.text = `MP: ${currentMP} / ${maxMP}`;
    }

    public updatePlayer2HP(hp: number, maxHP: number) {
        this.player2hpText.setText(`HP: ${hp} / ${maxHP}`);
    }

    private calculateTilNextLevel(playerOrBot: Player|Bot): number {
        const currentExp = playerOrBot.experience;
        let currentLevel = playerOrBot.level;
        const nextLevel = currentLevel + 1;
        let expCounter = 0;
        while (currentLevel < nextLevel) {
            expCounter++;
            currentLevel = Math.max(1, Math.ceil(playerOrBot.LEVELING_RATE * Math.sqrt(currentExp + expCounter)));
        }
        return expCounter;

    }

    private destroyInventoryToSellButtons() {
        for (const inventoryToSellButton of this.inventoryToSellButtons) {
            inventoryToSellButton.destroy();
            inventoryToSellButton.buttonText.destroy();
        }
        this.inventoryToSellButtons = [];

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

                    this.inventoryAndAbilityDetailFrame.setVisible(true);
                    // if consumable, get the description of the item for this text and
                    //  show the use button

                    //  if equipment, show stats and equip button
                    if (item.type === 'consumable') {
                        this.inventoryAndAbilityDetailText.setText(item.description);
                        this.equipButton.setVisible(false);
                        this.equipButton.buttonText.setVisible(false);
                        this.useItemButton.setVisible(true);
                        this.useItemButton.buttonText.setVisible(true);
                        this.dropButton.setVisible(true);
                        this.dropButton.buttonText.setVisible(true);

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
                                Classes: ${item.classes},
                                Minimum Level: ${item.minimumLevel}`
                        );
                        this.useItemButton.setVisible(false);
                        this.useItemButton.buttonText.setVisible(false);
                        this.dropButton.setVisible(true);
                        this.dropButton.buttonText.setVisible(true);
                        this.equipButton.setVisible(true);
                        this.equipButton.buttonText.setVisible(true);
                    }
                    this.inventoryAndAbilityDetailText.setVisible(true);

                    this.updateAndShowCancelButton(353, 357, 'Cancel', false);
                }
            );
            inventoryButton.setVisible(false);
            inventoryButton.buttonText.setVisible(false);

            this.inventoryButtons.push(inventoryButton);
        }
    }

    private generateInventoryToSellButtons() {
        for (const [index, item] of this.gameScene.player.inventory.entries()) {

            const inventoryToSellButton = new UIActionButton(
                this,
                564,
                216 + (index * 50),
                item.key,
                item.activeKey,
                item.name,
                () => {
                    this.interactionState = `merchantsellitem${index}`;
                    this.inventoryIndex = index;
                    this.inventoryToSellButtons[index].select();

                    for (const [inventoryButtonIndex, inventoryToSellButton] of this.inventoryToSellButtons.entries()) {
                        if (inventoryButtonIndex !== index) {
                            inventoryToSellButton.deselect();
                        }
                    }

                    this.inventoryAndAbilityDetailFrame.setVisible(true);
                    this.sellItemButton.setVisible(true);
                    this.sellItemButton.buttonText.setText(`Sell for ${item.sellPrice} gold`);
                    this.sellItemButton.buttonText.setVisible(true);

                    this.updateAndShowCancelButton(10, 460, 'Cancel', true);

                    if (item.type === 'weapon' || item.type === 'bodyarmor') {
                        this.inventoryAndAbilityDetailText.setText(
                            `${item.description}\n\n
                            Strength: ${item.stats!.strength}, Agility: ${item.stats!.agility},
                                Vitality: ${item.stats!.vitality}, Intellect: ${item.stats!.intellect},
                                Luck: ${item.stats!.luck}, Defense: ${item.stats!.defense},
                                Classes: ${item.classes},
                                Minimum Level: ${item.minimumLevel}`
                        );
                    }
                    else if (item.type === 'consumable') {
                        this.inventoryAndAbilityDetailText.setText(item.description);
                    }

                    this.inventoryAndAbilityDetailText.setVisible(true);

                }
            );
            inventoryToSellButton.setVisible(false);
            inventoryToSellButton.buttonText.setVisible(false);

            this.inventoryToSellButtons.push(inventoryToSellButton);
        }

    }

    private hideMerchantFrames() {
        this.inventoryAndAbilityMenuFrame.setVisible(false);
        this.subInventoryAndAbilityMenuFrame.setVisible(false);
        this.inventoryAndAbilityDetailFrame.setVisible(false);
        this.inventoryAndAbilityDetailText.setVisible(false);
        this.purchaseItemButton.setVisible(false);
        this.purchaseItemButton.buttonText.setVisible(false);
        this.buyButton.setVisible(false);
        this.buyButton.buttonText.setVisible(false);
        this.sellButton.setVisible(false);
        this.sellButton.buttonText.setVisible(false);
        this.sellItemButton.setVisible(false);
        this.sellItemButton.buttonText.setVisible(false);

        for (const inventoryToSellButton of this.inventoryToSellButtons) {
            inventoryToSellButton.setVisible(false);
            inventoryToSellButton.buttonText.setVisible(false);
        }

        for (const merchantInventoryButton of this.merchantInventoryButtons) {
            merchantInventoryButton.setVisible(false);
            merchantInventoryButton.buttonText.setVisible(false);
        }
    }

    private setupButtonsAndBadges() {

        // START BUTTON SECTION
        this.dropButton = new UIActionButton(
            this,
            208,
            392,
            'crossbutton',
            'crossbutton',
            'Drop',
            () => {
                this.interactionState = 'inventory';
                // setting the interaction state from the use button
                // get inventory slot number from interaction state
                const selectedItemIndex = Number(this.interactionState.split('selectinginventoryaction')[1]);
                this.gameScene.player.inventory.splice(selectedItemIndex, 1);
                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.inventoryAndAbilityDetailText.setVisible(false);
                this.equipButton.setVisible(false);
                this.equipButton.buttonText.setVisible(false);
                this.useItemButton.setVisible(false);
                this.useItemButton.buttonText.setVisible(false);
                this.dropButton.setVisible(false);
                this.dropButton.buttonText.setVisible(false);

                this.updateAndShowCancelButton(315, 315, 'Cancel', true);

                this.destroyInventoryButtons();
                this.generateInventoryButtons();
                for (const inventoryButton of this.inventoryButtons) {
                    inventoryButton.setVisible(true);
                    inventoryButton.buttonText.setVisible(true);
                }
            }
        );
        this.dropButton.setVisible(false);
        this.dropButton.buttonText.setVisible(false);

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
                eventsCenter.emit('no');

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
                this.characterDetailDisplay.setVisible(false);
                this.characterDetailDisplayFrame.setVisible(false);

                this.gameScene.input.keyboard!.enabled = true;
                this.gameScene.input.keyboard!.resetKeys();
            }
        );
        this.noButton.setVisible(false);
        this.noButton.buttonText.setVisible(false);

        this.cancelButton = new UIActionButton(
            this,
            367,
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


        this.sellItemButton = new UIActionButton(
            this,
            35,
            392,
            'checkbutton',
            'checkbutton',
            'Sell',
            () => {
                if (
                    this.currentNPC instanceof Merchant &&
                    this.currentNPC.inventory &&
                    this.interactionState.startsWith('merchantsellitem')
                ) {
                    const itemIndex = this.interactionState.split('merchantsellitem')[1];
                    const itemToSell = this.gameScene.player.inventory[Number(itemIndex)];
                    const sellPrice = itemToSell.sellPrice;
                    this.gameScene.player.inventory.splice(Number(itemIndex), 1);
                    this.gameScene.player.gold += sellPrice;

                    this.hideMerchantFrames();
                    this.leftSideDialogFrame.setVisible(true);
                    this.leftSideDialogText.setText('Merchant:\nThanketh thee f\'r thy patronage!');
                    this.leftSideDialogText.setVisible(true);

                    this.updateAndShowCancelButton(670, 380, 'Farewell', true);

                    this.updateGold();
                }
            }
        );

        this.sellItemButton.setVisible(false);
        this.sellItemButton.buttonText.setVisible(false);

        this.purchaseItemButton = new UIActionButton(
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

                    if (this.gameScene.player.inventory.length === 8) {
                        this.showMerchantRejection('Thou art ov\'r encumb\'r\'d!');
                    }
                    else if (this.gameScene.player.gold < selectedItem.cost) {
                        this.showMerchantRejection('You haven\'t enough coin!');
                    }
                    else {
                        this.gameScene.player.gold -= selectedItem.cost;
                        this.gameScene.player.inventory.push(
                            new Item(
                                selectedItem.key,
                                selectedItem.activekey,
                                selectedItem.name,
                                selectedItem.type,
                                selectedItem.cost,
                                selectedItem.sellPrice,
                                selectedItem.description,
                                undefined,
                                selectedItem.classes,
                                selectedItem.minimumLevel,
                                selectedItem.stats
                            ));

                        // hide all the merchant related frames
                        this.hideMerchantFrames();
                        this.leftSideDialogFrame.setVisible(true);
                        this.leftSideDialogText.setText('Merchant:\nThanketh thee f\'r thy patronage!');
                        this.leftSideDialogText.setVisible(true);

                        this.updateAndShowCancelButton(670, 380, 'Farewell', true);
                    }
                }
            }
        );

        this.purchaseItemButton.setVisible(false);
        this.purchaseItemButton.buttonText.setVisible(false);

        this.useItemButton = new UIActionButton(
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
                this.useItemButton.setVisible(false);
                this.useItemButton.buttonText.setVisible(false);
                this.dropButton.setVisible(false);
                this.dropButton.buttonText.setVisible(false);
                this.selectedItemAndAbilityIcon.setVisible(true);
                this.selectedItemAndAbilityIcon.buttonText.setVisible(true);

                this.confirmSelectedAbilityOrItemFrame.setVisible(true);
                this.confirmSelectedAbilityOrItemFrameB.setVisible(true);

                this.selectedItemAndAbilityCommandText.setText('Choose A Target');
                this.selectedItemAndAbilityCommandText.setVisible(true);

                for (const inventoryButton of this.inventoryButtons) {
                    inventoryButton.setVisible(false);
                    inventoryButton.buttonText.setVisible(false);
                }

                this.updateAndShowCancelButton(698, 430, 'Cancel', true);

            }
        );
        this.useItemButton.setVisible(false);
        this.useItemButton.buttonText.setVisible(false);

        this.unequipButton = new UIActionButton(
            this,
            35,
            392,
            'checkbutton',
            'checkbutton',
            'Unequip',
            () => {
                // handle the unequip button selection

                // first check if the inventory is full. if so, the item can't
                //  be unequipped
                if (this.gameScene.player.inventory.length === 8) {
                    this.selectCancel();
                    this.interactionState = 'equipmentequipfail';
                    this.rightSideDialogFrame.setVisible(true);
                    this.rightSideDialogText.setText('Not enough inventory space to remove the item.');
                    this.rightSideDialogText.setVisible(true);

                    this.updateAndShowCancelButton(215, 537, 'Cancel', false);
                }
                else {
                    // take the item out of the player's equipment, put
                    //  it back in the inventory
                    //  refresh the equipment view!

                    const slotToUnequip = this.interactionState.split('equipment')[1];
                    const itemToUnequip = cloneDeep(this.gameScene.player.equipment[slotToUnequip as keyof typeof this.gameScene.player.equipment]) as Item;

                    this.gameScene.player.equipment[slotToUnequip as keyof typeof this.gameScene.player.equipment] = undefined;
                    this.gameScene.player.inventory.push(itemToUnequip);
                    this.destroyEquipmentButtons();
                    this.generateEquipmentButtons();

                    for (const equipmentButton of this.equipmentButtons) {
                        equipmentButton.setVisible(true);
                        equipmentButton.buttonText.setVisible(true);
                    }

                    this.inventoryAndAbilityDetailFrame.setVisible(false);
                    this.inventoryAndAbilityDetailText.setVisible(false);
                    this.unequipButton.setVisible(false);
                    this.unequipButton.buttonText.setVisible(false);

                    this.updateAndShowCancelButton(315, 315, 'Cancel', true);
                }
            }
        );
        this.unequipButton.setVisible(false);
        this.unequipButton.buttonText.setVisible(false);

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
                this.dropButton.setVisible(false);
                this.dropButton.buttonText.setVisible(false);

                this.updateAndShowCancelButton(315, 315, 'Cancel', true);

                const itemToEquip = this.gameScene.player.inventory[inventorySlotNumber];
                this.gameScene.player.inventory.splice(inventorySlotNumber, 1);

                if (itemToEquip.type === 'weapon') {
                    // check if there's already a weapon equipped
                    if (this.gameScene.player.equipment.weapon) {
                        // if there is, add it back to the inventory at the same index as the item being equipped
                        this.gameScene.player.inventory.splice(
                            inventorySlotNumber,
                            0,
                            this.gameScene.player.equipment.weapon
                        );
                    }
                    this.gameScene.player.equipment.weapon = itemToEquip;
                }
                else if (itemToEquip.type === 'bodyarmor') {
                    if (this.gameScene.player.equipment.body) {
                        this.gameScene.player.inventory.splice(
                            inventorySlotNumber,
                            0,
                            this.gameScene.player.equipment.body
                        );
                    }
                    this.gameScene.player.equipment.body = itemToEquip;
                }

                this.destroyInventoryButtons();
                this.generateInventoryButtons();
                for (const inventoryButton of this.inventoryButtons) {
                    inventoryButton.setVisible(true);
                    inventoryButton.buttonText.setVisible(true);
                }
                this.interactionState = 'inventory';
            }
        );
        this.equipButton.setVisible(false);
        this.equipButton.buttonText.setVisible(false);

        this.buyButton = new UIActionButton(
            this,
            265,
            465,
            'bagbutton',
            'bagbuttonactive',
            'Buy',
            () => {
                // compare to the 'merchant talked to section of code
                if (this.interactionState === 'merchantbuy') {
                    return;
                }

                this.inventoryAndAbilityDetailText.setVisible(false);
                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.purchaseItemButton.setVisible(false);
                this.purchaseItemButton.buttonText.setVisible(false);
                this.sellItemButton.setVisible(false);
                this.sellItemButton.buttonText.setVisible(false);

                this.updateAndShowCancelButton(315, 315, 'Cancel', true);

                this.destroyInventoryToSellButtons();

                this.destroyMerchantInventoryButtons();
                if (this.currentNPC instanceof Merchant) {
                    this.generateMerchantInventoryButtons(this.currentNPC.inventory);
                }
                this.sellButton.deselect();
                this.buyButton.select();
                this.interactionState = 'merchantbuy';
            }
        );
        this.buyButton.setVisible(false);
        this.buyButton.buttonText.setVisible(false);

        this.sellButton = new UIActionButton(
            this,
            265,
            515,
            'coinbutton',
            'coinbuttonactive',
            'Sell',
            () => {
                if (this.interactionState === 'merchantsell') {
                    return;
                }
                // compare to the 'merchant talked to section of code
                this.interactionState = 'merchantsell';

                this.buyButton.deselect();
                this.sellButton.select();

                this.updateAndShowCancelButton(315, 315, 'Cancel', true);

                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.inventoryAndAbilityDetailText.setVisible(false);
                this.purchaseItemButton.setVisible(false);
                this.purchaseItemButton.buttonText.setVisible(false);
                this.sellItemButton.setVisible(false);
                this.sellItemButton.buttonText.setVisible(false);

                this.destroyMerchantInventoryButtons();
                this.destroyInventoryToSellButtons();
                this.generateInventoryToSellButtons();
                for (const inventoryToSellButton of this.inventoryToSellButtons) {
                    inventoryToSellButton.setVisible(true);
                    inventoryToSellButton.buttonText.setVisible(true);
                }
            }
        );
        this.sellButton.setVisible(false);
        this.sellButton.buttonText.setVisible(false);

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
                    this.interactionState === 'inventory'
                ) {
                    return;
                }
                this.interactionState = 'inventory';
                this.subInventoryBagButton.select();
                this.subInventoryEquipmentButton.deselect();
                this.subInventoryQuestButton.deselect();

                this.inventoryAndAbilityDetailText.setVisible(false);
                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.useItemButton.setVisible(false);
                this.useItemButton.buttonText.setVisible(false);
                this.dropButton.setVisible(false);
                this.dropButton.buttonText.setVisible(false);
                this.equipButton.setVisible(false);
                this.equipButton.buttonText.setVisible(false);
                this.unequipButton.setVisible(false);
                this.unequipButton.buttonText.setVisible(false);

                this.updateAndShowCancelButton(315, 315, 'Cancel', true);

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
            'armorbutton',
            'armorbuttonactive',
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
                this.useItemButton.setVisible(false);
                this.useItemButton.buttonText.setVisible(false);
                this.dropButton.setVisible(false);
                this.dropButton.buttonText.setVisible(false);
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

                this.updateAndShowCancelButton(315, 315, 'Cancel', true);
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

        // START SUBCHARACTER SHEET BUTTONS SECTION
        this.player1CharacterSheetButton = new UIActionButton(
            this,
            265,
            465,
            'pagebutton',
            'pagebuttonactive',
            'Player',
            () => {
                if (this.interactionState === 'charactersheet1') {
                    return;
                }
                this.interactionState = 'charactersheet1';
                this.player1CharacterSheetButton.select();
                this.player2CharacterSheetButton.deselect();
                this.player3CharacterSheetButton.deselect();

                this.updateCharacterSheetStrings(this.gameScene.player);
            }
        );
        this.player1CharacterSheetButton.setVisible(false);
        this.player1CharacterSheetButton.buttonText.setVisible(false);

        this.player2CharacterSheetButton = new UIActionButton(
            this,
            265,
            515,
            'pagebutton',
            'pagebuttonactive',
            'Companion 1',
            () => {
                if (this.interactionState === 'charactersheet2') {
                    return;
                }
                this.interactionState = 'charactersheet2';
                this.player1CharacterSheetButton.deselect();
                this.player2CharacterSheetButton.select();
                this.player3CharacterSheetButton.deselect();

                this.updateCharacterSheetStrings(this.gameScene.bots[0]);
            }
        );
        this.player2CharacterSheetButton.setVisible(false);
        this.player2CharacterSheetButton.buttonText.setVisible(false);

        this.player3CharacterSheetButton = new UIActionButton(
            this,
            265,
            565,
            'pagebutton',
            'pagebuttonactive',
            'Bot 2',
            () => {
                if (this.interactionState === 'charactersheet3') {
                    return;
                }
                this.interactionState = 'charactersheet3';
                this.player1CharacterSheetButton.deselect();
                this.player2CharacterSheetButton.deselect();
                this.player3CharacterSheetButton.select();
            }
        );
        this.player3CharacterSheetButton.setVisible(false);
        this.player3CharacterSheetButton.buttonText.setVisible(false);


        // END SUBCHARACTER SHEET BUTTONS SECTION
        // END BUTTON SECTION

        // START IMAGE SECTION
        this.characterDetailDisplay = this.add.image(
            335,
            275,
            '',
            0,
        )
            .setScale(3);
        this.characterDetailDisplay.setVisible(false);
        // END IMAGE SECTION

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
                },
                metrics: {
                    ascent: 38,
                    descent: 10,
                    fontSize: 48
                }
            }
        );
        this.inventoryAndAbilityDetailText.setLineSpacing(-16);
        this.inventoryAndAbilityDetailText.setVisible(false);
        this.inventoryAndAbilityDetailText.setResolution(3);

        // set up gold text and icon
        this.manaIcon = this.add.image(100, 663, 'mana');
        this.player2ManaIcon = this.add.image(330, 663, 'mana');
        this.player2ManaIcon.setVisible(false);

        let currentMP;
        let maxMP;

        if (this.gameScene.player.type.name === 'PlayerSoldier') {
            currentMP = 0;
            maxMP = 0;
        }
        else {
            currentMP = this.gameScene.player.stats.currentMP;
            maxMP = this.gameScene.player.stats.maxMP;
        }

        // player 1 mana text
        this.manaText = this.add.text(
            115,
            647,
            `MP: ${currentMP} / ${maxMP}`,
            {fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont'})
            .setStroke('#000000', 2)
            .setResolution(3);


        if (this.gameScene.bots[0]?.type.name === 'MonsterSoldier') {
            currentMP = 0;
            maxMP = 0;
        }
        else {
            currentMP = this.gameScene.bots[0]?.stats.currentMP ?? 0;
            maxMP = this.gameScene.bots[0]?.stats.maxMP ?? 0;
        }

        this.player2ManaText = this.add.text(
            345,
            647,
            `MP: ${currentMP} / ${maxMP}`,
            {fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont'})
            .setStroke('#000000', 2)
            .setResolution(3);
        this.player2ManaText.setVisible(false);


        // create the hp text game object (player 1)
        this.hpText = this.add.text(
            115,
            620,
            `HP: ${this.gameScene.player.stats.currentHP} / ${this.gameScene.player.stats.maxHP}`,
            {fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont'})
            .setStroke('#000000', 2)
            .setResolution(3);

        this.player2hpText = this.add.text(
            345,
            620,
            `HP: ${this.gameScene.bots[0]?.stats.currentHP ?? '0'} / ${this.gameScene.bots[0]?.stats.maxHP ?? '0'}`,
            {fontSize: '32px', color: '#ffffff', fontFamily: 'CustomFont'}
        )
            .setStroke('#000000', 2)
            .setResolution(3);
        this.player2hpText.setVisible(false);

        // create heart icon
        this.heartIcon = this.add.image(100, 638, 'heart')
            .setScale(1.25)
            .setInteractive();
        this.player2HeartIcon = this.add.image(330, 638, 'heart')
            .setScale(1.25);
        this.player2HeartIcon.setVisible(false);

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
                eventsCenter.emit('inventory');
                if (
                    this.interactionState === 'inventory' ||
                    this.interactionState.startsWith('equipment') ||
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
                    this.interactionState.startsWith('charactersheet') ||
                    this.interactionState.startsWith('merchant') ||
                    this.interactionState.startsWith('innkeeper') ||
                    this.interactionState.startsWith('botscientist')
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

                this.updateAndShowCancelButton(315, 315, 'Cancel', true);
            }
        );

        // player 1 button
        this.characterButton = new UIActionButton(
            this,
            68,
            650,
            'gameActionMenuCharacterButton',
            'gameActionMenuCharacterButtonActive',
            '',
            () => {
                return;
            }
        );

        this.invisiblePlayer1Button = this.add.rectangle(
            49,
            650,
            215,
            50,
            0xFF0000,
            0
        )
            .setOrigin(0, 0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.player1ButtonCallback();
            });

        this.player2Button = new UIActionButton(
            this,
            298,
            650,
            'gameActionMenuRedBotButton',
            'gameActionMenuRedBotButtonActive',
            '',
            () => {
                this.player2ButtonCallback();
            }
        );
        this.player2Button.setVisible(false);

        this.invisiblePlayer2Button = this.add.rectangle(
            279,
            650,
            215,
            50,
            0xFF0000,
            0
        )
            .setOrigin(0, 0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.player2ButtonCallback();
            });

        this.abilityButton = new UIActionButton(
            this,
            800,
            650,
            'bookbutton',
            'bookbuttonactive',
            '',
            () => {
                eventsCenter.emit('ability');
                if (
                    this.interactionState === 'inventory' ||
                    this.interactionState === 'equipment' ||
                    this.interactionState.startsWith('charactersheet') ||
                    this.interactionState.startsWith('selecting') ||
                    this.interactionState.startsWith('inventoryaction') ||
                    this.interactionState.startsWith('merchant') ||
                    this.interactionState.startsWith('innkeeper') ||
                    this.interactionState.startsWith('botscientist')
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

                this.updateAndShowCancelButton(315, 315, 'Cancel', true);
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
                eventsCenter.emit('charactersheet1');
                if (
                    this.interactionState === 'inventory' ||
                    this.interactionState === 'equipment' ||
                    this.interactionState === 'ability' ||
                    this.interactionState.startsWith('selecting') ||
                    this.interactionState.startsWith('inventoryaction') ||
                    this.interactionState.startsWith('merchant') ||
                    this.interactionState.startsWith('innkeeper') ||
                    this.interactionState.startsWith('botscientist')
                ) {
                    this.selectCancel();
                }
                else if (this.interactionState.startsWith('charactersheet')) {
                    this.selectCancel();
                    if (this.gameScene.operatingSystem !== 'desktop') {
                        // this.scene.launch('GamePad');
                        this.gameScene.gamePadScene?.scene.restart();
                    }
                    return;
                }
                this.interactionState = 'charactersheet1';
                // set up the character sheet -> query and update
                //  the stats before showing the character sheet
                this.updateCharacterSheetStrings(this.gameScene.player);
                // this.gameScene.gamePadScene?.scene.stop();

                this.characterSheetButton.select();
                this.inventoryAndAbilityMenuFrame.setVisible(true);
                this.subInventoryAndAbilityMenuFrame.setVisible(true);

                this.player1CharacterSheetButton.select();
                this.player1CharacterSheetButton.setVisible(true);
                this.player1CharacterSheetButton.buttonText.setVisible(true);

                this.goldFrame.setVisible(true);
                this.nameText.setVisible(true);

                this.player2CharacterSheetButton.deselect();
                this.player3CharacterSheetButton.deselect();

                // if there are bots, show buttons to show their character sheets.

                if (this.gameScene.bots.length > 0) {
                    this.player2CharacterSheetButton.setVisible(true);
                    this.player2CharacterSheetButton.buttonText.setVisible(true);
                }

                this.updateAndShowCancelButton(315, 315, 'Cancel', true);

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

    private setupFrames() {
        // START FRAME SECTION
        this.characterDetailDisplayFrame = this.add.image(
            335,
            275,
            'characterDetailDisplayFrame'
        );
        this.characterDetailDisplayFrame.setVisible(false);

        this.actionMenuFrame = this.add.image(
            460,
            650,
            'gameActionMenuFrame'
        );

        this.rightSideDialogFrame = this.add.image(215, 380, 'sidedialogframe')
            .setOrigin(0, 0);
        this.rightSideDialogFrame.setVisible(false);

        this.leftSideDialogFrame = this.add.image(40, 380, 'sidedialogframe')
            .setOrigin(0, 0);
        this.leftSideDialogFrame.setVisible(false);

        this.rightSideDialogOptionsFrame = this.add.image(670, 380, 'sideoptionsframe')
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
    }

    private setupText() {
        const player = this.gameScene.player;
        // START TEXT SECTION
        this.nameText = this.add.text(538, 122, player.name, {
            color: '#ffffff', align: 'left', fontFamily: 'CustomFont', wordWrap: {
                width: 610,
                useAdvancedWrap: true
            }
        })
            .setResolution(3)
            .setFontSize(50);
        this.shrinkTextByPixel(this.nameText, 375);
        this.nameText.setVisible(false);

        this.goldText = this.add.text(584, 112, '0 gp', {
            color: '#ffffff', align: 'left', fontFamily: 'CustomFont', wordWrap: {
                width: 610,
                useAdvancedWrap: true
            }
        })
            .setResolution(3)
            .setFontSize(50);
        this.goldText.setVisible(false);

        this.rightSideDialogText = this.add.text(225, 380, '', {
            color: '#ffffff', align: 'left', fontFamily: 'CustomFont', wordWrap: {
                width: 610,
                useAdvancedWrap: true
            }
        })
            .setResolution(3)
            .setFontSize(50)
            .setLineSpacing(-18);

        this.leftSideDialogText = this.add.text(50, 380, '', {
            color: '#ffffff',
            align: 'left',
            fontFamily: 'CustomFont',
            fontSize: '50px',
            wordWrap: {
                width: 610,
                useAdvancedWrap: true
            },
            metrics: {
                ascent: 42,
                descent: 11,
                fontSize: 50
            }
        })
            .setResolution(3)
            // .setFontSize(50)
            .setLineSpacing(-18);

        this.commandMenuText = this.add.text(244, 440, 'Command?', {
            fontSize: '55px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
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
            .setResolution(3);
        this.selectedItemAndAbilityCommandText.setVisible(false);


        // START EQUIPMENT STRING SECTION

        this.headString = this.add.text(540, 180, 'Head:', {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.headString.setVisible(false);
        this.equipmentStrings.push(this.headString);

        this.bodyString = this.add.text(540, 275, 'Body:', {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.bodyString.setVisible(false);
        this.equipmentStrings.push(this.bodyString);

        this.mainHandString = this.add.text(540, 370, 'Main Hand:', {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.mainHandString.setVisible(false);
        this.equipmentStrings.push(this.mainHandString);

        this.offHandString = this.add.text(540, 465, 'Off Hand:', {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.offHandString.setVisible(false);
        this.equipmentStrings.push(this.offHandString);

        // END EQUIPMENT STRING SECTION

        // START CHARACTER SHEET STRING SECTION

        this.classString = this.add.text(540, 185, `Class: ${player.type.name}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.classString.setVisible(false);

        this.levelString = this.add.text(540, 221, `Level: ${player.level}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.levelString.setVisible(false);

        this.hitPointString = this.add.text(540, 257, `Hit Points: ${player.stats.currentHP}/${player.stats.maxHP}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.hitPointString.setVisible(false);

        this.manaPointString = this.add.text(540, 293, 'Mana Points: 0/0', {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.manaPointString.setVisible(false);

        this.strengthString = this.add.text(540, 329, `Strength: ${Math.floor(player.getCombinedStat('strength'))}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.strengthString.setVisible(false);

        this.agilityString = this.add.text(540, 365, `Agility: ${Math.floor(player.stats.agility)}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.agilityString.setVisible(false);

        this.vitalityString = this.add.text(540, 401, `Vitality: ${Math.floor(player.stats.vitality)}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.vitalityString.setVisible(false);

        this.intellectString = this.add.text(540, 437, `Intellect: ${Math.floor(player.stats.intellect)}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.intellectString.setVisible(false);

        this.luckString = this.add.text(540, 473, `Luck: ${Math.floor(player.stats.luck)}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.luckString.setVisible(false);

        this.defenseString = this.add.text(540, 509, `Defense: ${player.getCombinedStat('defense')}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.defenseString.setVisible(false);

        this.tillNextLevelString = this.add.text(540, 545, `Till Next Level: ${this.calculateTilNextLevel(player)}`, {
            fontSize: '48px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);
        this.tillNextLevelString.setVisible(false);

        // END CHARACTER SHEET STRING SECTION

        // END TEXT SECTION
    }

    private updateCharacterSheetStrings(playerOrBot: Player|Bot) {

        this.nameText.setText(playerOrBot.name);
        this.shrinkTextByPixel(this.nameText, 375);

        let classIdentifier = '';
        let className = '';
        if (playerOrBot instanceof Player) {
            classIdentifier = 'Class';
            className = playerOrBot.type.properName;
        }
        else if (playerOrBot instanceof Bot) {
            classIdentifier = 'Type';
            className = playerOrBot.species;
        }
        this.classString.setText(`${classIdentifier}: ${className}`);
        this.levelString.setText(`Level: ${playerOrBot.level}`);
        this.hitPointString.setText(`Hit Points: ${playerOrBot.stats.currentHP}/${playerOrBot.stats.maxHP}`);
        this.manaPointString.setText('Mana Points: 0/0');
        this.strengthString.setText(`Strength: ${Math.floor(playerOrBot.getCombinedStat('strength'))}`);
        this.agilityString.setText(`Agility: ${Math.floor(playerOrBot.stats.agility)}`);
        this.vitalityString.setText(`Vitality: ${Math.floor(playerOrBot.stats.vitality)}`);
        this.intellectString.setText(`Intellect: ${Math.floor(playerOrBot.stats.intellect)}`);
        this.luckString.setText(`Luck: ${Math.floor(playerOrBot.stats.luck)}`);
        this.defenseString.setText(`Defense: ${Math.floor(playerOrBot.getCombinedStat('defense'))}`);
        this.tillNextLevelString.setText(`Till Next Level: ${this.calculateTilNextLevel(playerOrBot)}`);

    }

    private shrinkTextByPixel(phasertext: Phaser.GameObjects.Text, maxpixel: number): Phaser.GameObjects.Text {
        let fontSize = phasertext.height;
        while (phasertext.width > maxpixel) {
            fontSize--;
            phasertext.setStyle({fontSize: fontSize + 'px'});
        }
        return phasertext;
    }

    private player1ButtonCallback() {
        console.log({
            playerExperience: this.gameScene.player.experience,
            botExperience: this.gameScene.bots[0].experience
        });
        // uncomment to log interaction state by clicking player portrait
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
            eventsCenter.emit('GameMessage', `${this.gameScene.player.name} uses a health potion on ${this.gameScene.player.name}, healing them for ${actualAmountHealed} HP.`);

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
    private player2ButtonCallback() {
        // write logic here so the 2nd player can be healed or whatever when clicked
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
                this.gameScene.bots[0].stats.maxHP - this.gameScene.bots[0].stats.currentHP
            );

            this.gameScene.bots[0].stats.currentHP += actualAmountHealed;
            this.updatePlayer2HP(this.gameScene.bots[0].stats.currentHP, this.gameScene.bots[0].stats.maxHP);

            this.sfxScene.playSound('potion');
            eventsCenter.emit('GameMessage', `${this.gameScene.player.name} uses a health potion on ${this.gameScene.bots[0].name}, healing them for ${actualAmountHealed} HP.`);

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
}