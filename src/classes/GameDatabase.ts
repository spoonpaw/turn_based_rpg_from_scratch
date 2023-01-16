import Dexie from 'dexie';

import {IAbility} from '../abilities/abilities';
import Stats from '../stats/Stats';
import {Direction} from '../types/Direction';
import Item from './Item';

interface Unit {
    name: string,
    id: number,
    key: string,
    stats: Stats,
    equipment: {
        body: Item,
        head: Item,
        offhand: Item,
        weapon: Item
    },
    inventory: Item[],
    living: boolean,
    actorType: string
}

export interface IPlayer {
    id?: number,
    name: string,
    gold: number,
    experience: number,
    stats: Stats,
    bots: Array<{
        name: string,
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
        living: boolean
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
        enemies: Unit[],
        heroes: Unit[],
        passiveEffects: {
            actor: Unit,
            target: Unit,
            ability: IAbility,
            turnDurationRemaining: number
        }[],
        turnUnits: Unit[]
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