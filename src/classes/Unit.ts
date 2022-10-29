import Stats from '../stats/Stats';
import GameScene from '../scenes/GameScene';
import {Turn} from '../types/Turn';

export default abstract class Unit extends Phaser.GameObjects.Sprite {
    public living: boolean;
    abstract stats: Stats;
    abstract damageTween: Phaser.Tweens.Tween;
    protected gameScene: GameScene;
    abstract type: string;

    protected constructor(
        public scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined
    ) {
        super(scene, x, y, texture, frame);

        // get reference to game scene
        this.gameScene = <GameScene>this.scene.scene.get('Game');

        this.living = true;
    }

    abstract takeDamage(damage: number): void;

    abstract getInitiative(): number;

    abstract updateSceneOnReceivingDamage(): void;

    abstract calculateAttack(target: Unit): Turn | void;

    abstract processTurn(turn: Turn): void;
}