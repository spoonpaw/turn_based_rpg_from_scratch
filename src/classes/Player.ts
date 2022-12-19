import Soldier from '../jobs/Soldier';
import GameScene from '../scenes/GameScene';
import UIScene from '../scenes/UIScene';
import Stats from '../stats/Stats';
import {Direction} from '../types/Direction';
import {Equipment} from '../types/Equipment';
import Item from './Item';

export default class Player {
    public stats: Stats;
    private uiScene!: UIScene;

    constructor(
        public sprite: Phaser.GameObjects.Sprite,
        private tilePos: Phaser.Math.Vector2,
        public gold: number,
        public experience: number,
        public type: string,
        public inventory: Item[],
        public equipment: Equipment,
        stats?: Stats
    ) {
        this.uiScene = <UIScene>this.sprite.scene.scene.get('UI');

        const offsetX = GameScene.TILE_SIZE / 2;
        const offsetY = GameScene.TILE_SIZE;

        this.sprite.setOrigin(0.5, 1);
        this.sprite.setPosition(
            tilePos.x * GameScene.TILE_SIZE + offsetX,
            tilePos.y * GameScene.TILE_SIZE + offsetY
        );
        this.sprite.setFrame(1);
        this.stats = stats ?? this.createStatsForNewPlayer(this.type);

        this.sprite.setInteractive();

        this.sprite.on(
            'pointerdown',
            () => {
                // sprite clicked
                return;
            }
        );
    }

    public createStatsForNewPlayer(job: string): Stats {
        if (job === 'Soldier') {

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

    public getCombinedStat(stat: keyof typeof this.stats): number {
        const baseStat = this.stats[stat];
        let weaponBonus = 0;
        if (this.equipment.weapon) {
            weaponBonus += this.equipment.weapon.stats![stat as keyof typeof this.equipment.weapon.stats];
        }

        let headBonus = 0;
        if (this.equipment.head) {
            headBonus += this.equipment.head.stats![stat as keyof typeof this.equipment.head.stats];
        }

        let bodyBonus = 0;
        if (this.equipment.body) {
            bodyBonus += this.equipment.body.stats![stat as keyof typeof this.equipment.body.stats];
        }

        let offHandBonus = 0;
        if (this.equipment.offhand) {
            offHandBonus += this.equipment.offhand.stats![stat as keyof typeof this.equipment.offhand.stats];
        }

        return baseStat + weaponBonus + headBonus + bodyBonus + offHandBonus;
    }

    public getPosition(): Phaser.Math.Vector2 {
        return this.sprite.getBottomCenter();
    }

    public getTilePos(): Phaser.Math.Vector2 {
        return this.tilePos.clone();
    }

    public setPosition(position: Phaser.Math.Vector2): void {
        this.sprite.setPosition(position.x, position.y);
    }

    public setTilePos(tilePosition: Phaser.Math.Vector2): void {
        this.tilePos = tilePosition.clone();
    }

    public startAnimation(direction: Direction) {
        this.sprite.anims.play(direction);
    }

    public stopAnimation(direction: Direction) {
        if (!this.sprite.anims) return;
        const animationManager = this.sprite.anims.animationManager;
        const standingFrame = animationManager.get(direction).frames[1].frame.name;
        this.sprite.anims.stop();
        this.sprite.setFrame(standingFrame);
    }

}