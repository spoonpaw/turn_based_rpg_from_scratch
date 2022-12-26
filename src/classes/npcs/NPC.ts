import GameScene from '../../scenes/GameScene';
import {Direction} from '../../types/Direction';

export default class NPC {
    protected gameScene: GameScene;

    constructor(
        public sprite: Phaser.GameObjects.Sprite,
        protected tilePos: Phaser.Math.Vector2,
        // public dialogCallback?: () => void
    ) {
        this.gameScene = <GameScene>this.sprite.scene.scene.get('Game');
        const offsetX = GameScene.TILE_SIZE / 2;
        const offsetY = GameScene.TILE_SIZE;

        this.sprite.setOrigin(0.5, 1);
        this.sprite.setPosition(
            tilePos.x * GameScene.TILE_SIZE + offsetX,
            tilePos.y * GameScene.TILE_SIZE + offsetY
        );
        this.sprite.setFrame(0);
    }

    getPosition(): Phaser.Math.Vector2 {
        return this.sprite.getBottomCenter();
    }

    getTilePos(): Phaser.Math.Vector2 {
        return this.tilePos.clone();
    }

    setPosition(position: Phaser.Math.Vector2): void {
        this.sprite.setPosition(position.x, position.y);
    }

    setTilePos(tilePosition: Phaser.Math.Vector2): void {
        this.tilePos = tilePosition.clone();
    }

    public startAnimation(direction: Direction) {
        this.sprite.anims.play(direction);
    }

    public stopAnimation(direction: Direction) {
        const animationManager = this.sprite.anims?.animationManager;
        if (!animationManager) return;
        const standingFrame = animationManager.get(direction).frames[1].frame.name;
        this.sprite.anims.stop();
        this.sprite.setFrame(standingFrame);
    }



    public testForInteractionReadyState() {

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
            return true;
        }
        return false;
    }

}