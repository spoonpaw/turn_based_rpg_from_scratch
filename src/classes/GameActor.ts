import Soldier from '../jobs/Soldier';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import { getCombinedStat } from '../utils/EquipmentUtils';

export default class GameActor {
    public equipment!: Equipment;
    public stats!: Stats;
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


    // public getCombinedStat(stat: keyof typeof this.stats): number {
    //     const baseStat = this.stats[stat];
    //     let weaponBonus = 0;
    //     if (this.equipment.weapon) {
    //         weaponBonus += this.equipment.weapon.stats![stat as keyof typeof this.equipment.weapon.stats];
    //     }
    //
    //     let headBonus = 0;
    //     if (this.equipment.head) {
    //         headBonus += this.equipment.head.stats![stat as keyof typeof this.equipment.head.stats];
    //     }
    //
    //     let bodyBonus = 0;
    //     if (this.equipment.body) {
    //         bodyBonus += this.equipment.body.stats![stat as keyof typeof this.equipment.body.stats];
    //     }
    //
    //     let offHandBonus = 0;
    //     if (this.equipment.offhand) {
    //         offHandBonus += this.equipment.offhand.stats![stat as keyof typeof this.equipment.offhand.stats];
    //     }
    //
    //     const totalEquipmentBonus = weaponBonus + headBonus + bodyBonus + offHandBonus;
    //
    //     if (stat === 'defense') {
    //         return (this.stats.agility / 2) + totalEquipmentBonus;
    //     }
    //
    //     return baseStat + totalEquipmentBonus;
    // }

    // getCombinedStat(
    //     stats: Stats,
    //     equipment: {
    //         weapon?: { stats?: { [key: string]: number } },
    //         head?: { stats?: { [key: string]: number } },
    //         body?: { stats?: { [key: string]: number } },
    //         offhand?: { stats?: { [key: string]: number } },
    //     },
    //     stat: keyof typeof stats
    // ): number {
    //     const baseStat = stats[stat];
    //     let weaponBonus = 0;
    //     if (equipment.weapon) {
    //         weaponBonus += equipment.weapon.stats![stat as keyof typeof equipment.weapon.stats];
    //     }
    //
    //     let headBonus = 0;
    //     if (equipment.head) {
    //         headBonus += equipment.head.stats![stat as keyof typeof equipment.head.stats];
    //     }
    //
    //     let bodyBonus = 0;
    //     if (equipment.body) {
    //         bodyBonus += equipment.body.stats![stat as keyof typeof equipment.body.stats];
    //     }
    //
    //     let offHandBonus = 0;
    //     if (equipment.offhand) {
    //         offHandBonus += equipment.offhand.stats![stat as keyof typeof equipment.offhand.stats];
    //     }
    //
    //     const totalEquipmentBonus = weaponBonus + headBonus + bodyBonus + offHandBonus;
    //
    //     if (stat === 'defense') {
    //         return (stats.agility / 2) + totalEquipmentBonus;
    //     }
    //
    //     return baseStat + totalEquipmentBonus;
    // }



}