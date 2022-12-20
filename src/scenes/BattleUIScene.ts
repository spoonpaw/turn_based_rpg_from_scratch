import Message from '../classes/Message';
import UIActionButton from '../classes/UIActionButton';
import eventsCenter from '../utils/EventsCenter';
import BattleScene from './BattleScene';
import MusicScene from './MusicScene';

export default class BattleUIScene extends Phaser.Scene {
    public attackButton!: UIActionButton;
    public commandMenuText!: Phaser.GameObjects.Text;
    public confirmSelectedAbilityOrItemFrame!: Phaser.GameObjects.Image;
    public confirmSelectedAbilityOrItemFrameB!: Phaser.GameObjects.Image;
    public inventoryButtons: UIActionButton[] = [];
    public inventoryIndex!: number;
    public message!: Message;
    public selectedItemAndAbilityCommandText!: Phaser.GameObjects.Text;
    public selectedItemAndAbilityIcon!: UIActionButton;
    // public musicMuteButton!: UIActionButton;
    private musicScene!: MusicScene;
    private abilityButton!: UIActionButton;
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
    private runButton!: UIActionButton;
    private subAbilityButton!: UIActionButton;
    private subAbilityButtons: UIActionButton[] = [];
    private subInventoryAndAbilityMenuFrame!: Phaser.GameObjects.Image;
    private subInventoryBagButton!: UIActionButton;
    private subInventoryButtons: UIActionButton[] = [];
    private useButton!: UIActionButton;

    public constructor() {
        super('BattleUI');
    }

    public closeAbility() {
        for (const subAbilityButton of this.subAbilityButtons) {
            subAbilityButton.deselect();
            subAbilityButton.setVisible(false);
            subAbilityButton.buttonText.setVisible(false);
        }

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

    public create() {

        this.musicScene = <MusicScene>this.scene.get('Music');

        // get a reference to the battle scene
        this.battleScene = <BattleScene>this.scene.get('Battle');

        this.message = new Message(this);
        this.add.existing(this.message);

        // create frames first
        this.commandMenuFrame = this.add.image(236, 430, 'commandMenuFrame')
            .setOrigin(0, 0);
        this.commandMenuFrame.setVisible(false);

        this.hotkeyMenuFrame = this.add.image(236, 546, 'hotkeyMenuFrame')
            .setOrigin(0, 0);
        this.hotkeyMenuFrame.setVisible(false);

        this.confirmMenuFrame = this.add.image(236, 430, 'confirmMenuFrame')
            .setOrigin(0, 0);
        this.confirmMenuFrame.setVisible(false);

        this.cancelMenuFrame = this.add.image(698, 430, 'cancelMenuFrame')
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

        this.selectedItemAndAbilityCommandText = this.add.text(
            244,
            510,
            'Choose A Target',
            {
                fontSize: '55px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
            .setResolution(10);
        this.selectedItemAndAbilityCommandText.setVisible(false);

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
        this.inventoryAndAbilityDetailText.setLineSpacing(-10);
        this.inventoryAndAbilityDetailText.setVisible(false);

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
                if (this.battleScene.interactionState !== 'mainselect' &&
                    this.battleScene.interactionState !== 'attack' &&
                    this.battleScene.interactionState !== 'inventory' &&
                    !this.battleScene.interactionState.startsWith('inventoryaction') &&
                    !this.battleScene.interactionState.startsWith('selecting')) {
                    return;
                }
                this.selectAbility();
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
                if (this.battleScene.interactionState !== 'mainselect' &&
                    this.battleScene.interactionState !== 'ability' &&
                    this.battleScene.interactionState !== 'attack') {
                    return;
                }
                eventsCenter.emit('bag');
                this.selectInventory();
            });
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
                if (this.battleScene.interactionState !== 'mainselect' &&
                    this.battleScene.interactionState !== 'inventory' &&
                    this.battleScene.interactionState !== 'ability' &&
                    !this.battleScene.interactionState.startsWith('inventoryaction') &&
                    !this.battleScene.interactionState.startsWith('selecting')) {
                    return;
                }
                this.selectAttack();
            });
        this.actionButtons.push(this.attackButton);

        this.runButton = new UIActionButton(
            this,
            30,
            615,
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

        this.useButton = new UIActionButton(
            this,
            35,
            385,
            'checkbutton',
            'checkbutton',
            'Use',
            () => {
                this.battleScene.interactionState = this.battleScene.interactionState.split('selecting')[1];
                this.useButton.setVisible(false);
                this.useButton.buttonText.setVisible(false);
                this.inventoryAndAbilityDetailFrame.setVisible(false);
                this.inventoryAndAbilityDetailText.setVisible(false);
                this.subInventoryAndAbilityMenuFrame.setVisible(false);
                this.subInventoryBagButton.setVisible(false);
                this.subInventoryBagButton.buttonText.setVisible(false);

                this.cancelMenuFrame.setX(698);
                this.cancelMenuFrame.setY(430);
                this.cancelMenuFrame.setVisible(true);

                this.confirmSelectedAbilityOrItemFrame.setVisible(true);
                this.confirmSelectedAbilityOrItemFrameB.setVisible(true);

                this.cancelButton.setX(730);
                this.cancelButton.setY(465);
                this.cancelButton.buttonText.setX(750);
                this.cancelButton.buttonText.setY(440);

                this.inventoryAndAbilityMenuFrame.setVisible(false);
                for (const inventoryButton of this.inventoryButtons) {
                    inventoryButton.setVisible(false);
                    inventoryButton.buttonText.setVisible(false);
                }

                this.message.text.setText('');
                // this.message.setVisible(true);

                // this.selectedItemAndAbilityIcon gets destroyed and
                //  regenerated here based on what the selected item is

                this.selectedItemAndAbilityIcon.destroy();
                this.selectedItemAndAbilityIcon.buttonText.destroy();

                // get the selected item!!!
                const selectedItemIndex = Number(this.battleScene.interactionState.split('inventoryaction')[1]);
                const selectedItem = this.battleScene.heroes[0].inventory[selectedItemIndex];

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

                // this.commandMenuText.setText('\nChoose A Target.');
                // this.commandMenuText.setVisible(true);
            }
        );
        this.useButton.setVisible(false);
        this.useButton.buttonText.setVisible(false);

        eventsCenter.removeListener('MessageClose');
        eventsCenter.on('MessageClose', this.messageCloseHandler, this);

        this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
            if (event.code === 'Digit1') {
                if (this.battleScene.interactionState !== 'mainselect') {
                    return;
                }
                this.selectAttack();
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

    public generateInventoryButtons() {
        // iterate over all inventory entries
        for (const [index, item] of this.battleScene.heroes[0].inventory.entries()) {

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
                    const selectedItem = this.battleScene.heroes[0].inventory[selectedItemIndex];
                    this.cancelMenuFrame.setVisible(false);
                    this.inventoryAndAbilityDetailFrame.setVisible(true);
                    this.inventoryAndAbilityDetailText.setText(selectedItem.description);
                    this.inventoryAndAbilityDetailText.setVisible(true);
                    this.useButton.setVisible(true);
                    this.useButton.buttonText.setVisible(true);

                    this.cancelButton.setX(185);
                    this.cancelButton.setY(385);

                    this.cancelButton.buttonText.setX(205);
                    this.cancelButton.buttonText.setY(360);

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
        this.cancelButton.setVisible(false);
        this.cancelButton.buttonText.setVisible(false);
        // this.cancelText.setVisible(false);
        this.cancelMenuFrame.setVisible(false);
        this.confirmMenuFrame.setVisible(false);
        this.commandMenuFrame.setVisible(false);
        this.commandMenuText.setVisible(false);
        this.selectedItemAndAbilityCommandText.setVisible(false);
        this.hotkeyMenuFrame.setVisible(false);
        this.hotkeyButton1.setVisible(false);
        this.hotkeyBadge1.setVisible(false);
    }

    public showCommandAndHotkeyFrames() {
        this.commandMenuFrame.setVisible(true);
        this.commandMenuText.setVisible(true);
        this.hotkeyMenuFrame.setVisible(true);
        this.hotkeyButton1.setVisible(true);
        this.hotkeyBadge1.setVisible(true);

    }

    private initiateBattleUI() {

        this.hideUIFrames();
        eventsCenter.emit('Message', `A ${this.battleScene.enemies[0].type} approaches.`);
    }

    private messageCloseHandler() {
        if (this.battleScene.interactionState === 'init') {
            this.showCommandAndHotkeyFrames();
            this.battleScene.interactionState = 'mainselect';
        }
    }

    private selectAbility() {
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
        // this.inventoryAndAbilityCancelButton.setVisible(false);
        // this.inventoryAndAbilityCancelButton.buttonText.setVisible(false);
        this.inventoryAndAbilityDetailText.setVisible(false);
        this.useButton.setVisible(false);
        this.useButton.buttonText.setVisible(false);

        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);

        this.commandMenuText.setText('');

        this.cancelButton.setX(347);
        this.cancelButton.setY(350);

        this.cancelButton.buttonText.setY(325);
        this.cancelButton.buttonText.setX(367);

        this.cancelMenuFrame.setX(315);
        this.cancelMenuFrame.setY(315);

        this.cancelButton.setVisible(true);
        this.cancelButton.buttonText.setText('Cancel');
        this.cancelButton.buttonText.setVisible(true);
        this.cancelMenuFrame.setVisible(true);

        this.battleScene.interactionState = 'ability';

        for (const item of this.subAbilityButtons) {
            item.setVisible(true);
            item.buttonText.setVisible(true);
        }

        this.subAbilityButton.select();
    }

    private selectAttack() {

        this.selectedItemAndAbilityIcon.setVisible(false);
        this.selectedItemAndAbilityIcon.buttonText.setVisible(false);

        this.hotkeyMenuFrame.setVisible(true);
        this.hotkeyButton1.setVisible(true);
        this.hotkeyBadge1.setVisible(true);

        this.cancelMenuFrame.setX(698);
        this.cancelMenuFrame.setY(430);

        this.cancelButton.setX(730);
        this.cancelButton.setY(465);

        this.cancelButton.buttonText.setX(750);
        this.cancelButton.buttonText.setY(440);

        this.inventoryAndAbilityDetailFrame.setVisible(false);
        this.inventoryAndAbilityDetailText.setVisible(false);
        this.useButton.setVisible(false);
        this.useButton.buttonText.setVisible(false);

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
        this.cancelMenuFrame.setVisible(true);
        // this.cancelText.setVisible(true);
        this.cancelButton.setVisible(true);
        this.cancelButton.buttonText.setText('Cancel');
        this.cancelButton.buttonText.setVisible(true);

        this.commandMenuText.setText('Choose A Target');
        this.commandMenuText.setVisible(true);

        this.battleScene.interactionState = 'attack';
    }

    private selectCancel() {
        this.disableAllActionButtons();

        this.closeInventory();
        this.closeAbility();

        // this.cancelText.setVisible(false);
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
        this.useButton.setVisible(false);
        this.useButton.buttonText.setVisible(false);
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

        this.inventoryAndAbilityMenuFrame.setVisible(true);
        this.subInventoryAndAbilityMenuFrame.setVisible(true);

        this.cancelButton.setX(347);
        this.cancelButton.setY(350);

        this.cancelButton.buttonText.setY(325);
        this.cancelButton.buttonText.setX(367);

        this.cancelMenuFrame.setX(315);
        this.cancelMenuFrame.setY(315);

        this.cancelButton.setVisible(true);
        this.cancelButton.buttonText.setText('Cancel');
        this.cancelButton.buttonText.setVisible(true);
        this.cancelMenuFrame.setVisible(true);

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
        // this.inventoryAndAbilityCancelButton.setVisible(false);
        // this.inventoryAndAbilityCancelButton.buttonText.setVisible(false);
        this.useButton.setVisible(false);
        this.useButton.buttonText.setVisible(false);

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
}