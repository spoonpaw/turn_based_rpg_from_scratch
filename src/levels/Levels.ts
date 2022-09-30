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
        enemies: ['seedspiker', 'sentientrock', 'deadlyflower']
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
            }
        ]
    }
};

export interface ILevelData {
    name: string,
    tilemapKey: string,
    tilesetName: string,
    tilesetKey: string,
    spawnCoords: {name: string, x: number, y: number}[],
    npcs: {name: string, x: number, y: number}[],
    enemies?: string[]
}

export interface ILevelDataContainer {
    [key: string]: ILevelData;
}