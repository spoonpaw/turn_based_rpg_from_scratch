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
    // stat priority (in order of importance): strengthength, stamina, agilitylity, dexterityterity, intellectellect
    // three levels of stat increase: 3 pointellects per level, 2 pointellects per level, 1 pointellect per level
    // level up:
    advancement: [
        {
            level: 1,
            xp: 0,
            maxHP: 8,
            strength: 15,
            constitution: 14,
            dexterity: 12,
            intellect: 10,
            agility: 13
        },
        {
            level: 2,
            xp: 26,
            maxHP: 10,
            strength: 16,
            constitution: 14,
            dexterity: 12,
            intellect: 10,
            agility: 13
        },
        {
            level: 3,
            xp: 101,
            maxHP: 13,
            strength: 16,
            constitution: 14,
            dexterity: 12,
            intellect: 10,
            agility: 13
        },
        {
            level: 4,
            xp: 226,
            maxHP: 18,
            strength: 16,
            constitution: 15,
            dexterity: 12,
            intellect: 10,
            agility: 14
        },
        {
            level: 5,
            xp: 401,
            maxHP: 22,
            strength: 16,
            constitution: 15,
            dexterity: 12,
            intellect: 10,
            agility: 14
        },
        {
            level: 6,
            xp: 626,
            maxHP: 27,
            strength: 16,
            constitution: 15,
            dexterity: 13,
            intellect: 10,
            agility: 14
        },
        {
            level: 7,
            xp: 901,
            maxHP: 31,
            strength: 16,
            constitution: 15,
            dexterity: 13,
            intellect: 10,
            agility: 15
        },
        {
            level: 8,
            xp: 1226,
            maxHP: 36,
            strength: 16,
            constitution: 15,
            dexterity: 13,
            intellect: 11,
            agility: 15
        },
        {
            level: 9,
            xp: 1601,
            maxHP: 40,
            strength: 16,
            constitution: 15,
            dexterity: 13,
            intellect: 11,
            agility: 15
        },
        {
            level: 10,
            xp: 2026,
            maxHP: 42,
            strength: 17,
            constitution: 15,
            dexterity: 13,
            intellect: 11,
            agility: 16
        },
        {
            level: 11,
            xp: 2501,
            maxHP: 44,
            strength: 17,
            constitution: 15,
            dexterity: 13,
            intellect: 11,
            agility: 16
        },
        {
            level: 12,
            xp: 3026,
            maxHP: 46,
            strength: 17,
            constitution: 16,
            dexterity: 13,
            intellect: 11,
            agility: 16
        },
        {
            level: 13,
            xp: 3601,
            maxHP: 48,
            strength: 17,
            constitution: 16,
            dexterity: 13,
            intellect: 11,
            agility: 17
        },
        {
            level: 14,
            xp: 4226,
            maxHP: 50,
            strength: 17,
            constitution: 16,
            dexterity: 14,
            intellect: 11,
            agility: 17
        },
        {
            level: 15,
            xp: 4901,
            maxHP: 52,
            strength: 17,
            constitution: 16,
            dexterity: 14,
            intellect: 11,
            agility: 17
        },
        {
            level: 16,
            xp: 5626,
            maxHP: 54,
            strength: 17,
            constitution: 16,
            dexterity: 14,
            intellect: 12,
            agility: 18
        },
        {
            level: 17,
            xp: 6401,
            maxHP: 56,
            strength: 17,
            constitution: 16,
            dexterity: 14,
            intellect: 12,
            agility: 18
        },
        {
            level: 18,
            xp: 7226,
            maxHP: 58,
            strength: 18,
            constitution: 16,
            dexterity: 14,
            intellect: 12,
            agility: 18
        },
        {
            level: 19,
            xp: 8101,
            maxHP: 60,
            strength: 18,
            constitution: 16,
            dexterity: 14,
            intellect: 12,
            agility: 19
        },
        {
            level: 20,
            xp: 9026,
            maxHP: 62,
            strength: 18,
            constitution: 17,
            dexterity: 14,
            intellect: 12,
            agility: 19
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