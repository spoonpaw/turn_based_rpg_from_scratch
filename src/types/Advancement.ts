
export interface IStatIncreases {
    agility: { range: [number, number], increment: number }[];
    intellect: { range: [number, number], increment: number }[];
    luck: { range: [number, number], increment: number }[];
    strength: { range: [number, number], increment: number }[];
    vitality: { range: [number, number], increment: number }[];
}

export interface IBaseStatBlock {
    agility: number;
    intellect: number;
    level: number;
    luck: number;
    strength: number;
    vitality: number;
    xp: number;
}

export interface IAbilityAttainment {
    name: string;
    description: string;
    type: string;
    targets: string|string[];
    levelAttained: number;
    key: string;
    activeKey: string;
}