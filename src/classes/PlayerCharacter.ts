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
        this.type = 'Warrior';
    }

    calculateAttack(target: Unit): Turn | void {
        if (target.living) {
            // formula for setting the attack amount based on str
            const damage = Math.floor(this.stats.strength / 2) + Phaser.Math.Between(1, this.stats.weapon);
            target.takeDamage(damage);
            return {actor: this, actionName: 'attack', target, targetHpChange: -damage};
        }
    }


    attack(target: Unit): Turn | void {
        if (target.living) {
            // formula for setting the attack amount based on strength
            const damage = Math.floor(this.stats.strength / 2) + Phaser.Math.Between(1, this.stats.weapon);
            target.takeDamage(damage);
            eventsCenter.emit('Message', `The ${this.type} attacks the ${target.type} for ${damage} damage.`);
            return {actor: this, actionName: 'attack', target, targetHpChange: -damage};
        }
    }

    public processTurn(turn: Turn) {
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
        this.stats.currentHP =  this.stats.currentHP - damage;

        if (this.stats.currentHP  <= 0) {
            this.stats.currentHP = 0;
            this.living = false;
        }
    }
}