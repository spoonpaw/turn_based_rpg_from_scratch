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
            currentMP: 0,
            maxMP: 0,
            attack: 7,
            defense: 3
        }
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
            currentMP: 0,
            maxMP: 0,
            attack: 10,
            defense: 6
        }
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
            currentMP: 0,
            maxMP: 0,
            attack: 12,
            defense: 8
        }
    }
];

type enemyArray = {
    name: string,
    key: string,
    level: number,
    experience: number,
    gold: number,
    stats: Stats
}[];