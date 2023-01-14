import {DBSchema, IDBPDatabase, openDB} from 'idb';

interface GameDB extends DBSchema{

    player: {
        value: {
            name: string;
            id?: number
        };
        key: number;
    };
}

export default class SaveAndLoadScene extends Phaser.Scene{
    private playerStoreNameExists = false;
    private entriesFoundInPlayerStore = false;
    constructor() {
        super('SaveAndLoad');
    }

    create() {
        this.getDBAndAddPlayerObjectStore();
    }

    async getDBAndAddPlayerObjectStore() {
        // open a database
        const db = await openDB<GameDB>(
            'game-db',
            1,
            {
                upgrade(db: IDBPDatabase<GameDB>) {
                    db.createObjectStore('player', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                }
            }
        );

        this.playerStoreNameExists = db.objectStoreNames.contains('player');
        const tx = db.transaction('player', 'readwrite');
        const store = tx.objectStore('player');
        const val = (await store.get(0));
        this.entriesFoundInPlayerStore = !!val;

    }

    async createNewPlayer(name: string) {

        const db = await openDB<GameDB>(
            'game-db',
            1
        );
        await db.add(
            'player',
            {
                name
            }
        );

    }
}