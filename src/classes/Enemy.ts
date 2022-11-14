import _ from 'lodash';

import {enemies} from '../enemies/enemies';
import BattleScene from '../scenes/BattleScene';
import Stats from '../stats/Stats';
import eventsCenter from '../utils/EventsCenter';
import Item from './Item';
import PlayerCharacter from './PlayerCharacter';
import Unit from './Unit';

export class Enemy extends Unit {
    public type!: string;

    damageTween!: Phaser.Tweens.Tween;
    stats!: Stats;
    public inventory: Item[] = [];

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

    evadeTest(): boolean {
        return Phaser.Math.Between(1, 64) === 1;
    }

    public runTurn(): number {
        // just attack player 1
        const target = this.battleScene.heroes[0];
        let runtimeInMS = 0;

        let damage = 0;

        if (!this.evadeTest()) {
            damage = this.calculateAttackDamage(target);
            target.applyHPChange(damage);
            runtimeInMS += 2000;
            eventsCenter.emit('Message', `${this.type} attacked ${target.type} for ${damage} HP!`);

        }

        else {
            eventsCenter.emit('Message', `${this.type} attacked ${target.type}. ${target.type} dodged the attack!`);
            runtimeInMS += 2000;
            return runtimeInMS;
        }

        return runtimeInMS;
    }

    public calculateAttackDamage(target: (PlayerCharacter | Enemy)): number {
        return Math.max(
            1,
            Math.floor(
                (this.stats.attack - target.stats.defense / 2) *
                Phaser.Math.FloatBetween(
                    0.39, 0.59
                )
            )
        );
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

    getInitiative(): number {
        return this.stats.agility * Phaser.Math.FloatBetween(0, 1);

    }

    applyHPChange(hpChangeAmount:number): number {
        // handle the math of taking damage,
        this.stats.currentHP -= hpChangeAmount;
        if (this.stats.currentHP <= 0) {
            this.stats.currentHP = 0;
            this.living = false;
        }
        this.updateSceneOnReceivingDamage();
        return 0;
    }


    calculateCriticalStrikeDamage() {
        return Math.max(
            1,
            Math.floor(
                this.stats.attack * (Phaser.Math.Between(54, 64) / 64)
            )
        );
    }

    criticalStrikeTest(): boolean {
        return Phaser.Math.Between(1, 64) === 1;
    }
}