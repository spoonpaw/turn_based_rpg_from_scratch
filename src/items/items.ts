export const items: itemArray = [
    {
        name: 'Health Potion',
        description: 'Heals a friendly target for 30 HP.',
        key: 'healthpotion',
        activekey: 'healthpotionactive',
        type: 'consumable',
        hpchange: 30,
        cost: 3,
    },
    {
        name: 'Cypressium Staff',
        description: 'A well-worn cypressium staff, able to extend to fit any situation.',
        key: 'staffbutton',
        activekey: 'staffbuttonactive',
        type: 'weapon',
        cost: 12,
        classes: 'All',
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
        name: 'Synthjute Tunic',
        description: 'A tunic woven from a flimsy synthetic material that provides minimal protection.',
        key: 'bagbutton',
        activekey: 'bagbuttonactive',
        type: 'bodyarmor',
        cost: 6,
        classes: 'All',
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
        key: 'bagbutton',
        activekey: 'bagbuttonactive',
        type: 'bodyarmor',
        cost: 90,
        classes: 'All',
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
        key: 'bagbutton',
        activekey: 'bagbuttonactive',
        type: 'bodyarmor',
        cost: 150,
        classes: 'Soldier/Healer',
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
    activekey: string;
    classes?: string;
    cost: number;
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