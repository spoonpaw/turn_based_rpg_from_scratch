import {IAbilityAttainment, IBaseStatBlock, IStatIncreases} from '../../types/Advancement';

export class Job {

    constructor(
        public name: string,
        public properName: string,
        public baseStats: IBaseStatBlock,
        public statIncreases: IStatIncreases,
        public skills: IAbilityAttainment[]
    ) {
    }
}