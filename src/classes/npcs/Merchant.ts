import {ItemInterface} from '../../items/items';
import GameScene from '../../scenes/GameScene';
import UIScene from '../../scenes/UIScene';
import eventsCenter from '../../utils/EventsCenter';
import NPC from './NPC';

export default class Merchant extends NPC {
    private gameScene: GameScene;
    private uiScene: UIScene;

    constructor(
        public sprite: Phaser.GameObjects.Sprite,
        protected tilePos: Phaser.Math.Vector2,
        public inventory: ItemInterface[]
    ) {
        super(sprite, tilePos);
        this.gameScene = <GameScene>this.sprite.scene;
        this.uiScene = <UIScene>this.gameScene.scene.get('UI');
    }

    public listenForInteractEvent() {
        // if (Phaser.Input.Keyboard.JustDown(this.gameScene.cursors.space)) {
        console.log('merchant just heard the space bar somewhere!');
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
            console.log('merchant is getting talked to');
            this.uiScene.interactionState = 'merchantbuy';
            this.uiScene.currentNPC = this;
            // this.gameScene.input.keyboard.resetKeys();
            this.gameScene.input.keyboard.enabled = false;
            // this.gameScene.activeDialogScene = true;
            if (this.gameScene.gridPhysics.facingDirection === 'right') this.sprite.setFrame(1);
            if (this.gameScene.gridPhysics.facingDirection === 'up') this.sprite.setFrame(0);
            if (this.gameScene.gridPhysics.facingDirection === 'left') this.sprite.setFrame(2);

            // TODO: implement the item purchase functionality
            this.uiScene.inventoryAndAbilityMenuFrame.setVisible(true);
            this.uiScene.updateGold();
            this.uiScene.goldFrame.setVisible(true);
            this.uiScene.goldIcon.setVisible(true);
            this.uiScene.goldText.setVisible(true);
            this.uiScene.subInventoryAndAbilityMenuFrame.setVisible(true);
            this.uiScene.subInventoryBagButton.select();
            this.uiScene.subInventoryBagButton.setVisible(true);
            this.uiScene.subInventoryBagButton.buttonText.setText('Buy');
            this.uiScene.subInventoryBagButton.buttonText.setVisible(true);

            this.uiScene.cancelButton.setX(347);
            this.uiScene.cancelButton.setY(350);

            this.uiScene.cancelButton.buttonText.setY(325);
            this.uiScene.cancelButton.buttonText.setX(367);

            this.uiScene.cancelMenuFrame.setX(315);
            this.uiScene.cancelMenuFrame.setY(315);

            this.uiScene.cancelMenuFrame.setVisible(true);
            this.uiScene.cancelButton.setVisible(true);
            this.uiScene.cancelButton.buttonText.setVisible(true);

            this.uiScene.destroyMerchantInventoryButtons();
            this.uiScene.generateMerchantInventoryButtons(this.inventory);

            eventsCenter.removeListener('space');
            eventsCenter.on('space', () => {
                this.uiScene.interactionState = 'mainselect';
                eventsCenter.removeListener('space');
                eventsCenter.removeListener('no');
                console.log('close the merchant select scene');

                this.uiScene.leftSideDialogFrame.setVisible(false);
                this.uiScene.leftSideDialogText.setText('');
                this.uiScene.leftSideDialogText.setVisible(false);
                this.uiScene.inventoryAndAbilityMenuFrame.setVisible(false);
                this.uiScene.goldFrame.setVisible(false);
                this.uiScene.goldIcon.setVisible(false);
                this.uiScene.goldText.setVisible(false);
                this.uiScene.subInventoryAndAbilityMenuFrame.setVisible(false);
                this.uiScene.subInventoryBagButton.setVisible(false);
                this.uiScene.subInventoryBagButton.buttonText.setVisible(false);
                this.uiScene.cancelMenuFrame.setVisible(false);
                this.uiScene.cancelButton.setVisible(false);
                this.uiScene.cancelButton.buttonText.setVisible(false);
                this.uiScene.inventoryAndAbilityDetailFrame.setVisible(false);
                this.uiScene.inventoryAndAbilityDetailText.setVisible(false);
                this.uiScene.purchaseButton.setVisible(false);
                this.uiScene.purchaseButton.buttonText.setVisible(false);

                for (const merchantButton of this.uiScene.merchantInventoryButtons) {
                    merchantButton.setVisible(false);
                    merchantButton.buttonText.setVisible(false);
                }

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

        }
        else {
            // console.log('merchant is not getting talked to');
            return;
        }
        // }
    }
}