import GameScene from '../scenes/GameScene';
import {Direction} from '../types/Direction';
import Bot from './Bot';
import Player from './Player';

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

export default class GridPhysics {
    public facingDirection = Direction.NONE;
    protected lastMovementIntent = Direction.NONE;
    protected gameScene!: GameScene;
    protected movementDirection: Direction = Direction.NONE;
    protected movementDirectionVectors: {
        [key in Direction]?: Vector2;
    } = {
            [Direction.UP]: Vector2.UP,
            [Direction.DOWN]: Vector2.DOWN,
            [Direction.LEFT]: Vector2.LEFT,
            [Direction.RIGHT]: Vector2.RIGHT,
        };
    protected readonly speedPixelsPerSecond: number = GameScene.TILE_SIZE * 4;
    protected tileSizePixelsWalked = 0;

    public constructor(
        protected playerOrNPC: Player | Bot,
        public tileMap: Phaser.Tilemaps.Tilemap
    ) {
        this.gameScene = <GameScene>this.playerOrNPC.sprite.scene.scene.get('Game');
    }

    public moveActor(direction: Direction): void {
        this.move(direction);
    }

    public move(direction: Direction) {
        this.lastMovementIntent = direction;
        if (this.isMoving()) return;
        if (this.isBlockingDirection(direction)) {
            this.facingDirection = direction;
            this.playerOrNPC.stopAnimation(direction);
        }
        else {
            this.facingDirection = direction;
            this.startMoving(direction);
        }
    }

    public update(delta: number): void {
        if (this.isMoving()) {
            this.updatePosition(delta);
        }
        this.lastMovementIntent = Direction.NONE;
    }

    protected getPixelsToWalkThisUpdate(delta: number): number {
        const deltaInSeconds = delta / 1000;
        return this.speedPixelsPerSecond * deltaInSeconds;
    }

    protected isBlockingDirection(direction: Direction): boolean {
        return this.hasBlockingTile(this.tilePosInDirection(direction));
    }

    public isMoving(): boolean {
        return this.movementDirection != Direction.NONE;
    }

    protected moveActorSprite(pixelsToMove: number) {
        const directionVec = this.movementDirectionVectors[
            this.movementDirection
        ]?.clone();
        const movementDistance = directionVec?.multiply(
            new Vector2(pixelsToMove)
        );
        const newPlayerPos = this.playerOrNPC.getPosition().add(movementDistance ?? new Vector2());
        this.playerOrNPC.setPosition(newPlayerPos);
        this.tileSizePixelsWalked += pixelsToMove;
        this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
    }

    protected shouldContinueMoving(): boolean {
        return (
            this.movementDirection == this.lastMovementIntent &&
            !this.isBlockingDirection(this.lastMovementIntent)
        );
    }

    protected startMoving(direction: Direction): void {
        this.playerOrNPC.startAnimation(direction);
        this.movementDirection = direction;
        this.updateTilePos();
    }

    protected stopMoving(): void {
        this.playerOrNPC.stopAnimation(this.movementDirection);
        this.movementDirection = Direction.NONE;
    }

    protected updateTilePos(): void {
        this.playerOrNPC.setTilePos(
            this.playerOrNPC
                .getTilePos()
                .add(this.movementDirectionVectors[this.movementDirection] ?? new Vector2())
        );
    }

    protected willCrossTileBorderThisUpdate(
        pixelsToWalkThisUpdate: number
    ): boolean {
        return (
            this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= GameScene.TILE_SIZE
        );
    }

    protected hasBlockingTile(pos: Vector2): boolean {
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

    protected tilePosInDirection(direction: Direction): Vector2 {
        return this.playerOrNPC
            .getTilePos()
            .add(this.movementDirectionVectors[direction] ?? new Vector2());
    }

    protected updatePosition(delta: number) {
        const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);
        if (!this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
            this.moveActorSprite(pixelsToWalkThisUpdate);
        }
        else if (this.shouldContinueMoving()) {
            this.moveActorSprite(pixelsToWalkThisUpdate);
            this.updateTilePos();
        }
        else {
            this.moveActorSprite(GameScene.TILE_SIZE - this.tileSizePixelsWalked);
            this.stopMoving();
        }
    }
}