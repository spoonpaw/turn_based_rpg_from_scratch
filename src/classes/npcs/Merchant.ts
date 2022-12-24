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
        // if (Phaser.Input.Keyboard.JustDown(this.gameScene.cursors.space)) {
        // merchant just heard the space bar somewhere!
        if (this.testForInteractionReadyState()) {
            this.runDialog();
        }
        else {
            // merchant is not getting talked to
            return;
        }
        // }
    }

    public runDialog() {
        // merchant is getting talked to
        this.uiScene.interactionState = 'merchantbuy';
        this.gameScene.gamePadScene?.scene.stop();
        this.uiScene.currentNPC = this;
        // this.gameScene.input.keyboard.resetKeys();
        this.gameScene.input.keyboard!.enabled = false;
        // this.gameScene.activeDialogScene = true;
        if (this.gameScene.gridPhysics.facingDirection === 'right') this.sprite.setFrame(1);
        if (this.gameScene.gridPhysics.facingDirection === 'up') this.sprite.setFrame(0);
        if (this.gameScene.gridPhysics.facingDirection === 'left') this.sprite.setFrame(2);

        // item purchase functionality
        this.uiScene.inventoryAndAbilityMenuFrame.setVisible(true);
        this.uiScene.updateGold();
        this.uiScene.goldFrame.setVisible(true);
        this.uiScene.goldIcon.setVisible(true);
        this.uiScene.goldText.setVisible(true);
        this.uiScene.subInventoryAndAbilityMenuFrame.setVisible(true);


        // TODO: fix this section. use a special 'buy button' completely separate from the sub inventory bag button
        this.uiScene.buyButton.select();
        this.uiScene.buyButton.setVisible(true);
        this.uiScene.buyButton.buttonText.setText('Buy');
        this.uiScene.buyButton.buttonText.setVisible(true);

        this.uiScene.sellButton.deselect();
        this.uiScene.sellButton.setVisible(true);
        this.uiScene.sellButton.buttonText.setVisible(true);

        this.uiScene.cancelButton.setX(347);
        this.uiScene.cancelButton.setY(350);

        this.uiScene.cancelButton.buttonText.setY(325);
        this.uiScene.cancelButton.buttonText.setX(367);

        this.uiScene.cancelMenuFrame.setX(315);
        this.uiScene.cancelMenuFrame.setY(315);

        this.uiScene.cancelMenuFrame.setVisible(true);
        this.uiScene.cancelButton.setVisible(true);
        this.uiScene.cancelButton.buttonText.setText('Cancel');
        this.uiScene.cancelButton.buttonText.setVisible(true);

        this.uiScene.destroyMerchantInventoryButtons();
        this.uiScene.generateMerchantInventoryButtons(this.inventory);

        eventsCenter.removeListener('space');
        eventsCenter.on('space', () => {
            this.uiScene.interactionState = 'mainselect';
            eventsCenter.removeListener('space');
            eventsCenter.removeListener('no');
            // close the merchant select scene

            this.gameScene.gamePadScene?.scene.restart();

            this.uiScene.leftSideDialogFrame.setVisible(false);
            this.uiScene.leftSideDialogText.setText('');
            this.uiScene.leftSideDialogText.setVisible(false);
            this.uiScene.inventoryAndAbilityMenuFrame.setVisible(false);
            this.uiScene.goldFrame.setVisible(false);
            this.uiScene.goldIcon.setVisible(false);
            this.uiScene.goldText.setVisible(false);
            this.uiScene.subInventoryAndAbilityMenuFrame.setVisible(false);
            this.uiScene.buyButton.setVisible(false);
            this.uiScene.buyButton.buttonText.setVisible(false);
            this.uiScene.sellButton.setVisible(false);
            this.uiScene.sellButton.buttonText.setVisible(false);
            this.uiScene.cancelMenuFrame.setVisible(false);
            this.uiScene.cancelButton.setVisible(false);
            this.uiScene.cancelButton.buttonText.setVisible(false);
            this.uiScene.inventoryAndAbilityDetailFrame.setVisible(false);
            this.uiScene.inventoryAndAbilityDetailText.setVisible(false);
            this.uiScene.purchaseItemButton.setVisible(false);
            this.uiScene.purchaseItemButton.buttonText.setVisible(false);
            this.uiScene.sellButton.setVisible(false);
            this.uiScene.sellButton.buttonText.setVisible(false);

            this.uiScene.cancelMenuFrame.setVisible(false);
            this.uiScene.cancelButton.setVisible(false);
            this.uiScene.cancelButton.buttonText.setVisible(false);

            for (const merchantButton of this.uiScene.merchantInventoryButtons) {
                merchantButton.setVisible(false);
                merchantButton.buttonText.setVisible(false);
            }


            for (const inventoryToSellButton of this.uiScene.inventoryToSellButtons) {
                if (inventoryToSellButton.visible) {
                    inventoryToSellButton.setVisible(false);
                    inventoryToSellButton.buttonText.setVisible(false);
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

            // this.gameScene.input.keyboard.resetKeys();

        });

    }
}