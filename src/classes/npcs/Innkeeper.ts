import GameScene from '../../scenes/GameScene';
import SaveAndLoadScene from '../../scenes/SaveAndLoadScene';
import UIScene from '../../scenes/UIScene';
import eventsCenter from '../../utils/EventsCenter';
import {IPlayer} from '../GameDatabase';
import NPC from './NPC';

export default class Innkeeper extends NPC {
    protected gameScene: GameScene;
    private uiScene: UIScene;
    private saveAndLoadScene: SaveAndLoadScene;

    constructor(
        public sprite: Phaser.GameObjects.Sprite,
        protected tilePos: Phaser.Math.Vector2
    ) {
        super(sprite, tilePos);
        this.gameScene = <GameScene>this.sprite.scene;
        this.uiScene = <UIScene>this.sprite.scene.scene.get('UI');
        this.saveAndLoadScene = <SaveAndLoadScene>this.sprite.scene.scene.get('SaveAndLoad');
    }

    public runDialog() {
        {
            //innkeeper just got talked to
            // set the ui scene interaction state as innkeeper select
            this.uiScene.interactionState = 'innkeeperselect';
            this.gameScene.gamePadScene?.scene.stop();

            this.gameScene.input.keyboard!.enabled = false;
            // get rid of active dialog scene, it isn't needed anymore
            // this.gameScene.activeDialogScene = true;
            if (this.gameScene.gridPhysics.facingDirection === 'right') this.sprite.setFrame(1);
            if (this.gameScene.gridPhysics.facingDirection === 'up') this.sprite.setFrame(0);
            if (this.gameScene.gridPhysics.facingDirection === 'left') this.sprite.setFrame(2);

            this.uiScene.updateGold();
            this.uiScene.goldFrame.setVisible(true);
            this.uiScene.coinIcon.setVisible(true);
            this.uiScene.coinText.setVisible(true);
            this.uiScene.leftSideDialogFrame.setVisible(true);
            this.uiScene.leftSideDialogText.setText('Innkeeper:\nGood day! It costs three gold to rest hither. Dost thou wish to stay?');
            this.uiScene.leftSideDialogText.setVisible(true);
            this.uiScene.rightSideDialogOptionsFrame.setVisible(true);
            this.uiScene.yesButton.showActionButton();
            this.uiScene.noButton.showActionButton();

            this.uiScene.interactFrame.setVisible(false);
            this.uiScene.interactButton.hideActionButton();

            eventsCenter.removeListener('space');

            eventsCenter.on('space', () => {
                this.gameScene.gamePadScene?.scene.restart();
                this.uiScene.interactionState = 'mainselect';
                eventsCenter.removeListener('space');
                // eventsCenter.removeListener('no');

                this.uiScene.goldFrame.setVisible(false);
                this.uiScene.coinIcon.setVisible(false);
                this.uiScene.coinText.setVisible(false);
                this.uiScene.leftSideDialogFrame.setVisible(false);
                this.uiScene.leftSideDialogText.setText('');
                this.uiScene.leftSideDialogText.setVisible(false);
                this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
                this.uiScene.yesButton.hideActionButton();
                this.uiScene.noButton.hideActionButton();

                this.uiScene.cancelMenuFrame.setVisible(false);
                this.uiScene.cancelButton.hideActionButton();

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
                this.uiScene.interactionState = 'innkeeperresponse';
                // eventsCenter.removeListener('no');
                eventsCenter.removeListener('yes');
                this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
                this.uiScene.yesButton.hideActionButton();
                this.uiScene.noButton.hideActionButton();

                this.uiScene.updateAndShowCancelButton(670, 380, 'Farewell', true);

                // if the player doesn't have enough gold, tell him so
                //  otherwise heal him!

                if (this.gameScene.player.gold < 3) {
                    this.uiScene.leftSideDialogText.setText('Innkeeper:\nYou haven\'t enough coin!');
                }
                else {
                    this.uiScene.leftSideDialogText.setText('Innkeeper:\nThank thee! Thou appeareth well rested.');
                    const newGoldAmount = this.gameScene.player.gold - 3;

                    this.saveAndLoadScene.db.players.update(
                        0, {
                            gold: newGoldAmount
                        }
                    );
                    this.gameScene.player.gold = newGoldAmount;
                    this.uiScene.coinText.setText(`${this.gameScene.player.gold} gp`);
                    const newHP = this.gameScene.player.maxHP;
                    this.saveAndLoadScene.db.players.update(
                        0,
                        (player: IPlayer) => {
                            player.currentHP = newHP;
                            return player;
                        }
                    );
                    this.gameScene.player.currentHP = newHP;
                    if (this.gameScene.bots.length > 0) {
                        const newHP = this.gameScene.bots[0].maxHP;
                        this.saveAndLoadScene.db.players.update(
                            0,
                            (player: IPlayer) => {
                                player.bots[0].currentHP = newHP;
                                return player;
                            }
                        );

                        this.gameScene.bots[0].currentHP = newHP;
                        this.uiScene.updatePlayer2HP(
                            this.gameScene.bots[0].currentHP,
                            this.gameScene.bots[0].maxHP
                        );
                    }
                    this.uiScene.updateHP(this.gameScene.player.currentHP, this.gameScene.player.maxHP);
                    this.uiScene.updateResource(this.gameScene.player.currentResource, this.gameScene.player.maxResource);
                }
            });

        }
    }

    public listenForInteractEvent() {
        // innkeeper heard player press the space bar somewhere!
        // check if player is facing innkeeper
        if (this.testForInteractionReadyState()) {
            this.runDialog();
        }
    }
}