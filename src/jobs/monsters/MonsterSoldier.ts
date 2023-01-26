import {MonsterJob} from '../../classes/Jobs/MonsterJob';
import {IBaseStatBlock, IStatIncreases} from '../../types/Advancement';

const monsterSoldierBaseStats: IBaseStatBlock = {
    level: 1,
    xp: 0,
    strength: 6,
    agility: 1,
    vitality: 5,
    intellect: 1,
    luck: 1
};

const monsterSoldierStatIncreases: IStatIncreases = {
    strength: [
        {range: [2, 6], increment: 2},
        {range: [7, 26], increment: 3},
        {range: [27, 38], increment: 2},
        {range: [39, 66], increment: 1}
    ],
    agility: [
        {range: [2, 4], increment: 0.5},
        {range: [5, 23], increment: 0.5},
        {range: [24, 35], increment: 0.5},
        {range: [36, 60], increment: 0.5},
        {range: [61, 99], increment: 0.5}
    ],
    vitality: [
        {range: [2, 6], increment: 1},
        {range: [7, 29], increment: 3},
        {range: [30, 37], increment: 3},
        {range: [38, 53], increment: 1},
        {range: [54, 99], increment: 0.5}
    ],
    intellect: [
        {range: [2, 10], increment: 0.5},
        {range: [11, 17], increment: 0.5},
        {range: [18, 26], increment: 0.25},
        {range: [27, 32], increment: 0.5},
        {range: [33, 99], increment: 0.25}
    ],
    luck: [
        {range: [2, 10], increment: 0.5},
        {range: [11, 30], increment: 0.5},
        {range: [31, 50], increment: 0.25},
        {range: [51, 64], increment: 0.25},
        {range: [65, 99], increment: 0.25}
    ]
};

const monsterSoldierJob = new MonsterJob(
    'MonsterSoldier',
    'Soldier',
    monsterSoldierBaseStats,
    monsterSoldierStatIncreases,
    []
);

export default monsterSoldierJob;