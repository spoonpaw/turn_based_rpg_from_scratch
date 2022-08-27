import {Direction} from '../types/Direction';
import Player from './Player';
import GameScene from '../scenes/GameScene';

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

export default class GridPhysics {
    private lastMovementIntent = Direction.NONE;
    private tileSizePixelsWalked = 0;
    private movementDirectionVectors: {
        [key in Direction]?: Vector2;
    } = {
            [Direction.UP]: Vector2.UP,
            [Direction.DOWN]: Vector2.DOWN,
            [Direction.LEFT]: Vector2.LEFT,
            [Direction.RIGHT]: Vector2.RIGHT,
        };
    private readonly speedPixelsPerSecond: number = GameScene.TILE_SIZE * 4;
    private movementDirection: Direction = Direction.NONE;

    constructor(private player: Player, private tileMap: Phaser.Tilemaps.Tilemap) {
    }

    movePlayer(direction: Direction): void {
        this.lastMovementIntent = direction;
        if (this.isMoving()) return;
        if (this.isBlockingDirection(direction)) {
            this.player.stopAnimation(direction);
        }
        else {
            this.startMoving(direction);
        }
    }

    update(delta: number): void {
        if (this.isMoving()) {
            this.updatePlayerPosition(delta);
        }
        this.lastMovementIntent = Direction.NONE;
    }

    private isMoving(): boolean {
        return this.movementDirection != Direction.NONE;
    }

    private startMoving(direction: Direction): void {
        this.player.startAnimation(direction);
        this.movementDirection = direction;
        this.updatePlayerTilePos();
    }

    private updatePlayerTilePos() {
        this.player.setTilePos(
            this.player
                .getTilePos()
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                .add(this.movementDirectionVectors[this.movementDirection]!)
        );
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

    private shouldContinueMoving(): boolean {
        return (
            this.movementDirection == this.lastMovementIntent &&
            !this.isBlockingDirection(this.lastMovementIntent)
        );
    }

    private movePlayerSprite(pixelsToMove: number) {
        const directionVec = this.movementDirectionVectors[
            this.movementDirection
        ]?.clone();
        const movementDistance = directionVec?.multiply(
            new Vector2(pixelsToMove)
        );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const newPlayerPos = this.player.getPosition().add(movementDistance!);
        this.player.setPosition(newPlayerPos);
        this.tileSizePixelsWalked += pixelsToMove;
        this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
    }

    private stopMoving(): void {
        this.player.stopAnimation(this.movementDirection);
        this.movementDirection = Direction.NONE;
    }

    private getPixelsToWalkThisUpdate(delta: number): number {
        const deltaInSeconds = delta / 1000;
        return this.speedPixelsPerSecond * deltaInSeconds;
    }

    private willCrossTileBorderThisUpdate(
        pixelsToWalkThisUpdate: number
    ): boolean {
        return (
            this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= GameScene.TILE_SIZE
        );
    }

    private isBlockingDirection(direction: Direction): boolean {
        return this.hasBlockingTile(this.tilePosInDirection(direction));
    }

    private tilePosInDirection(direction: Direction): Vector2 {
        return this.player
            .getTilePos()
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .add(this.movementDirectionVectors[direction]!);
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
}