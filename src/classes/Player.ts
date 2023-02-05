import playerSoldier from '../jobs/players/PlayerSoldier';
import GameScene from '../scenes/GameScene';
import SaveAndLoadScene from '../scenes/SaveAndLoadScene';
import UIScene from '../scenes/UIScene';
import {IBaseStatBlock, IStatIncreases} from '../types/Advancement';
import {Direction} from '../types/Direction';
import {Equipment} from '../types/Equipment';
import GameActor from './GameActor';
import Item from './Item';
import {PlayerJob} from './Jobs/PlayerJob';

export default class Player extends GameActor{
    private uiScene!: UIScene;
    private gameScene!: GameScene;
    public maxResource = 100;
    private saveAndLoadScene!: SaveAndLoadScene;
    constructor(
        name: string,
        sprite: Phaser.GameObjects.Sprite,
        public tilePos: Phaser.Math.Vector2,
        private _gold: number,
        _experience: number,
        public species: string,
        public job: PlayerJob,
        public inventory: Item[],
        public equipment: Equipment,
        private _currentHP: number,
        public currentResource: number
    ) {
        super(
            name,
            sprite,
            species,
            _experience
        );
        this.saveAndLoadScene = <SaveAndLoadScene>this.sprite.scene.scene.get('SaveAndLoad');
        this.uiScene = <UIScene>this.sprite.scene.scene.get('UI');
        this.gameScene = <GameScene>this.sprite.scene.scene.get('Game');

        const offsetX = GameScene.TILE_SIZE / 2;
        const offsetY = GameScene.TILE_SIZE;

        this.sprite.setOrigin(0.5, 1);
        this.sprite.setPosition(
            tilePos.x * GameScene.TILE_SIZE + offsetX,
            tilePos.y * GameScene.TILE_SIZE + offsetY
        );
        this.sprite.setFrame(1);

        this.sprite.setInteractive();

        this.sprite.on(
            'pointerdown',
            () => {
                // sprite clicked
                return;
            }
        );
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

    public startAnimation(direction: Direction | string) {
        this.sprite.anims.play(direction);
    }

    public get level() {
        // Find the square root of the experience property
        const sqrtExp = Math.sqrt(this.experience);

        // Calculate the level based on the square root of the experience and PLAYER_LEVELING_RATE
        let level = sqrtExp * this.gameScene.gameConfig.PLAYER_LEVELING_RATE;

        // Round up the level to the nearest integer
        level = Math.ceil(level);

        // Ensure the level is at least 1
        if (level < 1) {
            level = 1;
        }

        // Ensure the level is not greater than MAX_LEVEL
        if (level > this.gameScene.gameConfig.MAX_UNIT_LEVEL) {
            level = this.gameScene.gameConfig.MAX_UNIT_LEVEL;
        }

        // Return the final calculated level
        return level;
    }

    public getLevelFromExperience(experienceAmount: number) {
        let level = this.gameScene.gameConfig.PLAYER_LEVELING_RATE * Math.sqrt(experienceAmount);
        level = Math.ceil(level);
        level = Math.max(1, level);
        level = Math.min(this.gameScene.gameConfig.MAX_UNIT_LEVEL, level);
        return level;
    }

    private calculateStat(stat: (keyof IBaseStatBlock & keyof IStatIncreases) | 'defense'): number {
        let derivedStat;
        if (stat === 'defense') {
            derivedStat = 'defense';
            stat = 'agility';
        }
        let statValue = playerSoldier.baseStats[stat];
        if (this.level > 1) {
            for (let i = 2; i <= this.level; i++) {
                const incrementAmount = playerSoldier.statIncreases[stat].find(
                    (incrementRange) => {
                        return incrementRange.range[0] <= i && i <= incrementRange.range[1];
                    }
                )?.increment as number;
                statValue += incrementAmount;
            }
        }

        const totalEquipmentBonus = this.getTotalEquipmentBonus(stat);
        if (derivedStat === 'defense') {
            const derivedStatEquipmentBonus = this.getTotalEquipmentBonus(derivedStat);
            return ((statValue + totalEquipmentBonus) / 2) + derivedStatEquipmentBonus;
        }
        return statValue + totalEquipmentBonus;
    }

    private getTotalEquipmentBonus(stat: (keyof IBaseStatBlock & keyof IStatIncreases) | 'defense'): number {
        let totalBonus = 0;
        for (const key in this.equipment) {
            const item = this.equipment[key];
            if (item) {
                totalBonus += this.getEquipmentStat(item, stat);
            }
        }
        return totalBonus;
    }

    private getEquipmentStat(equipment: Item, stat: (keyof IBaseStatBlock & keyof IStatIncreases) | 'defense'): number {
        if (!equipment || !equipment.stats) {
            return 0;
        }
        return equipment.stats[stat];
    }

    public get maxHP() {
        return this.calculateStat('vitality') * 2;
    }

    public get agility() {
        return this.calculateStat('agility');
    }

    public get vitality() {
        return this.calculateStat('vitality');
    }

    public get intellect() {
        return this.calculateStat('intellect');
    }

    public get luck() {
        return this.calculateStat('luck');
    }

    public get strength() {
        return this.calculateStat('strength');
    }

    public get defense() {
        return this.calculateStat('defense');
    }

    public get gold() {
        return this._gold;
    }

    public set gold(gold) {
        this.saveAndLoadScene.db.players.update(
            0,
            {gold}
        );
        this._gold = gold;
    }

    public get currentHP() {
        return this._currentHP;
    }

    public set currentHP(currentHP) {
        this.saveAndLoadScene.db.players.update(
            0,
            {currentHP}
        );
        this._currentHP = currentHP;
    }

    public set experience(experience) {
        this.saveAndLoadScene.db.players.update(
            0,
            {experience}
        );
        this._experience = experience;
    }
    public get experience() {
        return this._experience;
    }

}