import Phaser from 'phaser';

import BattleScene from '../scenes/BattleScene';
import BattleUIScene from '../scenes/BattleUIScene';
import GameScene from '../scenes/GameScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import Item from './Item';


export default abstract class Unit extends Phaser.GameObjects.Sprite {
    abstract damageTween: Phaser.Tweens.Tween | Phaser.Tweens.Tween[];
    public equipment: Equipment = {
        body: undefined,
        head: undefined,
        offhand: undefined,
        weapon: undefined
    };
    public inventory: Item[] = [];
    public living: boolean;
    abstract stats: Stats;
    abstract type: string;
    protected battleScene: BattleScene;
    protected battleUIScene: BattleUIScene;
    protected gameScene: GameScene;

    protected constructor(
        public scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        public name: string
    ) {
        super(scene, x, y, texture, frame);

        // get reference to game scene
        this.gameScene = <GameScene>this.scene.scene.get('Game');
        this.battleScene = <BattleScene>this.scene.scene.get('Battle');
        this.battleUIScene = <BattleUIScene>this.scene.scene.get('BattleUI');

        this.living = true;
    }

    abstract applyHPChange(hpChangeAmount: number): number;

    abstract getInitiative(): number;

    abstract updateSceneOnReceivingDamage(): void;

}