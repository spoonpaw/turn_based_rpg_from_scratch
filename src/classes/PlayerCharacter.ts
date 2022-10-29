import Unit from './Unit';
import Stats from '../stats/Stats';
import eventsCenter from '../utils/EventsCenter';
import {Turn} from '../types/Turn';

export default class PlayerCharacter extends Unit {
    type: string;
    damageTween!: Phaser.Tweens.Tween;
    stats!: Stats;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined
    ) {
        super(
            scene,
            x,
            y,
            texture,
            frame
        );
        this.stats = this.gameScene.player.stats;
        this.type = 'Soldier';
    }

    calculateAttack(target: Unit): Turn | void {
        // don't check if target is living here
        if (target.living) {
            let critical = false;
            let targetKilled = false;
            // determine if the target evaded the attack
            const evade = Phaser.Math.Between(1, 64) === 1;
            let damage = 0;

            if (!evade) {

                if (Phaser.Math.Between(1, 64) === 1) {
                    // logic for announcing critical hits
                    critical = true;
                    damage = Math.max(1, Math.floor((this.stats.attack) * (Phaser.Math.Between(54, 64) / 64)));
                }
                else {
                    damage = Math.max(1, Math.floor((this.stats.attack - target.stats.defense / 2) * (Phaser.Math.FloatBetween(0.34, 0.52))));
                }

                target.takeDamage(damage);
                if (!target.living) {
                    targetKilled = true;
                }
            }

            return {
                actor: this,
                actionName: 'attack',
                target,
                targetHpChange: -damage,
                critical,
                targetKilled,
                evade
            };
        }
    }

    public processTurn(turn: Turn): void {
        let critString = '';
        let targetKilledString = '';
        if (turn.critical) {
            critString = ' A critical strike!';
        }
        if (turn.targetKilled) {
            targetKilledString = ` ${turn.target.type} is killed.`;
        }
        if (turn.evade) {
            eventsCenter.emit(
                'Message',
                `${this.type} attacks ${turn.target.type}; ${turn.target.type} dodges!`
            );
        }
        else {
            eventsCenter.emit(
                'Message',
                `${this.type} attacks ${turn.target.type} for ${-turn.targetHpChange} damage.${critString}${targetKilledString}`
            );
        }
    }

    updateSceneOnReceivingDamage(): void {
        // take care of flashing the enemy sprite if it gets damaged or hiding it if it dies.
        if (this.stats.currentHP <= 0) {
            this.visible = false;
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

    getInitiative(): number {
        return this.stats.agility * Phaser.Math.FloatBetween(0, 1);
    }

    takeDamage(damage: number): void {
        // handle the math of taking damage,
        this.stats.currentHP = this.stats.currentHP - damage;

        if (this.stats.currentHP <= 0) {
            this.stats.currentHP = 0;
            this.living = false;
        }
    }
}