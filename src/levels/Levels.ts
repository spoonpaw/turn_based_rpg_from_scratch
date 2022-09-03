export const levels = {
    overworld: {
        name: 'overworld',
        tilemapKey: 'overworld-map',
        tilesetName: 'Basic Tiles',
        tilesetKey: 'tiles',
        spawnCoords: {
            town: {
                x: 4,
                y: 16
            }
        }
    },
    town: {
        tilemapKey: 'town-map',
        tilesetName: 'Basic Tiles',
        tilesetKey: 'tiles',
        spawnCoords: {
            overworld: {
                x: 1,
                y: 1
            }
        },
        npcs: {
            innkeeper: {
                x: 6,
                y: 2
            }
        }

    }
};