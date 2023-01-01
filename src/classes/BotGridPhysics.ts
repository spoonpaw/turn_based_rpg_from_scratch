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
            this.updatePosition(delta);
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
        this.playerOrNPC.startAnimation(animationKey);
        this.movementDirection = direction;
        this.updateTilePos();
    }


    public moveActor(direction: Direction): void {
        this.move(direction);
    }

    protected moveActorSprite(pixelsToMove: number) {
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

    public updateTilePos(): void {
        this.playerOrNPC.setTilePos(
            this.playerOrNPC
                .getTilePos()
                .add(this.movementDirectionVectors[this.movementDirection] ?? new Vector2())
        );
    }
}