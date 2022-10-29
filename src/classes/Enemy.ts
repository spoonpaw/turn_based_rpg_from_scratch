import Unit from './Unit';
import eventsCenter from '../utils/EventsCenter';
import BattleScene from '../scenes/BattleScene';
import Stats from '../stats/Stats';
import {Turn} from '../types/Turn';
import {enemies} from '../enemies/enemies';

import _ from 'lodash';

export class Enemy extends Unit {
    public type!: string;

    damageTween!: Phaser.Tweens.Tween;
    stats!: Stats;
    private battleScene: BattleScene;

    constructor(
        scene: BattleScene,
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

        this.battleScene = <BattleScene>this.scene.scene.get('Battle');

        const enemy = _.cloneDeep(
            enemies.find(obj => {
                return obj.name === this.texture.key;
            })
        );

        this.stats = enemy?.stats ?? new Stats(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

        this.type = enemy?.type ?? '???';

        this.scene = scene;

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

    calculateAttack(target: Unit): Turn | void {
        if (target.living) {
            const critical = false;
            let targetKilled = false;
            // determine if the target evaded the attack
            const evade = Phaser.Math.Between(1, 64) === 1;
            let damage = 0;

            if (!evade) {
                damage = Math.max(
                    1,
                    Math.floor(
                        (this.stats.attack - target.stats.defense / 2) *
                        Phaser.Math.FloatBetween(
                            0.39, 0.59
                        )
                    )
                );
                // attack the target, but don't give a visual indication of that yet
                //  takeDamage method needs to return info: did the target take damage? did the target
                //  die? store this info in the turn as this will be parsed later to display messages
                //  or sprite effects
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
        let targetKilledString = '';
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
                `${this.type} attacks ${turn.target.type} for ${-turn.targetHpChange} damage.${targetKilledString}`
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
        this.stats.currentHP -= damage;
        if (this.stats.currentHP <= 0) {
            this.stats.currentHP = 0;
            this.living = false;
        }
    }
}