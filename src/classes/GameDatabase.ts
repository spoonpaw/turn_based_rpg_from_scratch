import Dexie from 'dexie';

import {IAbility} from '../abilities/abilities';
import Stats from '../stats/Stats';
import {Direction} from '../types/Direction';
import Item from './Item';
import {Job} from './Jobs/Job';

export interface DBUnit {
    name: string,
    job: Job,
    id: number,
    key: string,
    stats: Stats,
    equipment: {
        body: Item | undefined,
        head: Item | undefined,
        offhand: Item | undefined,
        weapon: Item | undefined
    },
    inventory: Item[],
    actorType: string,
}

export interface IPlayer {
    id?: number,
    name: string,
    job: Job,
    gold: number,
    experience: number,
    stats: Stats,
    bots: Array<{
        name: string,
        job: Job,
        experience: number,
        stats: Stats,
        texture: string,
        position: Phaser.Math.Vector2,
        facing: Direction,
        inCombat: boolean,
        species: string,
        equipment: {
            body: Item | undefined,
            head: Item | undefined,
            offhand: Item | undefined,
            weapon: Item | undefined
        },
        inventory: Item[],
        // living: boolean
    }>,
    equipment: {
        body: Item | undefined,
        head: Item | undefined,
        offhand: Item | undefined,
        weapon: Item | undefined
    },
    inventory: Item[],
    texture: string,
    position: Phaser.Math.Vector2,
    facing: Direction,
    inCombat: boolean,
    combatState: {
        enemies: DBUnit[],
        heroes: DBUnit[],
        passiveEffects: {
            actor: DBUnit,
            target: DBUnit,
            ability: IAbility,
            turnDurationRemaining: number
        }[],
        units: DBUnit[],
        roundUnits: DBUnit[],
        turnIndex: number,
        roundIndex: number,
        action: string,
        target: DBUnit | undefined,
        actionType: string
        escaped: boolean | undefined
    },
    currentTilemap: string
}

export default class GameDatabase extends Dexie {
    players!: Dexie.Table<IPlayer, number>;

    constructor() {
        super('GameDatabase');
        this.version(2).stores({
            players: 'id, name, gold, experience, stats, bots, equipment, inventory, texture, position, facing, inCombat, combatState, currentTilemap'
        });
    }
}