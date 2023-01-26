export const items: itemArray = [
    {
        name: 'Health Potion',
        description: 'Heals a friendly target for 30 HP.',
        key: 'healthpotion',
        activekey: 'healthpotionactive',
        type: 'consumable',
        hpchange: 30,
        cost: 10,
        sellPrice: 6
    },
    {
        name: 'Cypressium Staff',
        description: 'A well-worn cypressium staff, able to extend to fit any situation.',
        key: 'staffbutton',
        activekey: 'staffbuttonactive',
        type: 'weapon',
        cost: 20,
        sellPrice: 12,
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
        classes: 'Soldier',
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
        cost: 35,
        sellPrice: 18,
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
        classes: 'Soldier/Healer',
        minimumLevel: 1,
        stats: {
            strength: 0,
            agility: 0,
            vitality: 0,
            intellect: 0,
            luck: 0,
            defense: 12
        }
    },
    {
        name: 'Oaksteel Shield',
        description: 'A sturdy shield crafted from the tough exterior of a long dead tree lord.',
        key: 'shieldbutton1',
        activekey: 'shieldbuttonactive1',
        type: 'offhand',
        cost: 40,
        sellPrice: 22,
        classes: 'Soldier',
        minimumLevel: 1,
        stats: {
            strength: 0,
            agility: 0,
            vitality: 0,
            intellect: 0,
            luck: 0,
            defense: 2
        }
    },
    {
        name: 'Hi-Tek Monocle',
        description: 'A sleek, high-tech monocle that adds a touch of sophistication to any outfit.',
        key: 'monoclebutton',
        activekey: 'monoclebuttonactive',
        type: 'helmet',
        cost: 30,
        sellPrice: 18,
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
        name: 'Faded Armband',
        description: 'A fashionable piece of clothing that offers little in the way of actual benefit.',
        key: 'armbandbutton',
        activekey: 'armbandbuttonactive',
        type: 'offhand',
        cost: 15,
        sellPrice: 8,
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
    }
];

export type itemArray = ItemInterface[];

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
    type: 'consumable' | 'weapon' | 'bodyarmor' | 'offhand' | 'helmet';

}