import Message from '../classes/Message';
import UIActionButton from '../classes/UIActionButton';
import eventsCenter from '../utils/EventsCenter';
import BattleScene from './BattleScene';

export default class BattleUIScene extends Phaser.Scene {
    public attackButton!: UIActionButton;
    private bagButton!: UIActionButton;
    private abilityButton!: UIActionButton;
    private runButton!: UIActionButton;
    private battleScene!: BattleScene;
    public message!: Message;
    private commandMenuFrame!: Phaser.GameObjects.Image;
    commandMenuText!: Phaser.GameObjects.Text;
    private hotkeyMenuFrame!: Phaser.GameObjects.Image;
    private hotkeyButton1!: UIActionButton;
    private hotkeyBadge1!: Phaser.GameObjects.Image;
    private actionButtons: UIActionButton[] = [];
    private subInventoryButtons: UIActionButton[] = [];
    public inventoryButtons: UIActionButton[] = [];
    private confirmMenuFrame!: Phaser.GameObjects.Image;
    private cancelMenuFrame!: Phaser.GameObjects.Image;
    private cancelText!: Phaser.GameObjects.Text;
    private cancelButton!: UIActionButton;
    private inventoryMenuFrame!: Phaser.GameObjects.Image;
    private subInventoryMenuFrame!: Phaser.GameObjects.Image;
    private subInventoryBagButton!: UIActionButton;
    public inventoryIndex!: number;

    constructor() {
        super('BattleUI');
    }

    create() {
        // get a reference to the battle scene
        this.battleScene = <BattleScene>this.scene.get('Battle');

        this.message = new Message(this);
        this.add.existing(this.message);

        // create frames first
        this.commandMenuFrame = this.add.image(236, 430, 'commandMenuFrame')
            .setOrigin(0, 0);
        this.commandMenuFrame.visible = false;
        this.hotkeyMenuFrame = this.add.image(236, 546, 'hotkeyMenuFrame')
            .setOrigin(0, 0);
        this.hotkeyMenuFrame.visible = false;
        this.confirmMenuFrame = this.add.image(236, 430, 'confirmMenuFrame')
            .setOrigin(0, 0);
        this.confirmMenuFrame.visible = false;
        this.cancelMenuFrame = this.add.image(698, 430, 'cancelMenuFrame')
            .setOrigin(0, 0);
        this.cancelMenuFrame.visible = false;
        this.inventoryMenuFrame = this.add.image(532, 181, 'inventoryMenuFrame')
            .setOrigin(0, 0);
        this.inventoryMenuFrame.visible = false;
        this.subInventoryMenuFrame = this.add.image(236, 430, 'subInventoryMenuFrame')
            .setOrigin(0, 0);
        this.subInventoryMenuFrame.visible = false;

        // create text second
        this.commandMenuText = this.add.text(244, 440, 'Command?', {
            fontSize: '55px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.commandMenuText.visible = false;
        this.cancelText = this.add.text(710, 440, 'Cancel', {
            fontSize: '55px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);
        this.cancelText.visible = false;
        this.cancelText.setInteractive();
        this.cancelText.on('pointerdown', () => {
            if (this.battleScene.interactionState !== 'mainselect') {
                this.selectCancel();
            }
        });

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
        this.hotkeyButton1.visible = false;
        this.actionButtons.push(this.hotkeyButton1);
        this.hotkeyBadge1 = this.add.image(278, 583, 'badge1').setScale(2);
        this.hotkeyBadge1.visible = false;

        this.abilityButton = new UIActionButton(
            this,
            30,
            515,
            'bookbutton',
            'bookbuttonactive',
            'Ability',
            () => {
                if (this.battleScene.interactionState !== 'mainselect' &&
                    this.battleScene.interactionState !== 'inventory' &&
                    !this.battleScene.interactionState.startsWith('inventoryaction')) {
                    return;
                }
                eventsCenter.emit('abilities');
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
        this.subInventoryBagButton.visible = false;
        this.subInventoryBagButton.buttonText.visible = false;


        this.subInventoryButtons.push(this.subInventoryBagButton);

        this.generateInventoryButtons();

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
                    !this.battleScene.interactionState.startsWith('inventoryaction')) {
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
                    !this.battleScene.interactionState.startsWith('inventoryaction')) {
                    return;
                }

                this.selectRun();

            });
        this.actionButtons.push(this.runButton);

        this.cancelButton = new UIActionButton(
            this,
            865,
            465,
            'cancelbutton',
            'cancelbutton',
            '',
            () => {
                if (this.battleScene.interactionState !== 'mainselect') {
                    this.selectCancel();
                }
            });
        this.cancelButton.visible = false;
        this.actionButtons.push(this.cancelButton);

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
                    this.inventoryIndex = index;
                    this.inventoryButtons[index].select();
                    for (const [inventoryButtonIndex, inventoryButton] of this.inventoryButtons.entries()) {
                        if (inventoryButtonIndex !== index) {
                            inventoryButton.deselect();
                        }
                    }
                    this.battleScene.interactionState = `inventoryaction${index}`;
                }
            );
            inventoryButton.visible = false;
            inventoryButton.buttonText.visible = false;

            this.inventoryButtons.push(inventoryButton);

        }
    }

    private messageCloseHandler() {
        if (this.battleScene.interactionState === 'init') {
            this.showCommandAndHotkeyFrames();
            this.battleScene.interactionState = 'mainselect';
        }
    }

    public showCommandAndHotkeyFrames() {
        this.commandMenuFrame.visible = true;
        this.commandMenuText.visible = true;
        this.hotkeyMenuFrame.visible = true;
        this.hotkeyButton1.visible = true;
        this.hotkeyBadge1.visible = true;

    }

    public disableAllActionButtons() {
        this.actionButtons.forEach((button) => {
            button.deselect();
        });
    }

    private selectAttack() {

        this.hotkeyMenuFrame.visible = true;
        this.hotkeyButton1.visible = true;
        this.hotkeyBadge1.visible = true;

        this.cancelMenuFrame.y = 430;
        this.cancelText.y = 440;
        this.cancelButton.y = 465;

        this.closeInventory();

        this.disableAllActionButtons();



        this.message.visible = false;
        this.hotkeyButton1.select();
        this.attackButton.select();

        this.commandMenuFrame.visible = false;

        this.confirmMenuFrame.visible = true;
        this.cancelMenuFrame.visible = true;
        this.cancelText.visible = true;
        this.cancelButton.visible = true;

        this.commandMenuText.setText('Choose A Target');
        this.commandMenuText.visible = true;

        this.battleScene.interactionState = 'attack';
    }

    private selectRun() {
        this.closeInventory();
        this.disableAllActionButtons();
        this.runButton.select();

        this.battleScene.interactionState = 'run';

        eventsCenter.emit('actionSelect', {
            action: 'run',
            target: this.battleScene.heroes[0]
        });
    }

    private selectCancel() {
        this.disableAllActionButtons();

        this.closeInventory();

        this.cancelText.visible = false;
        this.cancelButton.visible = false;
        this.cancelMenuFrame.visible = false;
        this.confirmMenuFrame.visible = false;

        this.commandMenuFrame.visible = true;
        this.commandMenuText.visible = true;
        this.commandMenuText.setText('Command?');

        this.hotkeyMenuFrame.visible = true;
        this.hotkeyButton1.visible = true;
        this.hotkeyBadge1.visible = true;

        this.battleScene.interactionState = 'mainselect';
    }

    public hideUIFrames() {
        this.cancelButton.visible = false;
        this.cancelText.visible = false;
        this.cancelMenuFrame.visible = false;
        this.confirmMenuFrame.visible = false;
        this.commandMenuFrame.visible = false;
        this.commandMenuText.visible = false;
        this.hotkeyMenuFrame.visible = false;
        this.hotkeyButton1.visible = false;
        this.hotkeyBadge1.visible = false;
    }

    private initiateBattleUI() {
        this.hideUIFrames();
        eventsCenter.emit('Message', `A ${this.battleScene.enemies[0].type} approaches.`);
    }

    public closeInventory() {

        for (const inventoryButton of this.inventoryButtons) {
            inventoryButton.deselect();
            inventoryButton.visible = false;
            inventoryButton.buttonText.visible = false;
        }

        for (const subInventoryButton of this.subInventoryButtons) {
            subInventoryButton.deselect();
            subInventoryButton.visible = false;
            subInventoryButton.buttonText.visible = false;
        }

        this.inventoryMenuFrame.visible = false;
        this.subInventoryMenuFrame.visible = false;
    }

    private selectInventory() {

        this.disableAllActionButtons();
        this.bagButton.select();

        this.confirmMenuFrame.visible = false;

        this.commandMenuFrame.visible = false;
        this.commandMenuText.visible = false;

        this.hotkeyButton1.visible = false;
        this.hotkeyMenuFrame.visible = false;
        this.hotkeyBadge1.visible = false;

        this.inventoryMenuFrame.visible = true;
        this.subInventoryMenuFrame.visible = true;

        this.cancelButton.y = 100;

        this.cancelText.y = 75;

        this.cancelMenuFrame.y = 65;

        this.cancelButton.visible = true;
        this.cancelText.visible = true;
        this.cancelMenuFrame.visible = true;

        this.battleScene.interactionState = 'inventory';

        for (const item of this.inventoryButtons) {
            item.visible = true;
            item.buttonText.visible = true;
        }

        for (const item of this.subInventoryButtons) {
            item.visible = true;
            item.buttonText.visible = true;
        }

        this.subInventoryBagButton.select();

    }
}