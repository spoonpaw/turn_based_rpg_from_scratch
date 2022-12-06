import GameScene from '../../scenes/GameScene';
import UIScene from '../../scenes/UIScene';
import NPC from './NPC';

export default class Merchant extends NPC {
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
        // if (Phaser.Input.Keyboard.JustDown(this.gameScene.cursors.space)) {
        console.log('merchant just heard the space');
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
            this.gameScene.input.keyboard.enabled = false;
            this.gameScene.activeDialogScene = true;
            if (this.gameScene.gridPhysics.facingDirection === 'right') this.sprite.setFrame(1);
            if (this.gameScene.gridPhysics.facingDirection === 'up') this.sprite.setFrame(0);
            if (this.gameScene.gridPhysics.facingDirection === 'left') this.sprite.setFrame(2);

            // TODO: implement the item purchase functionality
            this.uiScene.inventoryAndAbilityMenuFrame.setVisible(true);
            // TODO: display the items for purchase


        }
        else {
            // console.log('merchant is not getting talked to');
            return;
        }
        // }
    }
}