import MonsterSoldier from '../jobs/monsters/MonsterSoldier';
import PlayerSoldier from '../jobs/players/PlayerSoldier';
import Stats from '../stats/Stats';
import {Direction} from '../types/Direction';
import {Equipment} from '../types/Equipment';
import { getCombinedStat } from '../utils/EquipmentUtils';
import {Job} from './Jobs/Job';

export default class GameActor {
    public equipment!: Equipment;
    public stats!: Stats;
    // public sprite!: Phaser.GameObjects.Sprite;
    // public experience!: number;
    constructor(
        public name: string,
        public sprite: Phaser.GameObjects.Sprite,
        public experience: number
    ) {

    }
    protected createStats(job: Job) {
        if (job.name === 'PlayerSoldier') {
            return new Stats(
                PlayerSoldier.baseStats.strength,
                PlayerSoldier.baseStats.agility,
                PlayerSoldier.baseStats.vitality,
                PlayerSoldier.baseStats.intellect,
                PlayerSoldier.baseStats.luck,
                PlayerSoldier.baseStats.vitality * 2,
                PlayerSoldier.baseStats.vitality * 2,
                PlayerSoldier.baseStats.intellect * 2,
                PlayerSoldier.baseStats.intellect * 2,
                PlayerSoldier.baseStats.strength,
                PlayerSoldier.baseStats.agility / 2
            );
        }
        else if (job.name === 'MonsterSoldier') {
            return new Stats(
                MonsterSoldier.baseStats.strength,
                MonsterSoldier.baseStats.agility,
                MonsterSoldier.baseStats.vitality,
                MonsterSoldier.baseStats.intellect,
                MonsterSoldier.baseStats.luck,
                MonsterSoldier.baseStats.vitality * 2,
                MonsterSoldier.baseStats.vitality * 2,
                MonsterSoldier.baseStats.intellect * 2,
                MonsterSoldier.baseStats.intellect * 2,
                MonsterSoldier.baseStats.strength,
                MonsterSoldier.baseStats.agility / 2
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

    public getCombinedStat(stat: keyof Stats | keyof typeof this.equipment.stats): number {
        return getCombinedStat(this.stats, this.equipment, stat);
    }


    public stopAnimation(direction: Direction) {
        if (!this.sprite.anims) return;
        const animationManager = this.sprite.anims.animationManager;
        const standingFrame = animationManager.get(direction).frames[1].frame.name;
        this.sprite.anims.stop();
        this.sprite.setFrame(standingFrame);
    }
}