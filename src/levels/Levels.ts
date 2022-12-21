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
                x: 4,
                y: 16
            }
        ],
        npcs: [],
        enemies: ['seedspiker', 'sentientrock', 'deadlyflower'],
        // enemies: ['seedspiker'],
        music: 'title'
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
                    }) as ItemInterface
                ]
            },
            {
                name: 'armormerchant',
                x: 5,
                y: 8,
                inventory: [
                    items.find(obj => {
                        return obj.name === 'Synthetic Weave Tunic';
                    }) as ItemInterface
                ]
            }
        ],
        music: 'town'
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