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
        return Math.min(
            this.gameScene.MAX_LEVEL,
            Math.max(
                1,
                Math.ceil(
                    this.gameScene.PLAYER_LEVELING_RATE * Math.sqrt(
                        this.experience
                    )
                )
            )
        );
    }

    public getLevelFromExperience(experienceAmount: number) {
        console.log('Experience amount: ', experienceAmount);
        // const totalExperience = this.experience + experienceAmount;
        // console.log('Total experience: ', totalExperience);
        let level = this.gameScene.PLAYER_LEVELING_RATE * Math.sqrt(experienceAmount);
        console.log('Level (before rounding): ', level);
        level = Math.ceil(level);
        console.log('Level (after rounding): ', level);
        level = Math.max(1, level);
        console.log('Level (after applying min boundary): ', level);
        level = Math.min(this.gameScene.MAX_LEVEL, level);
        console.log('Level (after applying max boundary): ', level);
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
        console.log(`setting the player experience to ${experience}`);
        this.saveAndLoadScene.db.players.update(
            0,
            {experience}
        );
        this._experience = experience;
    }
    public get experience() {
        return this._experience;
    }

    public getMaxExperience() {
        let i = 1;
        let level = this.getLevelFromExperience(i);

        while (level < this.gameScene.MAX_LEVEL) {
            i++;
            level = this.getLevelFromExperience(i);
        }
        return i;
    }

}