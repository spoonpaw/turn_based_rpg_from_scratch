const Warrior: {
    kind: string;
    armor: string;
    weapons: string;
    advancement: IAdvancementBlock[]
} = {
    // this is a typed tag
    kind: 'warrior',

    // the warrior can equip any armor item
    armor: 'any',

    // the warrior can equip any weapon item
    weapons: 'any',

    // the warrior should level up gradually, advancing stats automatically following a stat priority
    // stat priority (in order of importance): strength, stamina, agility, dexterity, intellect
    // three levels of stat increase: 3 points per level, 2 points per level, 1 point per level
    // level up:
    advancement: [
        {
            level: 1,
            xp: 0,
            maxHP: 8,
            strength:  5,
            constitution:  4,
            dexterity:  2,
            intellect:  0,
            agility:  3
        },
        {
            level: 2,
            xp: 26,
            maxHP: 10,
            strength:  6,
            constitution:  4,
            dexterity:  2,
            intellect:  0,
            agility:  3
        },
        {
            level: 3,
            xp: 101,
            maxHP: 13,
            strength:  6,
            constitution:  4,
            dexterity:  2,
            intellect:  0,
            agility:  3
        },
        {
            level: 4,
            xp: 226,
            maxHP: 18,
            strength:  6,
            constitution:  5,
            dexterity:  2,
            intellect:  0,
            agility:  4
        },
        {
            level: 5,
            xp: 401,
            maxHP: 22,
            strength:  6,
            constitution:  5,
            dexterity:  2,
            intellect:  0,
            agility:  4
        },
        {
            level: 6,
            xp: 626,
            maxHP: 27,
            strength:  6,
            constitution:  5,
            dexterity:  3,
            intellect:  0,
            agility:  4
        },
        {
            level: 7,
            xp: 901,
            maxHP: 31,
            strength:  6,
            constitution:  5,
            dexterity:  3,
            intellect:  0,
            agility: 15
        },
        {
            level: 8,
            xp: 1226,
            maxHP: 36,
            strength:  6,
            constitution:  5,
            dexterity:  3,
            intellect:  1,
            agility:  5
        },
        {
            level: 9,
            xp: 1601,
            maxHP: 40,
            strength:  6,
            constitution:  5,
            dexterity:  3,
            intellect:  1,
            agility:  5
        },
        {
            level: 10,
            xp: 2026,
            maxHP: 42,
            strength:  7,
            constitution:  5,
            dexterity:  3,
            intellect:  1,
            agility:  6
        },
        {
            level: 11,
            xp: 2501,
            maxHP: 44,
            strength:  7,
            constitution:  5,
            dexterity:  3,
            intellect:  1,
            agility:  6
        },
        {
            level: 12,
            xp: 3026,
            maxHP: 46,
            strength:  7,
            constitution:  6,
            dexterity:  3,
            intellect:  1,
            agility:  6
        },
        {
            level: 13,
            xp: 3601,
            maxHP: 48,
            strength:  7,
            constitution:  6,
            dexterity:  3,
            intellect:  1,
            agility:  7
        },
        {
            level: 14,
            xp: 4226,
            maxHP: 50,
            strength:  7,
            constitution:  6,
            dexterity:  4,
            intellect:  1,
            agility:  7
        },
        {
            level: 15,
            xp: 4901,
            maxHP: 52,
            strength:  7,
            constitution:  6,
            dexterity:  4,
            intellect:  1,
            agility:  7
        },
        {
            level: 16,
            xp: 5626,
            maxHP: 54,
            strength:  7,
            constitution:  6,
            dexterity:  4,
            intellect:  2,
            agility:  8
        },
        {
            level: 17,
            xp: 6401,
            maxHP: 56,
            strength:  7,
            constitution:  6,
            dexterity:  4,
            intellect:  2,
            agility:  8
        },
        {
            level: 18,
            xp: 7226,
            maxHP: 58,
            strength:  8,
            constitution:  6,
            dexterity:  4,
            intellect:  2,
            agility:  8
        },
        {
            level: 19,
            xp: 8101,
            maxHP: 60,
            strength:  8,
            constitution:  6,
            dexterity:  4,
            intellect:  2,
            agility:  9
        },
        {
            level: 20,
            xp: 9026,
            maxHP: 62,
            strength:  8,
            constitution:  7,
            dexterity:  4,
            intellect:  2,
            agility:  9
        },
    ]
};

interface IAdvancementBlock {
    level: number;
    xp: number;
    maxHP: number;
    strength: number;
    constitution: number;
    dexterity: number;
    intellect: number;
    agility: number;
}

export default Warrior;