import {ItemInterface} from '../../items/items';
import GameScene from '../../scenes/GameScene';
import UIScene from '../../scenes/UIScene';
import eventsCenter from '../../utils/EventsCenter';
import NPC from './NPC';

export default class Merchant extends NPC {
    protected gameScene: GameScene;
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
        // merchant just heard the space bar somewhere!
        if (this.testForInteractionReadyState()) {
            this.runDialog();
        }
        else {
            // merchant is not getting talked to
            return;
        }
    }

    public runDialog() {
        // merchant is getting talked to
        this.uiScene.interactionState = 'merchantbuy';
        this.gameScene.gamePadScene?.scene.stop();
        this.uiScene.currentNPC = this;
        this.gameScene.input.keyboard!.enabled = false;
        if (this.gameScene.gridPhysics.facingDirection === 'right') this.sprite.setFrame(1);
        if (this.gameScene.gridPhysics.facingDirection === 'up') this.sprite.setFrame(0);
        if (this.gameScene.gridPhysics.facingDirection === 'left') this.sprite.setFrame(2);

        // item purchase functionality
        this.uiScene.inventoryAndAbilityMenuFrame.setVisible(true);
        this.uiScene.updateGold();
        this.uiScene.goldFrame.setVisible(true);
        this.uiScene.coinIcon.setVisible(true);
        this.uiScene.coinText.setVisible(true);
        this.uiScene.subInventoryAndAbilityMenuFrame.setVisible(true);

        this.uiScene.buyButton.select();
        this.uiScene.buyButton.changeButtonText('Buy');
        this.uiScene.buyButton.showActionButton();

        this.uiScene.sellButton.deselect();
        this.uiScene.sellButton.showActionButton();

        this.uiScene.updateAndShowCancelButton(315, 315, 'Cancel', true);

        this.uiScene.destroyMerchantInventoryButtons();
        this.uiScene.generateMerchantInventoryButtons(this.inventory);

        eventsCenter.removeListener('space');
        eventsCenter.on('space', () => {
            this.uiScene.interactionState = 'mainselect';
            eventsCenter.removeListener('space');
            // close the merchant select scene

            this.gameScene.gamePadScene?.scene.restart();

            this.uiScene.leftSideDialogFrame.setVisible(false);
            this.uiScene.leftSideDialogText.setText('');
            this.uiScene.leftSideDialogText.setVisible(false);
            this.uiScene.inventoryAndAbilityMenuFrame.setVisible(false);
            this.uiScene.goldFrame.setVisible(false);
            this.uiScene.coinIcon.setVisible(false);
            this.uiScene.coinText.setVisible(false);
            this.uiScene.subInventoryAndAbilityMenuFrame.setVisible(false);
            this.uiScene.buyButton.hideActionButton();
            this.uiScene.sellButton.hideActionButton();
            this.uiScene.cancelMenuFrame.setVisible(false);
            this.uiScene.cancelButton.hideActionButton();
            this.uiScene.inventoryAndAbilityDetailFrame.setVisible(false);
            this.uiScene.inventoryAndAbilityDetailText.setVisible(false);
            this.uiScene.purchaseItemButton.hideActionButton();
            this.uiScene.sellItemButton.hideActionButton();

            this.uiScene.cancelMenuFrame.setVisible(false);
            this.uiScene.cancelButton.hideActionButton();

            for (const merchantButton of this.uiScene.merchantInventoryButtons) {
                merchantButton.hideActionButton();
            }

            for (const inventoryToSellButton of this.uiScene.inventoryToSellButtons) {
                if (inventoryToSellButton.visible) {
                    inventoryToSellButton.hideActionButton();
                    inventoryToSellButton.deselect();
                }
            }

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
}