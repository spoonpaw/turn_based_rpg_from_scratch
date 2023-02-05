import GameDatabase, {IPlayer} from '../classes/GameDatabase';

export default class SaveAndLoadScene extends Phaser.Scene {
    public db!: GameDatabase;
    constructor() {
        super('SaveAndLoad');
    }


    create() {
        this.db = new GameDatabase();
        this.openDB();
    }

    upsertPlayer(player: IPlayer) {
        this.db.open().then(db => {
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
            console.log(`error occurred: ${err}`);
        }
    }
}