import GameScene from '../scenes/GameScene';

export default class Player {
    constructor(
        private sprite: Phaser.GameObjects.Sprite,
        private tilePos: Phaser.Math.Vector2
    ) {
        const offsetX = GameScene.TILE_SIZE / 2;
        const offsetY = GameScene.TILE_SIZE;

        this.sprite.setOrigin(0.5, 1);
        this.sprite.setPosition(
            tilePos.x * GameScene.TILE_SIZE + offsetX,
            tilePos.y * GameScene.TILE_SIZE + offsetY
        );
        this.sprite.setFrame(4);
    }
}