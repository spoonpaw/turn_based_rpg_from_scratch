import Item from '../classes/Item';
import Stats from '../stats/Stats';
import { Equipment } from '../types/Equipment';

export function getCombinedStat(stats: Stats, equipment: Equipment, stat: keyof Stats): number {
    const baseStat = stats[stat];
    const totalEquipmentBonus = getTotalEquipmentBonus(equipment, stat);

    if (stat === 'defense') {
        return (stats.agility / 2) + totalEquipmentBonus;
    }

    return baseStat + totalEquipmentBonus;
}



export function getTotalEquipmentBonus(equipment: Equipment, stat: keyof Stats): number {
    let totalBonus = 0;
    for (const key in equipment) {
        const item = equipment[key];
        if (item) {
            totalBonus += getEquipmentStat(item, stat as keyof typeof equipment.stats);
        }
    }
    return totalBonus;
}


export function getEquipmentStat(equipment: Item, stat: keyof typeof equipment.stats): number {
    if (!equipment || !equipment.stats) {
        return 0;
    }
    return equipment.stats[stat];
}