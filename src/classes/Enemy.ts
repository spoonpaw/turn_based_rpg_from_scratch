import Unit from './Unit';
import eventsCenter from '../utils/EventsCenter';
import BattleScene from '../scenes/BattleScene';
import Stats from '../stats/Stats';
import {Turn} from '../types/Turn';

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

        this.generateEnemyStats();

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

    // when the enemy is created, check the
    //  current zone to figure out which enemy it will

    private generateEnemyStats() {
        let power: number;
        switch (this.texture.key) {
        case 'sentientrock':
            this.type = 'Sentient Rock';
            power = 6;
            break;
        case 'deadlyflower':
            this.type = 'Deadly Flower';
            power = 5;
            break;
        case 'seedspiker':
            this.type = 'Seed Spiker';
            power = 4;
            break;
        default:
            this.type = '????';
            power = 1;
        }

        this.stats = new Stats(
            Phaser.Math.Between(1, power),
            Phaser.Math.Between(1, power),
            Phaser.Math.Between(1, power),
            Phaser.Math.Between(1, power),
            Phaser.Math.Between(1, power),
            Phaser.Math.Between(1, power),
            Phaser.Math.Between(1, power),
            Phaser.Math.Between(1, power),
            Phaser.Math.Between(1, power),
            Phaser.Math.Between(1, power),
            Phaser.Math.Between(1, power)
        );
    }

    calculateAttack(target: Unit): Turn | void {
        if (target.living) {
            // formula for setting the attack amount based on strength
            const damage = Phaser.Math.Between(1, Math.floor(this.stats.strength / 3)) + Phaser.Math.Between(1, this.stats.weapon);
            // attack the target, but don't give a visual indication of that yet
            //  takeDamage method needs to return info: did the target take damage? did the target
            //  die? store this info in the turn as this will be parsed later to display messages
            //  or sprite effects
            target.takeDamage(damage);

            return {actor: this, actionName: 'attack', target, targetHpChange: -damage};
        }
    }

    public processTurn(turn: Turn): void {
        // turn.target.takeDamage(-turn.targetHpChange);

        eventsCenter.emit(
            'Message',
            `The ${this.type} attacks ${turn.target.type} for ${-turn.targetHpChange} damage.`
        );
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
        return this.stats.dexterity / 5 + Phaser.Math.Between(1, 20);

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