import {ItemInterface, items} from '../items/items';

export const levels: ILevelDataContainer = {
    overworld: {
        name: 'overworld',
        tilemapKey: 'overworld-map',
        tilesetName: 'Basic Tiles',
        tilesetKey: 'tiles',
        spawnCoords: [
            {
                name: 'town',
                x: 3,
                y: 16
            }
        ],
        npcs: [],
        enemies: ['seedspiker', 'sentientrock', 'deadlyflower'],
        music: 'overworld'
    },
    town: {
        name: 'town',
        tilemapKey: 'town-map',
        tilesetName: 'Basic Tiles',
        tilesetKey: 'tiles',
        spawnCoords: [
            {
                name: 'overworld',
                x: 1,
                y: 1
            }
        ],
        npcs: [
            {
                name: 'innkeeper',
                x: 6,
                y: 2
            },
            {
                name: 'weaponmerchant',
                x: 12,
                y: 2,
                inventory: [
                    items.find(obj => {
                        return obj.name === 'Cypressium Staff';
                    }) as ItemInterface,
                    items.find(obj => {
                        return obj.name === 'Galenite Blade';
                    }) as ItemInterface,
                ]
            },
            {
                name: 'armormerchant',
                x: 5,
                y: 8,
                inventory: [
                    items.find(obj => {
                        return obj.name === 'Synthjute Tunic';
                    }) as ItemInterface,
                    items.find(obj => {
                        return obj.name === 'Scrap Cloak';
                    }) as ItemInterface,
                    items.find(obj => {
                        return obj.name === 'Chitinous Vest';
                    }) as ItemInterface,
                    items.find(obj => {
                        return obj.name === 'Faded Armband';
                    }) as ItemInterface,
                    items.find(obj => {
                        return obj.name === 'Oaksteel Shield';
                    }) as ItemInterface,
                    items.find(obj => {
                        return obj.name === 'Hi-Tek Monocle';
                    }) as ItemInterface,
                ]
            },
            {
                name: 'itemmerchant',
                x: 12,
                y: 8,
                inventory: [
                    items.find(obj => {
                        return obj.name === 'Health Potion';
                    }) as ItemInterface
                ]
            },
            {
                name: 'botscientist',
                x: 5,
                y: 14,
            }
        ],
        music: 'town',
        containers: [],
    }
};

export interface ILevelData {
    enemies?: string[];
    name: string;
    npcs: {
        name: string;
        x: number;
        y: number;
        inventory?: ItemInterface[];
    }[];
    containers?: {
        x: number;
        y: number;
        inventory: ItemInterface[];
    }[]
    spawnCoords: {
        name: string;
        x: number;
        y: number;
    }[];
    tilemapKey: string;
    tilesetKey: string;
    tilesetName: string;
    music: string;
}

export interface ILevelDataContainer {
    [key: string]: ILevelData;
}