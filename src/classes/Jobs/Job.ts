import {IBaseStatBlock, IStatIncreases} from '../../types/Advancement';

export class Job {
    public name: string;
    public baseStats: IBaseStatBlock;
    public statIncreases: IStatIncreases;

    constructor(name: string, baseStats: IBaseStatBlock, statIncreases: IStatIncreases) {
        this.name = name;
        this.baseStats = baseStats;
        this.statIncreases = statIncreases;
    }
}