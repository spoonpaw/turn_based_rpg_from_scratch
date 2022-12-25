import GameScene from '../../scenes/GameScene';
import UIScene from '../../scenes/UIScene';
import eventsCenter from '../../utils/EventsCenter';
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

    public runDialog() {
        console.log('you are talking to the bot scientist');
        this.uiScene.interactionState = 'botscientistselect';
        this.gameScene.gamePadScene?.scene.stop();

        this.gameScene.input.keyboard!.enabled = false;
        if (this.gameScene.gridPhysics.facingDirection === 'right') this.sprite.setFrame(1);
        if (this.gameScene.gridPhysics.facingDirection === 'up') this.sprite.setFrame(0);
        if (this.gameScene.gridPhysics.facingDirection === 'left') this.sprite.setFrame(2);

        this.uiScene.updateGold();
        this.uiScene.goldFrame.setVisible(true);
        this.uiScene.goldIcon.setVisible(true);
        this.uiScene.goldText.setVisible(true);
        this.uiScene.leftSideDialogFrame.setVisible(true);
        this.uiScene.leftSideDialogText.setText('Bot Scientist:\nSo, thou expectest me to build a Bot to aid thee in thy battles? Very well, shall I commence construction at once, brave adventurer?');
        this.uiScene.leftSideDialogText.setVisible(true);
        this.uiScene.rightSideDialogOptionsFrame.setVisible(true);
        this.uiScene.yesButton.setVisible(true);
        this.uiScene.yesButton.buttonText.setVisible(true);
        this.uiScene.noButton.setVisible(true);
        this.uiScene.noButton.buttonText.setVisible(true);

        this.uiScene.interactFrame.setVisible(false);
        this.uiScene.interactButton.setVisible(false);
        this.uiScene.interactButton.buttonText.setVisible(false);

        eventsCenter.removeListener('space');
        eventsCenter.on('space', () => {
            this.gameScene.gamePadScene?.scene.restart();
            this.uiScene.interactionState = 'mainselect';
            eventsCenter.removeListener('space');
            // eventsCenter.removeListener('no');

            this.uiScene.goldFrame.setVisible(false);
            this.uiScene.goldIcon.setVisible(false);
            this.uiScene.goldText.setVisible(false);
            this.uiScene.leftSideDialogFrame.setVisible(false);
            this.uiScene.leftSideDialogText.setText('');
            this.uiScene.leftSideDialogText.setVisible(false);
            this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
            this.uiScene.yesButton.setVisible(false);
            this.uiScene.yesButton.buttonText.setVisible(false);
            this.uiScene.noButton.setVisible(false);
            this.uiScene.noButton.buttonText.setVisible(false);

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
        eventsCenter.removeListener('yes');
        eventsCenter.on('yes', () => {
            this.uiScene.interactionState = 'botscientistresponse';
            // eventsCenter.removeListener('no');
            eventsCenter.removeListener('yes');
            this.uiScene.leftSideDialogText.setText('The red Bot has joined your party. Do you wish to give it a name?');
            this.uiScene.characterDetailDisplayFrame.setVisible(true);
            this.uiScene.characterDetailDisplay.setTexture('redbot');
            this.uiScene.characterDetailDisplay.setVisible(true);

            eventsCenter.on('yes', () => {
                this.uiScene.leftSideDialogFrame.setVisible(false);
                this.uiScene.leftSideDialogText.setVisible(false);
                this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
                this.uiScene.yesButton.setVisible(false);
                this.uiScene.yesButton.buttonText.setVisible(false);
                this.uiScene.noButton.setVisible(false);
                this.uiScene.noButton.buttonText.setVisible(false);

                this.sprite.scene.scene.launch('Keyboard');
            });
        });
    }

    public listenForInteractEvent() {
        // innkeeper heard player press the space bar somewhere!
        // check if player is facing innkeeper
        if (this.testForInteractionReadyState()) {
            this.runDialog();
        }
    }
}