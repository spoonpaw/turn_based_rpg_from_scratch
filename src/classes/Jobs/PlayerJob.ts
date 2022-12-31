import {IBaseStatBlock, IStatIncreases} from '../../types/Advancement';
import { Job } from './Job';

export class PlayerJob extends Job {
    constructor(
        name: string,
        advancement: IBaseStatBlock,
        statIncreases: IStatIncreases,
    ) {
        super(name, advancement, statIncreases);
    }
}