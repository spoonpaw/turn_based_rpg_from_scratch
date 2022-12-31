import {IBaseStatBlock, IStatIncreases} from '../../types/Advancement';
import { Job } from './Job';

export class MonsterJob extends Job {

    constructor(
        name: string,
        baseStats: IBaseStatBlock,
        statIncreases: IStatIncreases
    ) {
        super(name, baseStats, statIncreases);
    }
}