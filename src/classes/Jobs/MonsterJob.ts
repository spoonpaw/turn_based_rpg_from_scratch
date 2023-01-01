import {IAbilityAttainment, IBaseStatBlock, IStatIncreases} from '../../types/Advancement';
import { Job } from './Job';

export class MonsterJob extends Job {

    constructor(
        name: string,
        properName: string,
        baseStats: IBaseStatBlock,
        statIncreases: IStatIncreases,
        skills: IAbilityAttainment[]
    ) {
        super(name, properName, baseStats, statIncreases, skills);
    }
}