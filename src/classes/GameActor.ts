import Soldier from '../jobs/Soldier';
import Stats from '../stats/Stats';

export default class GameActor {
    protected createStats(job: string) {
        if (job === 'Soldier') {
            return new Stats(
                Soldier.advancement[0].strength,
                Soldier.advancement[0].agility,
                Soldier.advancement[0].vitality,
                Soldier.advancement[0].intellect,
                Soldier.advancement[0].luck,
                Soldier.advancement[0].vitality * 2,
                Soldier.advancement[0].vitality * 2,
                Soldier.advancement[0].intellect * 2,
                Soldier.advancement[0].intellect * 2,
                Soldier.advancement[0].strength,
                Soldier.advancement[0].agility / 2
            );
        }
        else {
            return new Stats(
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
            );
        }
    }
}