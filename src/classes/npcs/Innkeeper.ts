import GameScene from '../../scenes/GameScene';
import UIScene from '../../scenes/UIScene';
import eventsCenter from '../../utils/EventsCenter';
import NPC from './NPC';

export default class Innkeeper extends NPC {
    private gameScene: GameScene;
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
        console.log('innkeeper heard player press the space bar somewhere!');
        // check if player is facing innkeeper
        if (
            (
                this.gameScene.player.getTilePos().x === this.tilePos.x - 1 &&
                this.gameScene.player.getTilePos().y === this.tilePos.y &&
                this.gameScene.gridPhysics.facingDirection === 'right'
            ) ||
            (
                this.gameScene.player.getTilePos().x === this.tilePos.x &&
                this.gameScene.player.getTilePos().y === this.tilePos.y + 1 &&
                this.gameScene.gridPhysics.facingDirection === 'up'
            ) ||
            (
                this.gameScene.player.getTilePos().x === this.tilePos.x + 1 &&
                this.gameScene.player.getTilePos().y === this.tilePos.y &&
                this.gameScene.gridPhysics.facingDirection === 'left'
            )

        ) {
            console.log('innkeeper just got talked to');
            // set the ui scene interaction state as innkeeper select
            this.uiScene.interactionState = 'innkeeperselect';
            this.gameScene.scene.sleep('GamePad');

            this.gameScene.input.keyboard.enabled = false;
            // get rid of active dialog scene, it isn't needed anymore
            // this.gameScene.activeDialogScene = true;
            if (this.gameScene.gridPhysics.facingDirection === 'right') this.sprite.setFrame(1);
            if (this.gameScene.gridPhysics.facingDirection === 'up') this.sprite.setFrame(0);

            this.uiScene.updateGold();
            this.uiScene.goldFrame.setVisible(true);
            this.uiScene.goldIcon.setVisible(true);
            this.uiScene.goldText.setVisible(true);
            this.uiScene.leftSideDialogFrame.setVisible(true);
            this.uiScene.leftSideDialogText.setText('Innkeeper:\nGood day! It costs three gold to rest hither. Dost thou wish to stay?');
            this.uiScene.leftSideDialogText.setVisible(true);
            this.uiScene.rightSideDialogOptionsFrame.setVisible(true);
            this.uiScene.yesButton.setVisible(true);
            this.uiScene.yesButton.buttonText.setVisible(true);
            this.uiScene.noButton.setVisible(true);
            this.uiScene.noButton.buttonText.setVisible(true);

            eventsCenter.removeListener('space');
            eventsCenter.on('space', () => {
                this.uiScene.interactionState = 'mainselect';
                eventsCenter.removeListener('space');
                eventsCenter.removeListener('no');
                console.log('close the talk scene');


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

                this.gameScene.input.keyboard.enabled = true;

                this.gameScene.cursors.up.reset();
                this.gameScene.cursors.left.reset();
                this.gameScene.cursors.down.reset();
                this.gameScene.cursors.right.reset();
                this.gameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).reset();
                this.gameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).reset();
                this.gameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).reset();
                this.gameScene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).reset();

                // this.gameScene.input.keyboard.resetKeys();
            });

            // eventsCenter.removeListener('no');
            // eventsCenter.on('no', () => {
            //     this.uiScene.interactionState = 'mainselect';
            //     eventsCenter.removeListener('space');
            //     eventsCenter.removeListener('no');
            //     console.log('close the talk scene');
            //
            //     this.uiScene.leftSideDialogFrame.setVisible(false);
            //     this.uiScene.leftSideDialogText.setText('');
            //     this.uiScene.leftSideDialogText.setVisible(false);
            //     this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
            //     this.uiScene.yesButton.setVisible(false);
            //     this.uiScene.yesButton.buttonText.setVisible(false);
            //     this.uiScene.noButton.setVisible(false);
            //     this.uiScene.noButton.buttonText.setVisible(false);
            //
            //     this.gameScene.input.keyboard.enabled = true;
            //     // this.gameScene.input.keyboard.resetKeys();
            // });

            eventsCenter.removeListener('yes');
            eventsCenter.on('yes', () => {
                this.uiScene.interactionState = 'innkeeperresponse';
                // eventsCenter.removeListener('space');
                eventsCenter.removeListener('no');
                eventsCenter.removeListener('yes');
                this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
                this.uiScene.yesButton.setVisible(false);
                this.uiScene.yesButton.buttonText.setVisible(false);
                this.uiScene.noButton.setVisible(false);
                this.uiScene.noButton.buttonText.setVisible(false);

                // if the player doesn't have enough gold, tell him so
                //  otherwise heal him!

                if (this.gameScene.player.gold < 3) {
                    this.uiScene.leftSideDialogText.setText('Innkeeper:\nYou haven\'t enough coin!');
                }
                else {
                    console.log('heal the player, take his gold, show the final dialog');
                    this.uiScene.leftSideDialogText.setText('Innkeeper:\nThank thee! Thou appeareth well rested.');
                    this.gameScene.player.gold -= 3;
                    this.gameScene.player.stats.currentHP = this.gameScene.player.stats.maxHP;
                    this.uiScene.updateHP(this.gameScene.player.stats.currentHP, this.gameScene.player.stats.maxHP);
                    // this.uiScene.updateGold(this.gameScene.player.gold);
                    this.uiScene.updateMP(this.gameScene.player.stats.currentMP, this.gameScene.player.stats.maxMP);
                }
            });
        }
    }
}