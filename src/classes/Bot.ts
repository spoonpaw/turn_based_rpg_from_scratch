import Soldier from '../jobs/Soldier';
import GameScene from '../scenes/GameScene';
import UIScene from '../scenes/UIScene';
import Stats from '../stats/Stats';
import {Direction} from '../types/Direction';
import Vector2 = Phaser.Math.Vector2;

export default class Bot {
    public tilePos!: Phaser.Math.Vector2;
    private lastMovementIntent = Direction.NONE;
    public movementDirection: Direction = Direction.NONE;

    public movementDirectionVectors: {
        [key in Direction]: Vector2;
    } = {
            'none': Vector2.ZERO,
            'up': Vector2.UP,
            'down': Vector2.DOWN,
            'left': Vector2.LEFT,
            'right': Vector2.RIGHT,
        };
    private tileSizePixelsWalked = 0;
    public stats: Stats;
    private uiScene: UIScene;
    private gameScene: GameScene;
    private speedPixelsPerSecond: number = GameScene.TILE_SIZE * 4;
    public lastTilePos!: Phaser.Math.Vector2;

    constructor(
        public sprite: Phaser.GameObjects.Sprite,
        // private tilePos: Phaser.Math.Vector2,
        public experience: number,
        public type: string,
        public name: string,
        stats?: Stats
    ) {

        this.gameScene = <GameScene>this.sprite.scene.scene.get('Game');
        this.uiScene = <UIScene>this.sprite.scene.scene.get('UI');

        const offsetX = GameScene.TILE_SIZE / 2;
        const offsetY = GameScene.TILE_SIZE;

        this.sprite.setOrigin(0.5, 1);
        const startingPositionX = this.gameScene.player.tilePos.x;
        const startingPositionY = this.gameScene.player.tilePos.y;
        this.sprite.setPosition(
            startingPositionX * GameScene.TILE_SIZE + offsetX,
            startingPositionY * GameScene.TILE_SIZE + offsetY
        );
        this.sprite.setFrame(1);
        this.stats = stats ?? this.createStatsForNewBot(this.type);

        // Initialize this.tilePos here
        this.tilePos = new Vector2(startingPositionX, startingPositionY);
    }

    private createStatsForNewBot(type: string) {
        if (type === 'Soldier') {
            return new Stats(
                Soldier.advancement[0].strength,
                Soldier.advancement[0].agility,
                Soldier.advancement[0].vitality,
                Soldier.advancement[0].intellect,
                Soldier.advancement[0].luck,
                Soldier.advancement[0].vitality * 2,
                Soldier.advancement[0].vitality * 2,
                Soldier.advancement[0].intellect * 2,
                Soldier.advancement[0].intellect * 2,
                Soldier.advancement[0].strength,
                Soldier.advancement[0].agility / 2
            );

        }
        else {
            return new Stats(
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
            );
        }
    }

    public setPosition(position: Phaser.Math.Vector2) {
        this.sprite.setPosition(position.x, position.y);
        // this.tilePos.x = Math.floor(position.x / GameScene.TILE_SIZE);
        // this.tilePos.y = Math.floor(position.y / GameScene.TILE_SIZE);
    }

    public getPosition(): Phaser.Math.Vector2 {
        return this.sprite.getBottomCenter();
    }

    public setTilePos(tilePosition: Phaser.Math.Vector2): void {
        this.tilePos = tilePosition.clone();
    }

    private updateBotTilePos(): void {
        this.setTilePos(
            this
                .getTilePos()
                .add(this.movementDirectionVectors[this.movementDirection] ?? new Vector2())
        );
    }

    public stopAnimation(direction: Direction) {
        if (!this.sprite.anims) return;
        const animationManager = this.sprite.anims.animationManager;
        const standingFrame = animationManager.get(direction).frames[1].frame.name;
        this.sprite.anims.stop();
        this.sprite.setFrame(standingFrame);
    }

    private stopMoving(): void {
        this.stopAnimation(this.movementDirection);
        this.movementDirection = Direction.NONE;
    }

    private willCrossTileBorderThisUpdate(
        pixelsToWalkThisUpdate: number
    ): boolean {
        return (
            this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= GameScene.TILE_SIZE
        );
    }

    private updateBotPosition(delta: number) {
        const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);
        if (!this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
            this.moveBotSprite(pixelsToWalkThisUpdate);
        }
        else if (this.shouldContinueMoving()) {
            this.moveBotSprite(pixelsToWalkThisUpdate);
            this.updateBotTilePos();
        }
        else {
            this.moveBotSprite(GameScene.TILE_SIZE - this.tileSizePixelsWalked);
            this.stopMoving();
        }
    }

    private hasNoTile(pos: Vector2): boolean {
        return !this.gameScene.gridPhysics.tileMap.layers.some((layer) =>
            this.gameScene.gridPhysics.tileMap.hasTileAt(pos.x, pos.y, layer.name)
        );
    }

    private hasBlockingTile(pos: Vector2): boolean {
        if (this.hasNoTile(pos)) return true;
        return this.gameScene.gridPhysics.tileMap.layers.some((layer) => {
            const tile = this.gameScene.gridPhysics.tileMap.getTileAt(pos.x, pos.y, false, layer.name);
            return tile && tile.properties.collides;
        });
    }

    private tilePosInDirection(direction: Direction): Vector2 {
        return this
            .getTilePos()
            .add(this.movementDirectionVectors[direction] ?? new Vector2());
    }

    private isBlockingDirection(direction: Direction): boolean {
        return this.hasBlockingTile(this.tilePosInDirection(direction));
    }

    private shouldContinueMoving(): boolean {
        return (
            this.movementDirection == this.lastMovementIntent &&
            !this.isBlockingDirection(this.lastMovementIntent)
        );
    }

    private startMoving(direction: Direction): void {
        this.startAnimation(direction);
        this.movementDirection = direction;
        this.updateBotTilePos();
    }

    public startAnimation(direction: Direction) {
        this.sprite.anims.play(direction);
    }

    public getTilePos(): Phaser.Math.Vector2 {
        return this.tilePos.clone();
    }

    private getPixelsToWalkThisUpdate(delta: number): number {
        const deltaInSeconds = delta / 1000;
        return this.speedPixelsPerSecond * deltaInSeconds;
    }


    public moveBotSprite(pixelsToMove: number) {
        const directionVec = this.movementDirectionVectors[
            this.movementDirection
        ]?.clone();
        const movementDistance = directionVec?.multiply(
            new Vector2(pixelsToMove)
        );
        const newBotPos = this.getPosition().add(movementDistance ?? new Vector2());
        this.setPosition(newBotPos);
        this.tileSizePixelsWalked += pixelsToMove;
        this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
    }

    private isMoving(): boolean {
        return this.movementDirection != Direction.NONE;
    }

    update(delta: number): void {
        if (this.isMoving()) {
            this.updateBotPosition(delta);
        }
        this.lastMovementIntent = Direction.NONE;
    }
}