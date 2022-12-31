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
    public key!: string;

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
                return obj.key === this.texture.key;
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

        this.key = enemy?.key ?? '???';

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
            eventsCenter.emit('Message', `${this.name} attacked ${target.name ?? target.name} for ${damage} HP!`);

        }

        else {
            this.battleScene.sfxScene.playSound('dodge');
            eventsCenter.emit('Message', `${this.name} attacked ${target.name ?? target.name}. ${target.name ?? target.name} dodged the attack!`);
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