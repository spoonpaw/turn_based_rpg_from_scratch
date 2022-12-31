import {IBaseStatBlock, IStatIncreases} from '../types/Advancement';

const Cleric: {
    kind: string;
    armor: string;
    weapons: string;
    advancement: IBaseStatBlock[];
    statIncreases: IStatIncreases;
} = {
    kind: 'Cleric',
    armor: 'cloth',
    weapons: 'mace',
    advancement: [
        {
            level: 1,
            xp: 0,
            strength: 3,
            agility: 2,
            vitality: 5,
            intellect: 8,
            luck: 2
        },
    ],
    statIncreases: {
        strength: [
            {range: [2, 7], increment: 3},
            {range: [8, 31], increment: 2},
            {range: [32, 46], increment: 1},
            {range: [47, 99], increment: 0.5}
        ],
        agility: [
            {range: [2, 5], increment: 1},
            {range: [6, 25], increment: 0.5},
            {range: [25, 37], increment: 0.75},
            {range: [38, 60], increment: 0.5},
            {range: [61, 99], increment: 0.75}
        ],
        vitality: [
            {range: [2, 8], increment: 3},
            {range: [9, 32], increment: 4},
            {range: [33, 39], increment: 3},
            {range: [40, 56], increment: 1},
            {range: [57, 99], increment: 0.5}
        ],
        intellect: [
            {range: [2, 13], increment: 1.5},
            {range: [14, 20], increment: 1},
            {range: [21, 29], increment: 0.75},
            {range: [30, 35], increment: 1},
            {range: [36, 99], increment: 0.75}
        ],
        luck: [
            {range: [2, 13], increment: 1},
            {range: [14, 33], increment: 0.75},
            {range: [34, 60], increment: 0.5},
            {range: [61, 74], increment: 0.25},
            {range: [75, 99], increment: 0.5}
        ]
    }
}

export default Cleric;