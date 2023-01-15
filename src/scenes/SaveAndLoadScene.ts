import GameDatabase from '../classes/GameDatabase';

export default class SaveAndLoadScene extends Phaser.Scene {
    private db!: GameDatabase;
    constructor() {
        super('SaveAndLoad');
    }


    create() {
        this.db = new GameDatabase();
        this.openDB();
    }

    upsertPlayer(name: string) {
        this.db.open().then(db => {
            const player = {id: 0, name};
            db.table('players').put(player);
        }).catch(err => {
            console.log(`error occurred: ${err}`);
        });
    }

    private openDB() {
        this.db.open();
    }

    public async getPlayers() {
        try {
            const db = await this.db.open();
            return db.table('players').toArray();
        }
        catch (err) {
            console.log(`error occurred: ${err}`);
        }
    }
    public async getPlayerByIndex(index: number) {
        try {
            const db = await this.db.open();
            const players = await db.table('players').toArray();
            return players[index];
        }
        catch (err) {
            console.log(`Error occurred: ${err}`);
        }
    }

}