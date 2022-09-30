import GameScene from '../scenes/GameScene';
import {Direction} from '../types/Direction';
import Stats from '../stats/Stats';
import Warrior from '../jobs/Warrior';

export default class Player {
    public stats: Stats;

    constructor(
        public sprite: Phaser.GameObjects.Sprite,
        private tilePos: Phaser.Math.Vector2,
        public gold: number,
        public experience: number,
        public type: string,
        stats?: Stats
    ) {
        const offsetX = GameScene.TILE_SIZE / 2;
        const offsetY = GameScene.TILE_SIZE;

        this.sprite.setOrigin(0.5, 1);
        this.sprite.setPosition(
            tilePos.x * GameScene.TILE_SIZE + offsetX,
            tilePos.y * GameScene.TILE_SIZE + offsetY
        );
        this.sprite.setFrame(1);
        this.stats = stats ?? this.createStatsForNewPlayer(this.type);
    }

    getPosition(): Phaser.Math.Vector2 {
        return this.sprite.getBottomCenter();
    }

    setPosition(position: Phaser.Math.Vector2): void {
        this.sprite.setPosition(position.x, position.y);
    }

    stopAnimation(direction: Direction) {
        const animationManager = this.sprite.anims.animationManager;
        const standingFrame = animationManager.get(direction).frames[1].frame.name;
        this.sprite.anims.stop();
        this.sprite.setFrame(standingFrame);
    }

    startAnimation(direction: Direction) {
        this.sprite.anims.play(direction);
    }

    getTilePos(): Phaser.Math.Vector2 {
        return this.tilePos.clone();
    }

    setTilePos(tilePosition: Phaser.Math.Vector2): void {
        this.tilePos = tilePosition.clone();
    }

    createStatsForNewPlayer(job: string): Stats {
        if (job === 'warrior') {
            return new Stats(
                Warrior.advancement[0].agi,
                Warrior.advancement[0].int,
                0,
                Warrior.advancement[0].con,
                Warrior.advancement[0].dex,
                Warrior.advancement[0].str,
                0,
                Warrior.advancement[0].hp,
                0,
                Warrior.advancement[0].hp,
                0
            );
        }
        else {
            return new Stats(
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            );
        }
    }
}