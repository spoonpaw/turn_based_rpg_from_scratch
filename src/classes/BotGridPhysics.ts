import GameScene from '../scenes/GameScene';
import {Direction} from '../types/Direction';
import Bot from './Bot';
import Vector2 = Phaser.Math.Vector2;

export default class BotGridPhysics{
    private lastMovementCommandTimestamp = 0;
    public lastMovementCommand = Direction.NONE;
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
    private movementDirection: Direction = Direction.NONE;

    constructor(
        private bot: Bot,
        private tileMap: Phaser.Tilemaps.Tilemap
    ) {
    }

    public isMoving(): boolean {
        return this.movementDirection != Direction.NONE;
    }

    public move(direction: Direction) {
        this.lastMovementCommand = direction;
        this.lastMovementCommandTimestamp = Date.now();
        if (this.isMoving()) return;
        this.movementDirection = direction;
        this.startMoving(direction);
    }

    protected tilePosInDirection(direction: Direction): Vector2 {
        return this.bot
            .getTilePos()
            .add(this.movementDirectionVectors[direction] ?? new Vector2());
    }

    public update(delta: number) {
        // Update bot position and velocity based on physics rules
        if (this.isMoving()) {
            this.updatePosition(delta);
        }

        this.lastMovementCommand = Direction.NONE;
    }

    public updateTilePos(): void {
        this.bot.setTilePos(
            this.bot
                .getTilePos()
                .add(
                    this.movementDirectionVectors[
                        this.movementDirection
                    ] ?? new Vector2()
                )
        );
    }

    protected getPixelsToWalkThisUpdate(delta: number): number {
        const playerProgress = this.bot.gameScene.gridPhysics.tileSizePixelsWalked / GameScene.TILE_SIZE;
        const deltaInSeconds = delta / 1000;
        return Math.max(
            this.speedPixelsPerSecond * deltaInSeconds,
            (playerProgress * GameScene.TILE_SIZE) - this.tileSizePixelsWalked
        );
    }

    protected moveBotSprite(pixelsToMove: number) {
        const directionVec = this.movementDirectionVectors[
            this.movementDirection
        ]?.clone();
        const movementDistance = directionVec?.multiply(
            new Vector2(pixelsToMove)
        );
        const newBotPos = this.bot.getPosition().add(movementDistance ?? new Vector2());
        this.bot.setPosition(newBotPos);
        this.tileSizePixelsWalked += pixelsToMove;
        this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
    }

    protected shouldContinueMoving(): boolean {
        const playerPos = this.bot.gameScene.player.getTilePos();
        const botPos = this.bot.getTilePos();
        switch(this.movementDirection) {
        case Direction.UP:
            return botPos.y - playerPos.y === 2;
        case Direction.DOWN:
            return playerPos.y - botPos.y === 2;
        case Direction.LEFT:
            return botPos.x - playerPos.x === 2;
        case Direction.RIGHT:
            return playerPos.x - botPos.x === 2;
        default:
            return false;
        }
    }


    protected stopMoving(): void {
        this.bot.startedMoving = false;
        this.bot.stopAnimation(this.movementDirection);
        this.movementDirection = Direction.NONE;
    }

    //
    protected updatePosition(delta: number) {
        const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);
        if (!this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
            this.moveBotSprite(pixelsToWalkThisUpdate);
        }
        else if (this.shouldContinueMoving()) {
            this.moveBotSprite(pixelsToWalkThisUpdate);
            this.updateTilePos();
        }
        else {
            this.moveBotSprite(GameScene.TILE_SIZE - this.tileSizePixelsWalked);
            this.stopMoving();
        }
    }

    protected willCrossTileBorderThisUpdate(
        pixelsToWalkThisUpdate: number
    ): boolean {
        return (
            this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= GameScene.TILE_SIZE
        );
    }

    private startMoving(direction: Direction): void {
        // start moving the bot in the given direction
        if (this.bot.startedMoving) return;
        this.bot.startedMoving = true;
        let animationKey = '';
        if (direction === Direction.UP) {
            animationKey = 'redbot_up';
        }
        else if (direction === Direction.RIGHT) {
            animationKey = 'redbot_right';
        }
        else if (direction === Direction.DOWN) {
            animationKey = 'redbot_down';
        }
        else if (direction === Direction.LEFT) {
            animationKey = 'redbot_left';
        }
        if (!this.bot.sprite.anims.isPlaying) this.bot.startAnimation(animationKey);
        this.updateTilePos();
    }
}