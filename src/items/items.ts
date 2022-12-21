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
        cost: 3,
        classes: ['all'],
        stats: {
            strength: 1,
            agility: 0,
            vitality: 0,
            intellect: 0,
            luck: 0,
            defense: 0
        }
    },
    {
        name: 'Synthetic Weave Tunic',
        description: 'A tunic made from a flimsy recycled material that provides minimal protection.',
        key: 'bagbutton',
        activekey: 'bagbuttonactive',
        type: 'bodyarmor',
        cost: 10,
        classes: ['all'],
        stats: {
            strength: 0,
            agility: 0,
            vitality: 0,
            intellect: 0,
            luck: 0,
            defense: 4
        }
    }
];

type itemArray = ItemInterface[];

export interface ItemInterface {
    activekey: string;
    classes?: string[];
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