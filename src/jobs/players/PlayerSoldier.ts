import {abilities} from '../../abilities/abilities';
import {PlayerJob} from '../../classes/Jobs/PlayerJob';
import {IAbilityAttainment, IBaseStatBlock, IStatIncreases} from '../../types/Advancement';

const playerSoldierBaseStats: IBaseStatBlock = {
    level: 1,
    xp: 0,
    strength: 9,
    agility: 2,
    vitality: 7,
    intellect: 1,
    luck: 2
};

const playerSoldierStatIncreases: IStatIncreases = {
    strength: [
        {range: [2, 7], increment: 3},
        {range: [8, 31], increment: 4},
        {range: [32, 46], increment: 3},
        {range: [47, 99], increment: 1}
    ],
    agility: [
        {range: [2, 5], increment: 1},
        {range: [6, 25], increment: 0.75},
        {range: [25, 37], increment: 1},
        {range: [38, 60], increment: 0.75},
        {range: [61, 99], increment: 1}
    ],
    vitality: [
        {range: [2, 8], increment: 2},
        {range: [9, 32], increment: 5.5},
        {range: [33, 39], increment: 5},
        {range: [40, 56], increment: 1.25},
        {range: [57, 99], increment: 1}
    ],
    intellect: [
        {range: [2, 13], increment: 0.75},
        {range: [14, 20], increment: 1},
        {range: [21, 29], increment: 0.5},
        {range: [30, 35], increment: 1},
        {range: [36, 99], increment: 0.5}
    ],
    luck: [
        {range: [2, 13], increment: 1},
        {range: [14, 33], increment: 0.75},
        {range: [34, 60], increment: 0.5},
        {range: [61, 74], increment: 0.25},
        {range: [75, 99], increment: 0.5}
    ]
};

const guardSkill = abilities.find((obj) => {
    return obj.name === 'Guard';
});

const skills: IAbilityAttainment[] = [
    {
        name: guardSkill!.name,
        description: guardSkill!.description,
        levelAttained: 1,
        type: guardSkill!.type,
        targets: guardSkill!.targets,
        key: guardSkill!.key,
        activeKey: guardSkill!.activeKey
    }
];

const properName = 'Soldier';

const playerSoldierJob = new PlayerJob(
    'PlayerSoldier',
    properName,
    playerSoldierBaseStats,
    playerSoldierStatIncreases,
    skills
);

export default playerSoldierJob;