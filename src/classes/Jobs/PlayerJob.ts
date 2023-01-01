import {IAbilityAttainment, IBaseStatBlock, IStatIncreases} from '../../types/Advancement';
import { Job } from './Job';

export class PlayerJob extends Job {
    constructor(
        name: string,
        properName: string,
        advancement: IBaseStatBlock,
        statIncreases: IStatIncreases,
        skills: IAbilityAttainment[]
    ) {
        super(name, properName, advancement, statIncreases, skills);
    }
}