import Soldier from '../jobs/Soldier';
import GameScene from '../scenes/GameScene';
import UIScene from '../scenes/UIScene';
import Stats from '../stats/Stats';
import {Direction} from '../types/Direction';
import Vector2 = Phaser.Math.Vector2;

export default class Bot {
    public tilePos!: Phaser.Math.Vector2;
    public stats: Stats;
    private uiScene: UIScene;
    private gameScene: GameScene;
    public path: Phaser.Math.Vector2[] = [];


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
    }

    public getPosition(): Phaser.Math.Vector2 {
        return this.sprite.getBottomCenter();
    }

    public setTilePos(tilePosition: Phaser.Math.Vector2): void {
        this.tilePos = tilePosition.clone();
    }

    public stopAnimation(direction: Direction) {
        if (!this.sprite.anims) return;
        const animationManager = this.sprite.anims.animationManager;
        const standingFrame = animationManager.get(direction).frames[1].frame.name;
        this.sprite.anims.stop();
        this.sprite.setFrame(standingFrame);
    }

    public startAnimation(animationKey: string) {
        this.sprite.anims.play(animationKey);
    }


    public getTilePos(): Phaser.Math.Vector2 {
        return this.tilePos.clone();
    }

    public update() {
        // If the bot is not currently moving and there are coordinates in the path, start moving
        if (this.path.length > 0) {
            // console.log({
            //     botX: this.getTilePos().x,
            //     botY: this.getTilePos().y
            // });
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
                console.log('destination reached, removing first vector');
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