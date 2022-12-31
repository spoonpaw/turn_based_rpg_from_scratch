export const items: itemArray = [
    {
        name: 'Health Potion',
        description: 'Heals a friendly target for 30 HP.',
        key: 'healthpotion',
        activekey: 'healthpotionactive',
        type: 'consumable',
        hpchange: 30,
        cost: 8,
        sellPrice: 6
    },
    {
        name: 'Cypressium Staff',
        description: 'A well-worn cypressium staff, able to extend to fit any situation.',
        key: 'staffbutton',
        activekey: 'staffbuttonactive',
        type: 'weapon',
        cost: 12,
        sellPrice: 7,
        classes: 'All',
        minimumLevel: 1,
        stats: {
            strength: 2,
            agility: 0,
            vitality: 0,
            intellect: 0,
            luck: 0,
            defense: 0
        }
    },
    {
        name: 'Galenite Blade',
        description: 'An unassuming sword made from a durable, pseudochromatic mineral.',
        key: 'chromaticsword',
        activekey: 'chromaticswordactive',
        type: 'weapon',
        cost: 250,
        sellPrice: 130,
        classes: 'All',
        minimumLevel: 1,
        stats: {
            strength: 5,
            agility: 0,
            vitality: 0,
            intellect: 0,
            luck: 0,
            defense: 0
        }
    },
    {
        name: 'Synthjute Tunic',
        description: 'A tunic woven from a flimsy synthetic material that provides minimal protection.',
        key: 'synthjutetunic',
        activekey: 'synthjutetunicactive',
        type: 'bodyarmor',
        cost: 6,
        sellPrice: 4,
        classes: 'All',
        minimumLevel: 1,
        stats: {
            strength: 0,
            agility: 0,
            vitality: 0,
            intellect: 0,
            luck: 0,
            defense: 1
        }
    },
    {
        name: 'Scrap Cloak',
        description: 'A cloak made from various scraps and recycled fibers for enhanced durability.',
        key: 'scrapcloak',
        activekey: 'scrapcloakactive',
        type: 'bodyarmor',
        cost: 90,
        sellPrice: 50,
        classes: 'All',
        minimumLevel: 1,
        stats: {
            strength: 0,
            agility: 0,
            vitality: 0,
            intellect: 0,
            luck: 0,
            defense: 8
        }
    },
    {
        name: 'Chitinous Vest',
        description: 'A lightweight, durable vest made from an oversized insect\'s exoskeleton.',
        key: 'armorbutton',
        activekey: 'armorbuttonactive',
        type: 'bodyarmor',
        cost: 150,
        sellPrice: 80,
        classes: 'PlayerSoldier/Healer',
        minimumLevel: 1,
        stats: {
            strength: 0,
            agility: 0,
            vitality: 0,
            intellect: 0,
            luck: 0,
            defense: 12
        }
    }
];

type itemArray = ItemInterface[];

export interface ItemInterface {
    minimumLevel?: number;
    activekey: string;
    classes?: string;
    cost: number;
    sellPrice: number;
    description: string;
    hpchange?: number;
    key: string;
    name: string;
    stats?: {
        strength: number;
        agility: number;
        vitality: number;
        intellect: number;
        luck: number;
        defense: number;
    };
    type: string;

}