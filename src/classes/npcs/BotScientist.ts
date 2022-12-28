import GameScene from '../../scenes/GameScene';
import UIScene from '../../scenes/UIScene';
import eventsCenter from '../../utils/EventsCenter';
import Bot from '../Bot';
import NPC from './NPC';

export default class extends NPC {
    protected gameScene: GameScene;
    private uiScene: UIScene;

    constructor(
        public sprite: Phaser.GameObjects.Sprite,
        protected tilePos: Phaser.Math.Vector2
    ) {
        super(sprite, tilePos);
        this.gameScene = <GameScene>this.sprite.scene;
        this.uiScene = <UIScene>this.gameScene.scene.get('UI');
    }

    public listenForInteractEvent() {
        // innkeeper heard player press the space bar somewhere!
        // check if player is facing innkeeper
        if (this.testForInteractionReadyState()) {
            this.runDialog();
        }
    }

    private checkIfPlayerHasBot() {
        return this.gameScene.bots.length > 0;
    }

    public runDialog() {
        console.log('you are talking to the bot scientist');
        this.uiScene.interactionState = 'botscientistselect';
        this.gameScene.gamePadScene?.scene.stop();

        this.gameScene.input.keyboard!.enabled = false;
        if (this.gameScene.gridPhysics.facingDirection === 'right') this.sprite.setFrame(1);
        if (this.gameScene.gridPhysics.facingDirection === 'up') this.sprite.setFrame(0);
        if (this.gameScene.gridPhysics.facingDirection === 'left') this.sprite.setFrame(2);

        this.uiScene.leftSideDialogFrame.setVisible(true);

        let greeting;
        if (this.checkIfPlayerHasBot()) {
            greeting = 'Bot Scientist:\nGreetings, adventurer. Thy Bot is a fine companion. The biodome shields us, for now. Keep vigilant, for danger lurks ever-present. Goodbye.';

        }
        else {
            greeting = 'Bot Scientist:\nSo, thou expectest me to build a Bot to aid thee in thy battles? Very well, shall I commence construction at once, brave adventurer?';
        }

        this.uiScene.leftSideDialogText.setText(greeting);
        this.uiScene.leftSideDialogText.setVisible(true);

        if (this.checkIfPlayerHasBot()) {
            this.uiScene.cancelMenuFrame.setX(670);
            this.uiScene.cancelMenuFrame.setY(380);
            this.uiScene.cancelButton.setX(702);
            this.uiScene.cancelButton.setY(415);
            this.uiScene.cancelButton.buttonText.setX(722);
            this.uiScene.cancelButton.buttonText.setY(390);
            this.uiScene.cancelButton.buttonText.setText('Farewell');
            this.uiScene.cancelMenuFrame.setVisible(true);
            this.uiScene.cancelButton.setVisible(true);
            this.uiScene.cancelButton.buttonText.setVisible(true);

            eventsCenter.on('space', () => {
                this.gameScene.gamePadScene?.scene.restart();
                this.uiScene.interactionState = 'mainselect';
                eventsCenter.removeListener('space');
                // eventsCenter.removeListener('no');

                this.uiScene.leftSideDialogFrame.setVisible(false);
                this.uiScene.leftSideDialogText.setText('');
                this.uiScene.leftSideDialogText.setVisible(false);
                this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
                this.uiScene.cancelButton.setVisible(false);
                this.uiScene.cancelButton.buttonText.setVisible(false);
                this.uiScene.cancelMenuFrame.setVisible(false);


                this.gameScene.input.keyboard!.enabled = true;

                this.gameScene.cursors.up.reset();
                this.gameScene.cursors.left.reset();
                this.gameScene.cursors.down.reset();
                this.gameScene.cursors.right.reset();
                this.gameScene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W).reset();
                this.gameScene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A).reset();
                this.gameScene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S).reset();
                this.gameScene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D).reset();
            });
        }

        if (!this.checkIfPlayerHasBot()){
            this.uiScene.rightSideDialogOptionsFrame.setVisible(true);
            this.uiScene.yesButton.setVisible(true);
            this.uiScene.yesButton.buttonText.setVisible(true);
            this.uiScene.noButton.setVisible(true);
            this.uiScene.noButton.buttonText.setVisible(true);

            this.uiScene.interactFrame.setVisible(false);
            this.uiScene.interactButton.setVisible(false);
            this.uiScene.interactButton.buttonText.setVisible(false);

            // eventsCenter.removeListener('space');
            eventsCenter.on('space', () => {
                // if (this.uiScene.interactionState === 'botscientistresponse') {
                //     this.keyboardResponseHandler();
                // }
                this.gameScene.gamePadScene?.scene.restart();
                this.uiScene.interactionState = 'mainselect';
                eventsCenter.removeListener('space');
                eventsCenter.removeListener('yes');
                // eventsCenter.removeListener('no');

                // this.uiScene.goldFrame.setVisible(false);
                // this.uiScene.goldIcon.setVisible(false);
                // this.uiScene.goldText.setVisible(false);
                this.uiScene.leftSideDialogFrame.setVisible(false);
                this.uiScene.leftSideDialogText.setText('');
                this.uiScene.leftSideDialogText.setVisible(false);
                this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
                this.uiScene.yesButton.setVisible(false);
                this.uiScene.yesButton.buttonText.setVisible(false);
                this.uiScene.noButton.setVisible(false);
                this.uiScene.noButton.buttonText.setVisible(false);
                this.uiScene.characterDetailDisplayFrame.setVisible(false);
                this.uiScene.characterDetailDisplay.setVisible(false);

                this.uiScene.cancelMenuFrame.setVisible(false);
                this.uiScene.cancelButton.setVisible(false);
                this.uiScene.cancelButton.buttonText.setVisible(false);

                this.gameScene.input.keyboard!.enabled = true;

                this.gameScene.cursors.up.reset();
                this.gameScene.cursors.left.reset();
                this.gameScene.cursors.down.reset();
                this.gameScene.cursors.right.reset();
                this.gameScene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W).reset();
                this.gameScene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A).reset();
                this.gameScene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S).reset();
                this.gameScene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D).reset();

            });
        }

        eventsCenter.removeListener('yes');
        // the player is saying yes, they want the bot (this spawns the bot)
        eventsCenter.on('yes', () => {
            this.uiScene.interactionState = 'botscientistresponse';
            // eventsCenter.removeListener('no');
            eventsCenter.removeListener('yes');
            // eventsCenter.removeListener('space');
            this.uiScene.leftSideDialogText.setText('Bot Scientist:\nGood friend, the Red Bot hath joined your party. Art thou inclined to give it a name, or doth thou prefer to leave it nameless?');

            // spawn the bot here!! rename him after the fact
            const botSprite = this.gameScene.add.sprite(0, 0, 'redbot');
            botSprite.setDepth(1);
            const redBot = new Bot(
                botSprite,
                0,
                'Soldier',
                'Red Bot'
            );

            // set all the player2 ui elements to visible with red bot's stats

            this.uiScene.player2hpText.setText(`HP: ${redBot.stats.currentHP ?? '0'} / ${redBot.stats.maxHP ?? '0'}`);

            let currentMP;
            let maxMP;

            if (this.gameScene.bots[0]?.type === 'Soldier') {
                currentMP = 0;
                maxMP = 0;
            }
            else {
                currentMP = this.gameScene.bots[0]?.stats.currentMP ?? 0;
                maxMP = this.gameScene.bots[0]?.stats.maxMP ?? 0;
            }

            this.uiScene.player2ManaText.setText(`MP: ${currentMP} / ${maxMP}`);


            this.uiScene.player2Button.setVisible(true);
            this.uiScene.player2hpText.setVisible(true);
            this.uiScene.player2HeartIcon.setVisible(true);
            this.uiScene.player2ManaText.setVisible(true);
            this.uiScene.player2ManaIcon.setVisible(true);

            this.gameScene.bots.push(
                redBot
            );

            this.gameScene.setupBotGridPhysics();

            this.uiScene.characterDetailDisplayFrame.setX(335);
            this.uiScene.characterDetailDisplayFrame.setY(275);
            this.uiScene.characterDetailDisplayFrame.setVisible(true);
            this.uiScene.characterDetailDisplay.setTexture('redbot');
            this.uiScene.characterDetailDisplay.setX(335);
            this.uiScene.characterDetailDisplay.setY(275);
            this.uiScene.characterDetailDisplay.setVisible(true);

            // set up the no listener to hear if the player does not want to give the bot a custom name
            eventsCenter.removeListener('no');
            eventsCenter.on('no', () => {
                eventsCenter.removeListener('no');
                eventsCenter.removeListener('yes');
                eventsCenter.removeListener('space');
            });

            // the player is saying that they want to give their bot a custom name
            eventsCenter.removeListener('yes');
            eventsCenter.on('yes', () => {
                eventsCenter.removeListener('no');
                eventsCenter.removeListener('yes');
                eventsCenter.removeListener('space');
                this.uiScene.leftSideDialogFrame.setVisible(false);
                this.uiScene.leftSideDialogText.setVisible(false);
                this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
                this.uiScene.yesButton.setVisible(false);
                this.uiScene.yesButton.buttonText.setVisible(false);
                this.uiScene.noButton.setVisible(false);
                this.uiScene.noButton.buttonText.setVisible(false);

                this.uiScene.characterDetailDisplayFrame.setX(335);
                this.uiScene.characterDetailDisplayFrame.setY(175);
                this.uiScene.characterDetailDisplay.setX(335);
                this.uiScene.characterDetailDisplay.setY(175);

                this.sprite.scene.scene.launch('Keyboard');

                eventsCenter.on(
                    'keyboardaccept',
                    (string: string | string[] | undefined) => {
                        eventsCenter.removeListener('keyboardreject');
                        eventsCenter.removeListener('keyboardaccept');
                        this.uiScene.selectCancel();
                        console.log({args: string});
                        if (string instanceof Array) {
                            this.keyboardResponseHandler(string[0]);
                        }
                        else {
                            this.keyboardResponseHandler(string);
                        }
                    }
                );


                eventsCenter.on(
                    'keyboardreject',
                    () => {
                        this.rejectInput();
                    }
                );

                // add listeners for the inventory/ability/charactersheet button being pressed
                //  this should cancel the naming process
                eventsCenter.on(
                    'inventory',
                    () => {
                        console.log('inventory heard by bot scientist!!');
                        this.rejectInput();
                    }
                );

                eventsCenter.on(
                    'ability',
                    () => {
                        this.rejectInput();
                    }
                );

                eventsCenter.on(
                    'charactersheet',
                    () => {
                        this.rejectInput();
                    }
                );
            });
        });
    }

    private rejectInput() {
        eventsCenter.removeListener('keyboardreject');
        eventsCenter.removeListener('keyboardaccept');
        this.uiScene.selectCancel();
    }

    private keyboardResponseHandler(string?: string | undefined) {
        eventsCenter.removeListener('keyboardreject');
        eventsCenter.removeListener('keyboardaccept');
        eventsCenter.removeListener('yes');
        eventsCenter.removeListener('no');
        console.log('putting the bot in the gamescene array');
        if (string === undefined || string === '') {
            string = 'Red Bot';
        }
        console.log(`selected name is ${string}`);
        // TODO: rename the robot if needed
        this.gameScene.bots[0].name = string;
    }
}