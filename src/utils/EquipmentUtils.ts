// import Bot from '../classes/Bot';
// import BotCharacter from '../classes/BotCharacter';
// import {Enemy} from '../classes/Enemy';
// import Item from '../classes/Item';
// import Player from '../classes/Player';
// import PlayerCharacter from '../classes/PlayerCharacter';
// import Unit from '../classes/Unit';
// import Stats from '../stats/Stats';
// import {IBaseStatBlock} from '../types/Advancement';
// import { Equipment } from '../types/Equipment';
//
// export function getCombinedStat(
//     gameActor: Player | Bot | PlayerCharacter | BotCharacter | Unit | Enemy,
//     equipment: Equipment,
//     stat: (keyof IBaseStatBlock & keyof Stats) | 'defense'
// ): number {
//     const job = gameActor.job;
//     let derivedStat;
//     if (stat === 'defense') {
//         derivedStat = 'defense';
//         stat = 'agility';
//     }
//     let statAmount = job.baseStats[stat];
//     if (gameActor.level > 1) {
//         for (let i = 2; i <= gameActor.level; i++) {
//             const incrementAmount = job.statIncreases[stat].find(
//                 (incrementRange) => {
//                     return incrementRange.range[0] <= i && i <= incrementRange.range[1];
//                 }
//             )?.increment as number;
//             statAmount += incrementAmount;
//         }
//     }
//     const totalEquipmentBonus = getTotalEquipmentBonus(equipment, stat);
//     if (derivedStat === 'defense') {
//         const derivedStatEquipmentBonus = getTotalEquipmentBonus(equipment, derivedStat);
//         return ((statAmount + totalEquipmentBonus) / 2) + derivedStatEquipmentBonus;
//     }
//     return statAmount + totalEquipmentBonus;
// }
//
// export function getTotalEquipmentBonus(equipment: Equipment, stat: keyof Stats): number {
//     let totalBonus = 0;
//     for (const key in equipment) {
//         const item = equipment[key];
//         if (item) {
//             totalBonus += getEquipmentStat(item, stat as keyof typeof equipment.stats);
//         }
//     }
//     return totalBonus;
// }
//
// export function getEquipmentStat(equipment: Item, stat: keyof typeof equipment.stats): number {
//     if (!equipment || !equipment.stats) {
//         return 0;
//     }
//     return equipment.stats[stat];
// }