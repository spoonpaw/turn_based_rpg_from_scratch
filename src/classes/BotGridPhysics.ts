import GameScene from '../scenes/GameScene';
import {Direction} from '../types/Direction';
import Bot from './Bot';
import Vector2 = Phaser.Math.Vector2;

export default class BotGridPhysics{
    protected readonly speedPixelsPerSecond: number = GameScene.TILE_SIZE * 4;
    protected movementDirectionVectors: {
        [key in Direction]?: Vector2;
    } = {
            [Direction.UP]: Vector2.UP,
            [Direction.DOWN]: Vector2.DOWN,
            [Direction.LEFT]: Vector2.LEFT,
            [Direction.RIGHT]: Vector2.RIGHT,
        };
    private movementDirection: Direction = Direction.NONE;
    protected tileSizePixelsWalked = 0;
    constructor(
        private bot: Bot,
        private tileMap: Phaser.Tilemaps.Tilemap
    ) {
        // super(bot, tileMap);
    }

    protected willCrossTileBorderThisUpdate(
        pixelsToWalkThisUpdate: number
    ): boolean {
        return (
            this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= GameScene.TILE_SIZE
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
    //
    // protected shouldContinueMoving(): boolean {
    //     // Get the bot's next destination in its path
    //     const nextDestination = this.bot.path[0];
    //     // Get the player's current position
    //     const playerPos = this.bot.gameScene.player.getTilePos();
    //     // Check if the bot's next destination is not the same as the player's current position
    //     return (
    //         nextDestination.x !== playerPos.x ||
    //         nextDestination.y !== playerPos.y
    //     ) && (
    //         nextDestination.x !== this.bot.getTilePos().x ||
    //         nextDestination.y !== this.bot.getTilePos().y
    //     );
    // }
    //
    // private hasNoTile(pos: Vector2): boolean {
    //     return !this.tileMap.layers.some((layer) =>
    //         this.tileMap.hasTileAt(pos.x, pos.y, layer.name)
    //     );
    // }
    //
    // protected tilePosInDirection(direction: Direction): Vector2 {
    //     return this.bot
    //         .getTilePos()
    //         .add(this.movementDirectionVectors[direction] ?? new Vector2());
    // }
    //
    protected updatePosition(delta: number) {
        const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);
        //

        this.moveBotSprite(pixelsToWalkThisUpdate);
        this.updateTilePos();

        // if (!this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
        //     this.moveBotSprite(pixelsToWalkThisUpdate);
        // }
        // else if (this.shouldContinueMoving()) {
        //     this.moveBotSprite(pixelsToWalkThisUpdate);
        //     this.updateTilePos();
        // }
        // else {
        //     this.moveBotSprite(GameScene.TILE_SIZE - this.tileSizePixelsWalked);
        //     this.stopMoving();
        // }

    }

    // protected stopMoving(): void {
    //     console.log('STOPPING MOVEMENT ON THE BOT');
    //     this.bot.stopAnimation(this.movementDirection);
    //     this.movementDirection = Direction.NONE;
    // }
    //
    protected getPixelsToWalkThisUpdate(delta: number): number {
        const deltaInSeconds = delta / 1000;
        return this.speedPixelsPerSecond * deltaInSeconds;
    }

    public update(delta: number) {

        // Update bot position and velocity based on physics rules
        if (this.isMoving()) {
            this.updatePosition(delta);
        }
        return;
    }

    public isMoving(): boolean {
        return this.movementDirection != Direction.NONE;
    }

    public moveActor(direction: Direction) {
        console.log(`trying to start moving ${this.bot.name}!`);
        console.log({direction});
        this.startMoving(direction);
    }

    private startMoving(direction: Direction): void {
        // start moving the bot in the given direction
        console.log('START MOVING THE BOT');
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
        this.bot.startAnimation(animationKey);
        this.movementDirection = direction;
        this.updateTilePos();
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
}