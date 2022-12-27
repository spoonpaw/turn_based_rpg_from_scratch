import BattleScene from '../scenes/BattleScene';
import GameScene from '../scenes/GameScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import Unit from './Unit';

export default class BotCharacter extends Unit {
    public damageTween!: Phaser.Tweens.Tween | Phaser.Tweens.Tween[];
    public equipment: Equipment = {
        body: undefined,
        head: undefined,
        offhand: undefined,
        weapon: undefined
    };
    public stats!: Stats;
    public type!: string;

    constructor(
        scene: BattleScene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        name: string
    ) {
        super(
            scene,
            x,
            y,
            texture,
            frame,
            name
        );
        this.gameScene = <GameScene>this.scene.scene.get('Game');

        // TODO: there needs to be a logical want of figuring
        //  out which bot this list is meant to reflect.
        //  for now we can just use this this.gameScene.bots[0]
        this.stats = this.gameScene.bots[0].stats;
        this.type = this.gameScene.bots[0].type;

        this.setScale(1.5);

        // TODO: setup pointerdown listeners for healing, items...
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    applyHPChange(hpChangeAmount: number): number {
        return 0;
    }

    getInitiative(): number {
        return 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    updateSceneOnReceivingDamage(): void {
    }

}