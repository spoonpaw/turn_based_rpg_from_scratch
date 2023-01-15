import Dexie from 'dexie';

export default class GameDatabase extends Dexie {
    // Declare implicit table properties.
    // (just to inform Typescript. Instantiated by Dexie in stores() method)
    contacts!: Dexie.Table<IPlayer, number>; // number = type of the primkey
    //...other tables goes here...

    constructor () {
        super('GameDatabase');
        this.version(1).stores({
            players: 'id, name',
            //...other tables goes here...
        });
    }
}

interface IPlayer {
    id?: number,
    name: string,
    gold: number
}