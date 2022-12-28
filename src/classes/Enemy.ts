import _ from 'lodash';

import {enemies} from '../enemies/enemies';
import BattleScene from '../scenes/BattleScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import BotCharacter from './BotCharacter';
import Item from './Item';
import PlayerCharacter from './PlayerCharacter';
import Unit from './Unit';

export class Enemy extends Unit {
    public damageTween!: Phaser.Tweens.Tween | Phaser.Tweens.Tween[];
    public equipment: Equipment = {
        body: undefined,
        head: undefined,
        offhand: undefined,
        weapon: undefined
    };
    public inventory: Item[] = [];
    public stats!: Stats;
    public type!: string;

    constructor(
        public scene: BattleScene,
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

        this.battleScene = <BattleScene>this.scene.scene.get('Battle');

        const enemy = _.cloneDeep(
            enemies.find(obj => {
                return obj.name === this.texture.key;
            })
        );

        this.stats = enemy?.stats ?? new Stats(
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

        this.type = enemy?.type ?? '???';

        this.setScale(1.5);
        this.setInteractive();

        this.on('pointerdown', () => {
            // check if the battle scene is ready for player interaction at all
            if (scene.interactionState !== 'attack') {
                return;
            }

            eventsCenter.emit('actionSelect', {
                action: 'attack', target: this
            });
        });
    }

    applyHPChange(hpChangeAmount: number): number {
        // handle the math of taking damage,
        this.stats.currentHP -= hpChangeAmount;
        if (this.stats.currentHP <= 0) {
            this.stats.currentHP = 0;
            this.living = false;
        }
        this.updateSceneOnReceivingDamage();
        return 0;
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

    public calculateCriticalStrikeDamage() {
        return Math.max(
            1,
            Math.floor(
                this.stats.strength * (Phaser.Math.Between(54, 64) / 64)
            )
        );
    }

    criticalStrikeTest(): boolean {
        return Phaser.Math.Between(1, 64) === 1;
    }

    evadeTest(): boolean {
        return Phaser.Math.Between(1, 64) === 1;
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

    public runTurn(): number {
        // just attack player 1
        const target = this.battleScene.heroes[
            Phaser.Math.RND.between(
                0,
                this.battleScene.heroes.length - 1
            )
        ];
        let runtimeInMS = 0;

        let damage = 0;

        if (!this.evadeTest()) {
            this.battleScene.sfxScene.playSound('attack');
            damage = this.calculateAttackDamage(target);
            target.applyHPChange(damage);
            runtimeInMS += 2000;
            eventsCenter.emit('Message', `${this.type} attacked ${target.name ?? target.type} for ${damage} HP!`);

        }

        else {
            this.battleScene.sfxScene.playSound('dodge');
            eventsCenter.emit('Message', `${this.type} attacked ${target.name ?? target.type}. ${target.name ?? target.type} dodged the attack!`);
            runtimeInMS += 2000;
            return runtimeInMS;
        }

        return runtimeInMS;
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

}