import GameScene from '../scenes/GameScene';
import {Direction} from '../types/Direction';
import Bot from './Bot';
import GridPhysics from './GridPhysics';
import Vector2 = Phaser.Math.Vector2;

export default class BotGridPhysics extends GridPhysics {
    // Constructor
    constructor(bot: Bot, tileMap: Phaser.Tilemaps.Tilemap) {
        super(bot, tileMap);
    }

    // Override update method to apply physics to the bot
    public update(delta: number): void {
        // Update bot position and velocity based on physics rules
        // ...
        if (this.isMoving()) {
            this.updateBotPosition(delta);
        }
        this.lastMovementIntent = Direction.NONE;
    }

    protected startMoving(direction: Direction): void {
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
        if (this.playerOrNPC instanceof Bot) this.playerOrNPC.startAnimation(animationKey);
        this.movementDirection = direction;
        this.updateBotTilePos();
    }


    public moveBot(direction: Direction): void {
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

    protected moveBotSprite(pixelsToMove: number) {
        const directionVec = this.movementDirectionVectors[
            this.movementDirection
        ]?.clone();
        const movementDistance = directionVec?.multiply(
            new Vector2(pixelsToMove)
        );
        const newBotPos = this.playerOrNPC.getPosition().add(movementDistance ?? new Vector2());
        this.playerOrNPC.setPosition(newBotPos);
        this.tileSizePixelsWalked += pixelsToMove;
        this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
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

    public updateBotTilePos(): void {
        this.playerOrNPC.setTilePos(
            this.playerOrNPC
                .getTilePos()
                .add(this.movementDirectionVectors[this.movementDirection] ?? new Vector2())
        );
    }
}