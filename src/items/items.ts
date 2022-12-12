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
        name: 'Cypress Stick',
        description: 'A sturdy walking staff.',
        key: 'staffbutton',
        activekey: 'staffbuttonactive',
        type: 'weapon',
        cost: 3,
        classes: ['all'],
        stats: {
            strength: 100,
            agility: 0,
            vitality: 0,
            intellect: 0,
            luck: 0
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
    };
    type: string;

}