const Warrior = {
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
            hp: 8,
            str: 15,
            con: 14,
            dex: 12,
            int: 10,
            agi: 13
        },
        {
            level: 2,
            xp: 26,
            hp: 10,
            str: 16,
            con: 14,
            dex: 12,
            int: 10,
            agi: 13
        },
        {
            level: 3,
            xp: 101,
            hp: 13,
            str: 16,
            con: 14,
            dex: 12,
            int: 10,
            agi: 13
        },
        {
            level: 4,
            xp: 226,
            hp: 18,
            str: 16,
            con: 15,
            dex: 12,
            int: 10,
            agi: 14
        },
        {
            level: 5,
            xp: 401,
            hp: 22,
            str: 16,
            con: 15,
            dex: 12,
            int: 10,
            agi: 14
        },
        {
            level: 6,
            xp: 626,
            hp: 27,
            str: 16,
            con: 15,
            dex: 13,
            int: 10,
            agi: 14
        },
        {
            level: 7,
            xp: 901,
            hp: 31,
            str: 16,
            con: 15,
            dex: 13,
            int: 10,
            agi: 15
        },
        {
            level: 8,
            xp: 1226,
            hp: 36,
            str: 16,
            con: 15,
            dex: 13,
            int: 11,
            agi: 15
        },
        {
            level: 9,
            xp: 1601,
            hp: 40,
            str: 16,
            con: 15,
            dex: 13,
            int: 11,
            agi: 15
        },
        {
            level: 10,
            xp: 2026,
            hp: 42,
            str: 17,
            con: 15,
            dex: 13,
            int: 11,
            agi: 16
        },
        {
            level: 11,
            xp: 2501,
            hp: 44,
            str: 17,
            con: 15,
            dex: 13,
            int: 11,
            agi: 16
        },
        {
            level: 12,
            xp: 3026,
            hp: 46,
            str: 17,
            con: 16,
            dex: 13,
            int: 11,
            agi: 16
        },
        {
            level: 13,
            xp: 3601,
            hp: 48,
            str: 17,
            con: 16,
            dex: 13,
            int: 11,
            agi: 17
        },
        {
            level: 14,
            xp: 4226,
            hp: 50,
            str: 17,
            con: 16,
            dex: 14,
            int: 11,
            agi: 17
        },
        {
            level: 15,
            xp: 4901,
            hp: 52,
            str: 17,
            con: 16,
            dex: 14,
            int: 11,
            agi: 17
        },
        {
            level: 16,
            xp: 5626,
            hp: 54,
            str: 17,
            con: 16,
            dex: 14,
            int: 12,
            agi: 18
        },
        {
            level: 17,
            xp: 6401,
            hp: 56,
            str: 17,
            con: 16,
            dex: 14,
            int: 12,
            agi: 18
        },
        {
            level: 18,
            xp: 7226,
            hp: 58,
            str: 18,
            con: 16,
            dex: 14,
            int: 12,
            agi: 18
        },
        {
            level: 19,
            xp: 8101,
            hp: 60,
            str: 18,
            con: 16,
            dex: 14,
            int: 12,
            agi: 19
        },
        {
            level: 20,
            xp: 9026,
            hp: 62,
            str: 18,
            con: 17,
            dex: 14,
            int: 12,
            agi: 19
        },
    ]
};

export default Warrior;