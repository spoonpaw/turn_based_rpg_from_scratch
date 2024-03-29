import {Direction} from '../types/Direction';
import {Equipment} from '../types/Equipment';

export default class GameActor {
    public equipment!: Equipment;
    // public stats!: Stats;
    constructor(
        public name: string,
        public sprite: Phaser.GameObjects.Sprite,
        public species: string,
        protected _experience: number
    ) {

    }
    // protected createStats(job: Job) {
    //     if (job.properName === 'Soldier') {
    //         return new Stats(
    //             job.baseStats.strength,
    //             job.baseStats.agility,
    //             job.baseStats.vitality,
    //             job.baseStats.intellect,
    //             job.baseStats.luck,
    //             job.baseStats.vitality * 2,
    //             job.baseStats.vitality * 2,
    //             100,
    //             100,
    //             job.baseStats.strength,
    //             job.baseStats.agility / 2
    //         );
    //     }
    //     else {
    //         return new Stats(
    //             0,
    //             0,
    //             0,
    //             0,
    //             0,
    //             0,
    //             0,
    //             0,
    //             0,
    //             0,
    //             0
    //         );
    //     }
    // }


    public stopAnimation(direction: Direction) {
        if (!this.sprite.anims) return;
        const animationManager = this.sprite.anims.animationManager;
        const standingFrame = animationManager.get(direction).frames[1].frame.name;
        this.sprite.anims.stop();
        this.sprite.setFrame(standingFrame);
    }
}