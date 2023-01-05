import {abilities, IAbility} from '../abilities/abilities';
import {MonsterJob} from '../classes/Jobs/MonsterJob';
import MonsterSoldier from '../jobs/monsters/MonsterSoldier';
import Stats from '../stats/Stats';

export const enemies: enemyArray = [
    {
        name: 'Seed Spiker',
        key: 'seedspiker',
        level: 1,
        experience: 4,
        gold: 3,
        stats: {
            strength: 7,
            agility: 4,
            vitality: 4,
            intellect: 0,
            luck: 0,
            currentHP: 8,
            maxHP: 8,
            currentResource: 100,
            maxResource: 100,
            attack: 7,
            defense: 3
        },
        job: MonsterSoldier,
        skills: [
            abilities.find((obj) => {
                return obj.name === 'Spiky Seeds';
            }) as IAbility
        ]
    },
    {
        name: 'Sentient Rock',
        key: 'sentientrock',
        level: 1,
        experience: 6,
        gold: 4,
        stats: {
            strength: 10,
            agility: 6,
            vitality: 5,
            intellect: 0,
            luck: 0,
            currentHP: 10,
            maxHP: 10,
            currentResource: 100,
            maxResource: 100,
            attack: 10,
            defense: 6
        },
        job: MonsterSoldier
    },
    {
        name: 'Deadly Flower',
        key: 'deadlyflower',
        level: 2,
        experience: 8,
        gold: 5,
        stats: {
            strength: 12,
            agility: 5,
            vitality: 5,
            intellect: 0,
            luck: 0,
            currentHP: 10,
            maxHP: 10,
            currentResource: 100,
            maxResource: 100,
            attack: 12,
            defense: 8
        },
        job: MonsterSoldier
    }
];

type enemyArray = {
    name: string,
    key: string,
    level: number,
    experience: number,
    gold: number,
    stats: Stats,
    job: MonsterJob
    skills?: IAbility[]
}[];