const Soldier: {
    kind: string;
    armor: string;
    weapons: string;
    advancement: IAdvancementBlock[];
    statIncreases: IStatIncreases;
} = {
    // this is a typed tag
    kind: 'soldier',

    // the soldier can equip any armor item
    armor: 'any',

    // the soldier can equip any weapon item
    weapons: 'any',

    // the soldier should level up gradually, advancing stats automatically following a stat priority
    // stat priority (in order of importance): strength, stamina, agility, dexterity, intellect
    // three levels of stat increase: 3 points per level, 2 points per level, 1 point per level
    // level up... or something like that:
    advancement: [
        {
            level: 1,
            xp: 0,
            strength: 9,
            agility: 2,
            vitality: 7,
            intellect: 1,
            luck: 2
        },
    ],
    statIncreases: {
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
    }

};

export interface IStatIncreases {
    strength: {range: [number, number], increment: number}[];
    agility: {range: [number, number], increment: number}[];
    vitality: {range: [number, number], increment: number}[];
    intellect: {range: [number, number], increment: number}[];
    luck: {range: [number, number], increment: number}[];
}


interface IAdvancementBlock {
    level: number;
    xp: number;
    strength: number;
    agility: number;
    vitality: number;
    intellect: number;
    luck: number;
}

export default Soldier;