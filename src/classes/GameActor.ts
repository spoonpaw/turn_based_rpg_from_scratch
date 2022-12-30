import Soldier from '../jobs/Soldier';
import Stats from '../stats/Stats';
import {Direction} from '../types/Direction';
import {Equipment} from '../types/Equipment';
import { getCombinedStat } from '../utils/EquipmentUtils';

export default class GameActor {
    public equipment!: Equipment;
    public stats!: Stats;
    public sprite!: Phaser.GameObjects.Sprite;
    protected createStats(job: string) {
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