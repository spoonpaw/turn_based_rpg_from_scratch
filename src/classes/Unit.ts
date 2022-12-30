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

    // abstract applyHPChange(hpChangeAmount: number): number;

    abstract getInitiative(): number;

    abstract updateSceneOnReceivingDamage(): void;


    public getCombinedStat(stat: keyof typeof this.stats): number {
        const baseStat = this.stats[stat];
        let weaponBonus = 0;
        if (this.equipment.weapon) {
            weaponBonus += this.equipment.weapon.stats![stat as keyof typeof this.equipment.weapon.stats];
        }

        let headBonus = 0;
        if (this.equipment.head) {
            headBonus += this.equipment.head.stats![stat as keyof typeof this.equipment.head.stats];
        }

        let bodyBonus = 0;
        if (this.equipment.body) {
            bodyBonus += this.equipment.body.stats![stat as keyof typeof this.equipment.body.stats];
        }

        let offHandBonus = 0;
        if (this.equipment.offhand) {
            offHandBonus += this.equipment.offhand.stats![stat as keyof typeof this.equipment.offhand.stats];
        }

        const totalEquipmentBonus = weaponBonus + headBonus + bodyBonus + offHandBonus;

        if (stat === 'defense') {
            return (this.stats.agility / 2) + totalEquipmentBonus;
        }

        return baseStat + totalEquipmentBonus;
    }


    applyHPChange(hpChangeAmount: number, hpText: Phaser.GameObjects.Text) {
        const initialCharacterHP = this.stats.currentHP;

        // handle healing hp change (negative hp change signifies healing)
        if (hpChangeAmount < 0) {
            this.stats.currentHP = Math.min(this.stats.maxHP, this.stats.currentHP - hpChangeAmount);
        }

        // apply damage
        else {
            // handle the math of taking damage,
            this.stats.currentHP -= hpChangeAmount;
            this.updateSceneOnReceivingDamage();
        }

        if (this.stats.currentHP <= 0) {
            this.stats.currentHP = 0;
            this.living = false;
        }

        // setting up the ui hp
        hpText.setText(`HP: ${this.stats.currentHP}/${this.stats.maxHP}`);

        // return actual hp change
        return this.stats.currentHP - initialCharacterHP;
    }
}