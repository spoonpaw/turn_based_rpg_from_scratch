import BattleScene from '../scenes/BattleScene';
import GameScene from '../scenes/GameScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import {Enemy} from './Enemy';
import PlayerCharacter from './PlayerCharacter';
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


        // TODO: setup pointerdown listeners for healing, items...
    }

    applyHPChange(hpChangeAmount: number): number {
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
        this.battleScene.player2HPText.setText(`HP: ${this.stats.currentHP}/${this.stats.maxHP}`);


        return this.stats.currentHP - initialCharacterHP;
    }

    public runTurn(): number {
        // just attack player 1
        const target = this.battleScene.enemies[0];
        if (!target.living) return 0;
        let runtimeInMS = 0;

        let damage = 0;

        if (!this.evadeTest()) {
            // target did not dodge
            this.battleScene.sfxScene.playSound('attack');
            damage = this.calculateAttackDamage(target);
            target.applyHPChange(damage);
            runtimeInMS += 2000;
            eventsCenter.emit('Message', `${this.name} attacked ${target.type} for ${damage} HP!`);

        }

        else {
            // target dodged
            this.battleScene.sfxScene.playSound('dodge');
            eventsCenter.emit('Message', `${this.name} attacked ${target.type}. ${target.type} dodged the attack!`);
            runtimeInMS += 2000;
            return runtimeInMS;
        }

        return runtimeInMS;
    }

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

    getInitiative(): number {
        return this.stats.agility * Phaser.Math.FloatBetween(0, 1);
    }

    updateSceneOnReceivingDamage(): void {
        // take care of flashing the enemy sprite if it gets damaged or hiding it if it dies.
        if (this.stats.currentHP <= 0) {
            this.setVisible(false);
        }
        else {
            this.damageTween = this.scene.tweens.add({
                targets: this,
                duration: 100,
                repeat: 3,
                alpha: 0,
                yoyo: true
            });
        }
    }

    public calculateAttackDamage(target: (PlayerCharacter | Enemy | BotCharacter)): number {
        return Math.max(
            1,
            Math.floor(
                (this.stats.strength - (target.getCombinedStat('defense') / 2)) *
                Phaser.Math.FloatBetween(
                    0.39, 0.59
                )
            )
        );
    }

    evadeTest(): boolean {
        return Phaser.Math.Between(1, 64) === 1;
    }

    criticalStrikeTest(): boolean {
        return Phaser.Math.Between(1, 64) === 1;
    }


    public calculateCriticalStrikeDamage() {
        return Math.max(
            1,
            Math.floor(
                this.stats.strength * (Phaser.Math.Between(54, 64) / 64)
            )
        );
    }

}