import GameScene from '../scenes/GameScene';
import {Direction} from '../types/Direction';
import Player from './Player';

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

export default class GridPhysics {
    public facingDirection = Direction.NONE;
    private lastMovementIntent = Direction.NONE;
    private movementDirection: Direction = Direction.NONE;
    private movementDirectionVectors: {
        [key in Direction]?: Vector2;
    } = {
            [Direction.UP]: Vector2.UP,
            [Direction.DOWN]: Vector2.DOWN,
            [Direction.LEFT]: Vector2.LEFT,
            [Direction.RIGHT]: Vector2.RIGHT,
        };
    private readonly speedPixelsPerSecond: number = GameScene.TILE_SIZE * 4;
    private tileSizePixelsWalked = 0;
    private gameScene!: GameScene;

    public constructor(private player: Player, public tileMap: Phaser.Tilemaps.Tilemap) {
        this.gameScene = <GameScene>this.player.sprite.scene.scene.get('Game');
    }

    public movePlayer(direction: Direction): void {
        this.lastMovementIntent = direction;
        if (this.isMoving()) return;
        if (this.isBlockingDirection(direction)) {
            this.facingDirection = direction;
            this.player.stopAnimation(direction);
        }
        else {
            this.facingDirection = direction;
            if (this.gameScene.bots[0]) {
                this.gameScene.bots[0].lastTilePos = this.player.tilePos.clone();
            }
            this.startMoving(direction);
        }
    }

    update(delta: number): void {
        if (this.isMoving()) {
            this.updatePlayerPosition(delta);
        }
        this.lastMovementIntent = Direction.NONE;
    }

    private getPixelsToWalkThisUpdate(delta: number): number {
        const deltaInSeconds = delta / 1000;
        return this.speedPixelsPerSecond * deltaInSeconds;
    }

    private hasBlockingTile(pos: Vector2): boolean {
        if (this.hasNoTile(pos)) return true;
        return this.tileMap.layers.some((layer) => {
            const tile = this.tileMap.getTileAt(pos.x, pos.y, false, layer.name);
            return tile && tile.properties.collides;
        });
    }

    private hasNoTile(pos: Vector2): boolean {
        return !this.tileMap.layers.some((layer) =>
            this.tileMap.hasTileAt(pos.x, pos.y, layer.name)
        );
    }

    private isBlockingDirection(direction: Direction): boolean {
        return this.hasBlockingTile(this.tilePosInDirection(direction));
    }

    private isMoving(): boolean {
        return this.movementDirection != Direction.NONE;
    }

    private movePlayerSprite(pixelsToMove: number) {
        const directionVec = this.movementDirectionVectors[
            this.movementDirection
        ]?.clone();
        const movementDistance = directionVec?.multiply(
            new Vector2(pixelsToMove)
        );
        const newPlayerPos = this.player.getPosition().add(movementDistance ?? new Vector2());
        this.player.setPosition(newPlayerPos);
        this.tileSizePixelsWalked += pixelsToMove;
        this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
    }

    private shouldContinueMoving(): boolean {
        return (
            this.movementDirection == this.lastMovementIntent &&
            !this.isBlockingDirection(this.lastMovementIntent)
        );
    }

    private startMoving(direction: Direction): void {
        this.player.startAnimation(direction);
        this.movementDirection = direction;
        this.updatePlayerTilePos();
    }

    private stopMoving(): void {
        this.player.stopAnimation(this.movementDirection);
        this.movementDirection = Direction.NONE;
    }

    private tilePosInDirection(direction: Direction): Vector2 {
        return this.player
            .getTilePos()
            .add(this.movementDirectionVectors[direction] ?? new Vector2());
    }

    private updatePlayerPosition(delta: number) {
        const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);
        if (!this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
            this.movePlayerSprite(pixelsToWalkThisUpdate);
        }
        else if (this.shouldContinueMoving()) {
            this.movePlayerSprite(pixelsToWalkThisUpdate);
            this.updatePlayerTilePos();
        }
        else {
            this.movePlayerSprite(GameScene.TILE_SIZE - this.tileSizePixelsWalked);
            this.stopMoving();
        }
    }

    private updatePlayerTilePos(): void {
        this.player.setTilePos(
            this.player
                .getTilePos()
                .add(this.movementDirectionVectors[this.movementDirection] ?? new Vector2())
        );
    }

    private willCrossTileBorderThisUpdate(
        pixelsToWalkThisUpdate: number
    ): boolean {
        return (
            this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= GameScene.TILE_SIZE
        );
    }
}