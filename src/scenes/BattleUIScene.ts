import eventsCenter from '../utils/EventsCenter';
import UIActionButton from '../classes/UIActionButton';
import BattleScene from './BattleScene';
import Message from '../classes/Message';

export default class BattleUIScene extends Phaser.Scene {
    private bagButton!: UIActionButton;
    public attackButton!: UIActionButton;
    private abilityButton!: UIActionButton;
    private runButton!: UIActionButton;
    private battleScene!: BattleScene;
    private message!: Message;
    private commandMenuFrame!: Phaser.GameObjects.Image;
    private commandMenuText!: Phaser.GameObjects.Text;
    private hotkeyMenuFrame!: Phaser.GameObjects.Image;
    private hotkeyButton1!: UIActionButton;
    private hotkeyBadge1!: Phaser.GameObjects.Image;
    private actionButtons: UIActionButton[] = [];
    private confirmMenuFrame!: Phaser.GameObjects.Image;
    private cancelMenuFrame!: Phaser.GameObjects.Image;
    private cancelText!: Phaser.GameObjects.Text;
    private cancelButton!: UIActionButton;

    constructor() {
        super('BattleUI');
    }

    create() {
        // get a reference to the battle scene
        this.battleScene = <BattleScene>this.scene.get('Battle');

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

        // create text second
        this.commandMenuText = this.add.text(245, 440, 'Command?', { fontSize: '55px', color: '#fff', fontFamily: 'CustomFont'})
            .setResolution(10);
        this.commandMenuText.visible = false;
        this.cancelText = this.add.text(710, 440, 'Cancel', { fontSize: '55px', color: '#fff', fontFamily: 'CustomFont'})
            .setResolution(10);
        this.cancelText.visible = false;

        // create buttons and badges third
        this.hotkeyButton1 = new UIActionButton(this, 270, 575, 'attackbutton', 'attackbuttonactive', '', () => {
            if (this.battleScene.interactionState !== 'mainselect') {
                return;
            }
            this.selectAttack();

        });
        this.hotkeyButton1.visible = false;
        this.actionButtons.push(this.hotkeyButton1);
        this.hotkeyBadge1 = this.add.image(278, 583, 'badge1').setScale(2);
        this.hotkeyBadge1.visible = false;
        this.attackButton = new UIActionButton(this, 30, 465, 'attackbutton', 'attackbuttonactive', 'Attack', () => {
            if (this.battleScene.interactionState !== 'mainselect') {
                return;
            }
            this.selectAttack();

        });
        this.actionButtons.push(this.attackButton);

        this.abilityButton = new UIActionButton(this, 30, 515, 'bookbutton', 'bookbuttonactive', 'Abilities', () => {
            if (this.battleScene.interactionState !== 'mainselect') {
                return;
            }
            eventsCenter.emit('abilities');
        });
        this.actionButtons.push(this.abilityButton);

        this.bagButton = new UIActionButton(this, 30, 565, 'bagbutton', 'bagbuttonactive', 'Inventory', () => {
            if (this.battleScene.interactionState !== 'mainselect') {
                return;
            }
            eventsCenter.emit('bag');
        });
        this.actionButtons.push(this.bagButton);

        this.runButton = new UIActionButton(this, 30, 615, 'runbutton', 'runbuttonactive', 'Run', () => {
            if (this.battleScene.interactionState !== 'mainselect') {
                return;
            }
            eventsCenter.emit('run');
        });
        this.actionButtons.push(this.runButton);

        this.cancelButton = new UIActionButton(this, 865, 465, 'cancelbutton', 'cancelbutton', '', () => {
            if (this.battleScene.interactionState !== 'mainselect') {
                this.selectCancel();
                eventsCenter.emit('cancel');
                // return;
            }
        });
        this.cancelButton.visible = false;
        this.actionButtons.push(this.cancelButton);


        this.message = new Message(this, this.battleScene.events);
        this.add.existing(this.message);

        eventsCenter.removeListener('MessageClose');
        eventsCenter.on('MessageClose', this.messageCloseHandler, this);

        this.input.keyboard.on('keydown', (event) => {
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

    messageCloseHandler() {
        if (this.battleScene.interactionState === 'init') {
            this.showCommandAndHotkeyFrames();
            this.battleScene.interactionState = 'mainselect';
        }
    }

    showCommandAndHotkeyFrames() {
        this.commandMenuFrame.visible = true;
        this.commandMenuText.visible = true;
        this.hotkeyMenuFrame.visible = true;
        this.hotkeyButton1.visible = true;
        this.hotkeyBadge1.visible = true;

    }

    disableAllActionButtons() {
        this.actionButtons.forEach((button) => {
            button.deselect();
        });
    }

    selectAttack() {
        eventsCenter.emit('attack');

        this.disableAllActionButtons();
        this.hotkeyButton1.select();
        this.attackButton.select();

        this.commandMenuFrame.visible = false;

        this.confirmMenuFrame.visible = true;
        this.cancelMenuFrame.visible = true;
        this.cancelText.visible = true;
        this.cancelButton.visible = true;

        this.commandMenuText.setText('Choose A Target');

        this.battleScene.interactionState = 'attack';
    }

    selectCancel() {
        this.disableAllActionButtons();

        this.cancelText.visible = false;
        this.cancelButton.visible = false;
        this.cancelMenuFrame.visible = false;
        this.confirmMenuFrame.visible = false;

        this.commandMenuFrame.visible = true;

        this.commandMenuText.setText('Command?');

        this.battleScene.interactionState = 'mainselect';
    }

    hideUIFrames() {
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
        eventsCenter.emit('Message', 'A cyberfly approaches.');
    }
}