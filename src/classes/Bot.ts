import GameScene from '../scenes/GameScene';
import UIScene from '../scenes/UIScene';
import Stats from '../stats/Stats';
import {Direction} from '../types/Direction';
import Vector2 = Phaser.Math.Vector2;
import GameActor from './GameActor';
import {MonsterJob} from './Jobs/MonsterJob';

export default class Bot extends GameActor{
    public tilePos!: Phaser.Math.Vector2;
    // public stats: Stats;
    private uiScene: UIScene;
    private gameScene: GameScene;
    public path: Phaser.Math.Vector2[] = [];


    constructor(
        name: string,
        sprite: Phaser.GameObjects.Sprite,
        // private tilePos: Phaser.Math.Vector2,
        experience: number,
        public type: MonsterJob,
        stats?: Stats
    ) {
        super(
            name,
            sprite,
            experience
        );
        console.log({
            botName: name,
            botSprite: sprite,
            botExperience: experience,
            botType: type,
            botStats: stats
        });
        this.gameScene = <GameScene>sprite.scene.scene.get('Game');
        this.uiScene = <UIScene>sprite.scene.scene.get('UI');

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
        this.stats = stats ?? this.createStats(this.type);

        // Initialize this.tilePos here
        this.tilePos = new Vector2(startingPositionX, startingPositionY);
    }

    public setPosition(position: Phaser.Math.Vector2) {
        this.sprite.setPosition(position.x, position.y);
    }

    public getPosition(): Phaser.Math.Vector2 {
        return this.sprite.getBottomCenter();
    }

    public setTilePos(tilePosition: Phaser.Math.Vector2): void {
        this.tilePos = tilePosition.clone();
    }

    public startAnimation(animationKey: string) {
        if (!animationKey) return;
        this.sprite.anims.play(animationKey);
    }


    public getTilePos(): Phaser.Math.Vector2 {
        return this.tilePos.clone();
    }

    public update() {
        // If the bot is not currently moving and there are coordinates in the path, start moving
        if (this.path.length > 0) {
            // Get the next coordinate in the path
            const nextCoordinate = this.path[0];
            // Calculate the direction to move in
            const direction = this.calculateDirection(nextCoordinate);
            // Check if moving in the calculated direction would bring the bot to the player's current square
            const playerPos = this.gameScene.player.getTilePos();
            const newPos = this.tilePos.clone();
            if (direction === Direction.UP) newPos.y--;
            else if (direction === Direction.RIGHT) newPos.x++;
            else if (direction === Direction.DOWN) newPos.y++;
            else if (direction === Direction.LEFT) newPos.x--;

            if (newPos.x !== playerPos.x || newPos.y !== playerPos.y) {
                // Start moving in the calculated direction
                this.gameScene.botGridPhysics.moveBot(direction);
            }
            // If the bot has reached its destination, remove it from the path
            if (this.hasReachedDestination()) {
                // destination reached, removing first vector
                this.path.shift();
            }
        }

    }

    public hasReachedDestination(): boolean {
        if (this.path.length === 0) return true;
        const destination = this.path[0];

        // Check if the player is occupying the destination square
        const playerTilePos = this.gameScene.player.getTilePos();
        if (destination.x === playerTilePos.x && destination.y === playerTilePos.y) {
            return false;
        }

        // Calculate the distance between the current position and the destination
        const dx = this.tilePos.x - destination.x;
        const dy = this.tilePos.y - destination.y;

        // If the distance is within a certain threshold, consider the destination reached
        const threshold = 0.1;
        return Math.abs(dx) <= threshold && Math.abs(dy) <= threshold;
    }


    private calculateDirection(coordinate: Phaser.Math.Vector2): Direction {
        // Calculate the direction based on the difference between the current position and the target coordinate
        const dx = coordinate.x - this.getTilePos().x;
        const dy = coordinate.y - this.getTilePos().y;

        if (dx < 0) {
            return Direction.LEFT;
        }
        else if (dx > 0) {
            return Direction.RIGHT;
        }
        else if (dy < 0) {
            return Direction.UP;
        }
        else if (dy > 0) {
            return Direction.DOWN;
        }
        return Direction.NONE;
    }

}