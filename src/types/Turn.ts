import Unit from '../classes/Unit';

export interface Turn {
    actor: Unit,
    target: Unit,
    actionName: string,
    targetHpChange: number,
    critical: boolean,
    targetKilled: boolean,
    evade: boolean
}