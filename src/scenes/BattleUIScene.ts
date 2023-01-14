import Message from '../classes/Message';
import UIActionButton from '../classes/UIActionButton';
import eventsCenter from '../utils/EventsCenter';
import {updateCancelButton} from '../utils/updateCancelButton';
import BattleScene from './BattleScene';
import MusicScene from './MusicScene';

export default class BattleUIScene extends Phaser.Scene {
    public abilityButtons: UIActionButton[] = [];
    public attackButton!: UIActionButton;
    public commandMenuText!: Phaser.GameObjects.Text;
    public confirmSelectedAbilityOrItemFrame!: Phaser.GameObjects.Image;
    public confirmSelectedAbilityOrItemFrameB!: Phaser.GameObjects.Image;
    public inventoryButtons: UIActionButton[] = [];
    public inventoryIndex!: number;
    public message!: Message;
    public selectedItemAndAbilityCommandText!: Phaser.GameObjects.Text;
    public selectedItemAndAbilityIcon!: UIActionButton;
    private abilityButton!: UIActionButton;
    private abilityIndex!: number;
    private actionButtons: UIActionButton[] = [];
    private bagButton!: UIActionButton;
    private battleScene!: BattleScene;
    private cancelButton!: UIActionButton;
    private cancelMenuFrame!: Phaser.GameObjects.Image;
    private commandMenuFrame!: Phaser.GameObjects.Image;
    private confirmMenuFrame!: Phaser.GameObjects.Image;
    private hotkeyBadge1!: Phaser.GameObjects.Image;
    private hotkeyButton1!: UIActionButton;
    private hotkeyMenuFrame!: Phaser.GameObjects.Image;
    private inventoryAndAbilityDetailFrame!: Phaser.GameObjects.Image;
    private inventoryAndAbilityDetailText!: Phaser.GameObjects.Text;
    private inventoryAndAbilityMenuFrame!: Phaser.GameObjects.Image;
    private musicScene!: MusicScene;
    private runButton!: UIActionButton;
    private subAbilityButton!: UIActionButton;
    private subAbilityButtons: UIActionButton[] = [];
    private subInventoryAndAbilityMenuFrame!: Phaser.GameObjects.Image;
    private subInventoryBagButton!: UIActionButton;
    private subInventoryButtons: UIActionButton[] = [];
    private tacticsButton!: UIActionButton;
    private useAbilityButton!: UIActionButton;
    private useItemButton!: UIActionButton;

    public constructor() {
        super('BattleUI');
    }

    public closeAbility() {
        for (const subAbilityButton of this.subAbilityButtons) {
            subAbilityButton.deselect();
            subAbilityButton.setVisible(false);
            subAbilityButton.buttonText.setVisible(false);
        }

        for (const abilityButton of this.abilityButtons) {
            abilityButton.deselect();
            abilityButton.setVisible(false);
            abilityButton.buttonText.setVisible(false);

        }

        this.useAbilityButton.setVisible(false);
        this.useAbilityButton.buttonText.setVisible(false);


        this.inventoryAndAbilityMenuFrame.setVisible(false);
        this.subInventoryAndAbilityMenuFrame.setVisible(false);
    }

    public closeInventory() {
        for (const inventoryButton of this.inventoryButtons) {
            inventoryButton.deselect();
            inventoryButton.setVisible(false);
            inventoryButton.buttonText.setVisible(false);
        }

        for (const subInventoryButton of this.subInventoryButtons) {
            subInventoryButton.deselect();
            subInventoryButton.setVisible(false);
            subInventoryButton.buttonText.setVisible(false);
        }

        this.inventoryAndAbilityMenuFrame.setVisible(false);
        this.subInventoryAndAbilityMenuFrame.setVisible(false);
    }


    create() {
        this.musicScene = <MusicScene>this.scene.get('Music');
        this.battleScene = <BattleScene>this.scene.get('Battle');

        this.message = new Message(this);
        this.add.existing(this.message);

        // setup frames
        this.setupFrames();

        // setup text
        this.setupText();

        // setup buttons and badges
        this.setupButtonsAndBadges();

        eventsCenter.removeListener('MessageClose');
        eventsCenter.on('MessageClose', this.messageCloseHandler, this);

        this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
            if (event.code === 'Digit1') {
                if (this.battleScene.interactionState !== 'mainselect') {
                    return;
                }
                this.selectAttack();
            }
            if (event.code === 'Space') {
                // console.log('space pressed on the battle ui scene!');
                // console.log({
                //     battleSceneInteractionState: this.battleScene.interactionState,
                //     playerVim: this.battleScene.gameScene.player.stats.maxResource,
                //     botVim: this.battleScene.gameScene.bots[0]?.stats.maxResource
                // });
            }
        });


        this.initiateBattleUI();

        this.sys.events.on('wake', this.initiateBattleUI, this);
    }

    public destroyInventoryButtons() {
        for (const inventoryButton of this.inventoryButtons) {
            inventoryButton.destroy();
            inventoryButton.buttonText.destroy();
        }
        this.inventoryButtons = [];
    }

    public disableAllActionButtons() {
        this.actionButtons.forEach((button) => {
            button.deselect();
        });
    }

    public destroyAbilityButtons() {
        for (const abilityButton of this.abilityButtons) {
            abilityButton.destroy();
            abilityButton.buttonText.destroy();
        }
        this.abilityButtons = [];
    }

    public generateAbilityButtons() {

        const availableAbilities = this.battleScene.gameScene.player.type.skills.filter(ability => {
            return ability.levelAttained <= this.battleScene.gameScene.player.level;
        });



        // SPAWN THE ABILITY BUTTONS
        for (const [index, ability] of availableAbilities.entries()) {
            const abilityButton = new UIActionButton(
                this,

                564,
                216 + (index * 50),
                ability.key,
                ability.activeKey,
                ability.name,
                () => {
                    // display text here describing the selected ability
                    this.battleScene.interactionState = `selectingabilityaction${index}`;
                    const selectedAbilityIndex = Number(this.battleScene.interactionState.split('selectingabilityaction')[1]);
                    const selectedAbility = this.battleScene.gameScene.player.type.skills[selectedAbilityIndex];
                    this.inventoryAndAbilityDetailFrame.setVisible(true);
                    this.inventoryAndAbilityDetailText.setText(selectedAbility.description);
                    this.inventoryAndAbilityDetailText.setVisible(true);
                    this.useAbilityButton.setVisible(true);
                    this.useAbilityButton.buttonText.setVisible(true);

                    this.updateAndShowCancelButton(153, 357, 'Cancel', false);

                    this.abilityIndex = index;
                    this.abilityButtons[index].select();
                    for (const [abilityButtonIndex, abilityButton] of this.abilityButtons.entries()) {
                        if (abilityButtonIndex !== index) {
                            abilityButton.deselect();
                        }
                    }
                }
            );
            abilityButton.setVisible(false);
            abilityButton.buttonText.setVisible(false);

            this.abilityButtons.push(abilityButton);
        }
    }

    public generateInventoryButtons() {
        // iterate over all inventory entries
        for (const [index, item] of this.battleScene.gameScene.player.inventory.entries()) {

            const inventoryButton = new UIActionButton(
                this,
                564,
                216 + (index * 50),
                item.key,
                item.activeKey,
                item.name,
                () => {
                    // display text here describing the selected item
                    this.battleScene.interactionState = `selectinginventoryaction${index}`;
                    const selectedItemIndex = Number(this.battleScene.interactionState.split('selectinginventoryaction')[1]);
                    const selectedItem = this.battleScene.gameScene.player.inventory[selectedItemIndex];
                    this.inventoryAndAbilityDetailFrame.setVisible(true);
                    this.inventoryAndAbilityDetailText.setText(selectedItem.description);
                    this.inventoryAndAbilityDetailText.setVisible(true);
                    this.useItemButton.setVisible(true);
                    this.useItemButton.buttonText.setVisible(true);

                    this.updateAndShowCancelButton(153, 357, 'Cancel', false);

                    this.inventoryIndex = index;
                    this.inventoryButtons[index].select();
                    for (const [inventoryButtonIndex, inventoryButton] of this.inventoryButtons.entries()) {
                        if (inventoryButtonIndex !== index) {
                            inventoryButton.deselect();
                        }
                    }
                }
            );
            inventoryButton.setVisible(false);
            inventoryButton.buttonText.setVisible(false);

            this.inventoryButtons.push(inventoryButton);

        }
    }

    public hideUIFrames() {
        const elementsToHide = [
            this.cancelButton,
            this.cancelButton.buttonText,
            this.cancelMenuFrame,
            this.confirmMenuFrame,
            this.commandMenuFrame,
            this.commandMenuText,
            this.selectedItemAndAbilityCommandText,
            this.hotkeyMenuFrame,
            this.hotkeyButton1,
            this.hotkeyBadge1
        ];

        for (const element of elementsToHide) {
            element.setVisible(false);
        }
    }


    public showCommandAndHotkeyFrames() {
        this.commandMenuFrame.setVisible(true);
        this.commandMenuText.setVisible(true);
        this.hotkeyMenuFrame.setVisible(true);
        this.hotkeyButton1.setVisible(true);
        this.hotkeyBadge1.setVisible(true);

    }

    public updateAndShowCancelButton(x: number, y: number, text: string, show: boolean) {
        // call the new function to update the cancel button and its components, and control the visibility of the cancel frame
        updateCancelButton(this.cancelButton, this.cancelMenuFrame, x, y, text, show);
    }

    private initiateBattleUI() {
        this.hideUIFrames();
        eventsCenter.emit('Message', `A ${this.battleScene.enemies[0].name} approaches.`);
    }

    private messageCloseHandler() {
        if (this.battleScene.interactionState === 'init') {
            this.showCommandAndHotkeyFrames();
            this.battleScene.interactionState = 'mainselect';
        }
    }

    private selectAbility() {
        this.destroyAbilityButtons();
        this.generateAbilityButtons();
        this.disableAllActionButtons();
        this.closeInventory();

        this.abilityButton.select();

        this.confirmMenuFrame.setVisible(false);

        this.message.setVisible(false);

        this.commandMenuFrame.setVisible(false);
        this.commandMenuText.setVisible(false);
        this.selectedItemAndAbilityCommandText.setVisible(false);

        this.hotkeyButton1.setVisible(false);
        this.hotkeyMenuFrame.setVisible(false);
        this.hotkeyBadge1.setVisible(false);

        this.confirmSelectedAbilityOrItemFrame.setVisible(false);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);

        this.inventoryAndAbilityMenuFrame.setVisible(true);
        this.subInventoryAndAbilityMenuFrame.setVisible(true);

        this.inventoryAndAbilityDetailFrame.setVisible(false);
        this.inventoryAndAbilityDetailText.setVisible(false);
        this.useItemButton.setVisible(false);
        this.useItemButton.buttonText.setVisible(false);
        this.useAbilityButton.setVisible(false);
        this.useAbilityButton.buttonText.setVisible(false);

        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);

        this.commandMenuText.setText('');

        this.updateAndShowCancelButton(315, 315, 'Cancel', true);

        this.battleScene.interactionState = 'ability';

        for (const item of this.subAbilityButtons) {
            item.setVisible(true);
            item.buttonText.setVisible(true);
        }

        this.subAbilityButton.select();

        for (const ability of this.abilityButtons) {
            ability.setVisible(true);
            ability.buttonText.setVisible(true);

        }
    }

    private selectAttack() {

        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);

        this.hotkeyMenuFrame.setVisible(true);
        this.hotkeyButton1.setVisible(true);
        this.hotkeyBadge1.setVisible(true);

        this.inventoryAndAbilityDetailFrame.setVisible(false);
        this.inventoryAndAbilityDetailText.setVisible(false);
        this.useItemButton.setVisible(false);
        this.useItemButton.buttonText.setVisible(false);

        this.confirmSelectedAbilityOrItemFrame.setVisible(false);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);

        this.closeInventory();
        this.closeAbility();

        this.disableAllActionButtons();

        this.message.setVisible(false);
        this.hotkeyButton1.select();
        this.attackButton.select();

        this.commandMenuFrame.setVisible(false);
        this.selectedItemAndAbilityCommandText.setVisible(false);

        this.confirmMenuFrame.setVisible(true);

        this.updateAndShowCancelButton(698, 430, 'Cancel', true);

        this.commandMenuText.setText('Choose A Target');
        this.commandMenuText.setVisible(true);

        this.battleScene.interactionState = 'attack';
    }

    private selectCancel() {
        this.disableAllActionButtons();

        this.closeInventory();
        this.closeAbility();

        this.cancelButton.setVisible(false);
        this.cancelButton.buttonText.setVisible(false);
        this.cancelMenuFrame.setVisible(false);
        this.confirmMenuFrame.setVisible(false);

        this.confirmSelectedAbilityOrItemFrame.setVisible(false);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);

        this.message.setVisible(false);
        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);

        this.commandMenuFrame.setVisible(true);
        this.commandMenuText.setVisible(true);
        this.commandMenuText.setText('Command?');

        this.selectedItemAndAbilityCommandText.setVisible(false);

        this.hotkeyMenuFrame.setVisible(true);
        this.hotkeyButton1.setVisible(true);
        this.hotkeyBadge1.setVisible(true);

        this.battleScene.interactionState = 'mainselect';

        this.inventoryAndAbilityDetailFrame.setVisible(false);
        this.inventoryAndAbilityDetailText.setVisible(false);
        this.useItemButton.setVisible(false);
        this.useItemButton.buttonText.setVisible(false);
    }

    private selectInventory() {
        this.destroyInventoryButtons();
        this.generateInventoryButtons();

        this.disableAllActionButtons();

        this.closeAbility();

        this.bagButton.select();

        this.confirmMenuFrame.setVisible(false);

        this.commandMenuFrame.setVisible(false);
        this.commandMenuText.setVisible(false);
        this.selectedItemAndAbilityCommandText.setVisible(false);

        this.hotkeyButton1.setVisible(false);
        this.hotkeyMenuFrame.setVisible(false);
        this.hotkeyBadge1.setVisible(false);

        this.confirmSelectedAbilityOrItemFrame.setVisible(false);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);

        this.inventoryAndAbilityMenuFrame.setVisible(true);
        this.subInventoryAndAbilityMenuFrame.setVisible(true);

        this.inventoryAndAbilityDetailFrame.setVisible(false);
        this.inventoryAndAbilityDetailText.setVisible(false);
        this.useItemButton.setVisible(false);
        this.useItemButton.buttonText.setVisible(false);
        this.useAbilityButton.setVisible(false);
        this.useAbilityButton.buttonText.setVisible(false);

        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);

        this.commandMenuText.setText('');

        this.updateAndShowCancelButton(315, 315, 'Cancel', true);


        this.battleScene.interactionState = 'inventory';

        // query the items here!!!
        //  delete and rebuild the buttons here!!!
        for (const item of this.inventoryButtons) {
            item.setVisible(true);
            item.buttonText.setVisible(true);
        }

        for (const item of this.subInventoryButtons) {
            item.setVisible(true);
            item.buttonText.setVisible(true);
        }

        this.subInventoryBagButton.select();
    }

    private selectRun() {
        this.closeInventory();
        this.closeAbility();
        this.disableAllActionButtons();
        this.runButton.select();

        this.inventoryAndAbilityDetailFrame.setVisible(false);
        this.inventoryAndAbilityDetailText.setVisible(false);
        this.useItemButton.setVisible(false);
        this.useItemButton.buttonText.setVisible(false);

        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);

        this.confirmSelectedAbilityOrItemFrame.setVisible(false);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);

        this.battleScene.interactionState = 'run';

        eventsCenter.emit('actionSelect', {
            action: 'run',
            target: this.battleScene.heroes[0]
        });
    }

    private setupButtonsAndBadges() {
        // create buttons and badges third
        this.hotkeyButton1 = new UIActionButton(
            this,
            270,
            575,
            'attackbutton',
            'attackbuttonactive',
            '',
            () => {
                if (this.battleScene.interactionState !== 'mainselect') {
                    return;
                }
                this.selectAttack();

            });
        this.hotkeyButton1.setVisible(false);
        this.actionButtons.push(this.hotkeyButton1);
        this.hotkeyBadge1 = this.add.image(278, 583, 'badge1').setScale(2);
        this.hotkeyBadge1.setVisible(false);

        this.abilityButton = new UIActionButton(
            this,
            30,
            515,
            'bookbutton',
            'bookbuttonactive',
            'Ability',
            () => {


                if (
                    this.battleScene.interactionState === 'mainselect' ||
                    this.battleScene.interactionState.startsWith('inventory') ||
                    this.battleScene.interactionState === 'attack' ||
                    this.battleScene.interactionState.startsWith('selecting') ||
                    this.battleScene.interactionState.startsWith('abilityaction')
                ) {
                    this.selectAbility();
                }

            });
        this.actionButtons.push(this.abilityButton);

        this.bagButton = new UIActionButton(
            this,
            30,
            565,
            'bagbutton',
            'bagbuttonactive',
            'Item',
            () => {
                if (this.battleScene.interactionState === 'mainselect' ||
                    this.battleScene.interactionState.startsWith('ability') ||
                    this.battleScene.interactionState === 'attack' ||
                    this.battleScene.interactionState.startsWith('selecting') ||
                    this.battleScene.interactionState.startsWith('inventoryaction')

                ) {
                    eventsCenter.emit('bag');
                    this.selectInventory();
                }
            }
        );
        this.actionButtons.push(this.bagButton);

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

        this.attackButton = new UIActionButton(
            this,
            30,
            465,
            'attackbutton',
            'attackbuttonactive',
            'Attack',
            () => {
                if (
                    this.battleScene.interactionState === 'mainselect' ||
                    this.battleScene.interactionState.startsWith('inventory') ||
                    this.battleScene.interactionState.startsWith('ability') ||
                    this.battleScene.interactionState.startsWith('selecting')
                ) {
                    this.selectAttack();
                }
            });
        this.actionButtons.push(this.attackButton);

        this.tacticsButton = new UIActionButton(
            this,
            30,
            615,
            'bagbutton',
            'bagbuttonactive',
            'Tactics',
            () => {
                // tactics button clicked
                return;
            }
        );

        this.runButton = new UIActionButton(
            this,
            30,
            665,
            'runbutton',
            'runbuttonactive',
            'Escape',
            () => {
                if (this.battleScene.interactionState !== 'mainselect' &&
                    this.battleScene.interactionState !== 'inventory' &&
                    this.battleScene.interactionState !== 'attack' &&
                    this.battleScene.interactionState !== 'ability' &&
                    !this.battleScene.interactionState.startsWith('inventoryaction') &&
                    !this.battleScene.interactionState.startsWith('selecting')) {
                    return;
                }

                this.selectRun();

            });
        this.actionButtons.push(this.runButton);

        this.cancelButton = new UIActionButton(
            this,
            730,
            465,
            'crossbutton',
            'crossbutton',
            'Cancel',
            () => {
                if (this.battleScene.interactionState !== 'mainselect') {
                    this.selectCancel();
                }
            });

        this.cancelButton.setVisible(false);
        this.cancelButton.buttonText.setVisible(false);
        this.actionButtons.push(this.cancelButton);

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

        this.useAbilityButton = new UIActionButton(
            this,
            35,
            392,
            'checkbutton',
            'checkbutton',
            'Use',
            () => {
                this.battleScene.interactionState = this.battleScene.interactionState.split('selecting')[1];
                this.useAbilityButton.setVisible(false);
                this.useAbilityButton.buttonText.setVisible(false);
                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.inventoryAndAbilityDetailText.setVisible(false);
                this.subInventoryAndAbilityMenuFrame.setVisible(false);
                this.subInventoryBagButton.setVisible(false);
                this.subInventoryBagButton.buttonText.setVisible(false);

                this.confirmSelectedAbilityOrItemFrame.setVisible(true);
                this.confirmSelectedAbilityOrItemFrameB.setVisible(true);

                this.updateAndShowCancelButton(698, 430, 'Cancel', true);


                this.inventoryAndAbilityMenuFrame.setVisible(false);
                for (const abilityButton of this.abilityButtons) {
                    abilityButton.setVisible(false);
                    abilityButton.buttonText.setVisible(false);
                }

                for (const subAbilityButton of this.subAbilityButtons) {
                    subAbilityButton.setVisible(false);
                    subAbilityButton.buttonText.setVisible(false);
                }

                this.message.text.setText('');

                this.selectedItemAndAbilityIcon.destroy();
                this.selectedItemAndAbilityIcon.buttonText.destroy();


                // get the selected ability!!!
                const selectedAbilityIndex = Number(this.battleScene.interactionState.split('abilityaction')[1]);



                const availableAbilities = this.battleScene.gameScene.player.type.skills.filter(ability => {
                    return ability.levelAttained <= this.battleScene.gameScene.player.level;
                });

                const selectedAbility = availableAbilities[selectedAbilityIndex];

                this.selectedItemAndAbilityIcon = new UIActionButton(
                    this,
                    265,
                    465,
                    selectedAbility.key,
                    selectedAbility.activeKey,
                    selectedAbility.name,
                    () => {
                        return;
                    }
                );

                this.selectedItemAndAbilityIcon.setVisible(true);
                this.selectedItemAndAbilityIcon.buttonText.setVisible(true);

                this.selectedItemAndAbilityCommandText.setText('Choose A Target');
                this.selectedItemAndAbilityCommandText.setVisible(true);


            }
        );
        this.useAbilityButton.setVisible(false);
        this.useAbilityButton.buttonText.setVisible(false);

        this.useItemButton = new UIActionButton(
            this,
            35,
            392,
            'checkbutton',
            'checkbutton',
            'Use',
            () => {
                this.battleScene.interactionState = this.battleScene.interactionState.split('selecting')[1];
                this.useItemButton.setVisible(false);
                this.useItemButton.buttonText.setVisible(false);
                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.inventoryAndAbilityDetailText.setVisible(false);
                this.subInventoryAndAbilityMenuFrame.setVisible(false);
                this.subInventoryBagButton.setVisible(false);
                this.subInventoryBagButton.buttonText.setVisible(false);

                this.confirmSelectedAbilityOrItemFrame.setVisible(true);
                this.confirmSelectedAbilityOrItemFrameB.setVisible(true);

                this.updateAndShowCancelButton(698, 430, 'Cancel', true);

                this.inventoryAndAbilityMenuFrame.setVisible(false);
                for (const inventoryButton of this.inventoryButtons) {
                    inventoryButton.setVisible(false);
                    inventoryButton.buttonText.setVisible(false);
                }

                this.message.text.setText('');

                this.selectedItemAndAbilityIcon.destroy();
                this.selectedItemAndAbilityIcon.buttonText.destroy();

                // get the selected item!!!
                const selectedItemIndex = Number(this.battleScene.interactionState.split('inventoryaction')[1]);
                const selectedItem = this.battleScene.gameScene.player.inventory[selectedItemIndex];

                this.selectedItemAndAbilityIcon = new UIActionButton(
                    this,
                    265,
                    465,
                    selectedItem.key,
                    selectedItem.activeKey,
                    selectedItem.name,
                    () => {
                        return;
                    }
                );


                this.selectedItemAndAbilityIcon.setVisible(true);
                this.selectedItemAndAbilityIcon.buttonText.setVisible(true);

                this.selectedItemAndAbilityCommandText.setText('Choose A Target');
                this.selectedItemAndAbilityCommandText.setVisible(true);
            }
        );
        this.useItemButton.setVisible(false);
        this.useItemButton.buttonText.setVisible(false);

    }

    private setupFrames() {
        this.commandMenuFrame = this.add.image(236, 430, 'commandMenuFrame').setOrigin(0, 0);
        this.commandMenuFrame.setVisible(false);

        this.hotkeyMenuFrame = this.add.image(236, 546, 'hotkeyMenuFrame').setOrigin(0, 0);
        this.hotkeyMenuFrame.setVisible(false);

        this.confirmMenuFrame = this.add.image(236, 430, 'confirmMenuFrame').setOrigin(0, 0);
        this.confirmMenuFrame.setVisible(false);

        this.cancelMenuFrame = this.add.image(698, 430, 'cancelMenuFrame').setOrigin(0, 0);
        this.cancelMenuFrame.setVisible(false);

        this.inventoryAndAbilityMenuFrame = this.add.image(532, 181, 'inventoryAndAbilityMenuFrame').setOrigin(0, 0);
        this.inventoryAndAbilityMenuFrame.setVisible(false);

        this.subInventoryAndAbilityMenuFrame = this.add.image(236, 430, 'subInventoryAndAbilityMenuFrame').setOrigin(0, 0);
        this.subInventoryAndAbilityMenuFrame.setVisible(false);

        this.confirmSelectedAbilityOrItemFrame = this.add.image(236, 430, 'confirmSelectedAbilityOrItemFrame').setOrigin(0, 0);
        this.confirmSelectedAbilityOrItemFrame.setVisible(false);

        this.confirmSelectedAbilityOrItemFrameB = this.add.image(236, 505, 'confirmSelectedAbilityOrItemFrameB').setOrigin(0, 0);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);

        this.inventoryAndAbilityDetailFrame = this.add.image(3, 105, 'inventoryAndAbilityDetailFrame').setOrigin(0, 0);
        this.inventoryAndAbilityDetailFrame.setVisible(false);
    }

    private setupText() {
        // create text second
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
            })
            .setResolution(3);
        this.selectedItemAndAbilityCommandText.setVisible(false);

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
    }

    public hideAbilitySelectionUI() {
        this.message.setVisible(false);
        this.confirmSelectedAbilityOrItemFrame.setVisible(false);
        this.confirmSelectedAbilityOrItemFrameB.setVisible(false);
        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);
        this.selectedItemAndAbilityCommandText.setVisible(false);

        for (const abilityButton of this.abilityButtons) {
            abilityButton.deselect();
            abilityButton.setVisible(false);
            abilityButton.buttonText.setVisible(false);
        }
    }
}