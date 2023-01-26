import BattleScene from '../scenes/BattleScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import {Enemy} from './Enemy';
import {IPlayer} from './GameDatabase';
import {PlayerJob} from './Jobs/PlayerJob';
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
    public key!: string;
    private invisibleBotButton!: Phaser.GameObjects.Rectangle;

    constructor(
        scene: BattleScene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        name: string,
        job: PlayerJob,
        id?: number
    ) {
        super(
            scene,
            x,
            y,
            texture,
            frame,
            name,
            job,
            id
        );

        // TODO: there needs to be a logical way of figuring
        //  out which bot this list is meant to reflect.
        //  for now we can just use this this.gameScene.bots[0]
        this.stats = this.gameScene.bots[0].stats;
        this.name = this.gameScene.bots[0].name;

        this.invisibleBotButton = this.scene.add.rectangle(
            x - 34,
            y - 14,
            229,
            113,
            0xFF0000,
            0
        )
            .setOrigin(0, 0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.unitButtonCallback();
            });
    }

    public applyHPChange(hpChangeAmount: number): number {

        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {

                const unitToUpdate = player.combatState.heroes.find(unit => unit.id === this.id);

                if (unitToUpdate !== undefined) {
                    if (hpChangeAmount < 0) {
                        unitToUpdate.stats.currentHP = Math.min(unitToUpdate.stats.maxHP, unitToUpdate.stats.currentHP - hpChangeAmount);
                    }
                    else {
                        unitToUpdate.stats.currentHP -= hpChangeAmount;
                    }
                    if (unitToUpdate.stats.currentHP <= 0) {
                        unitToUpdate.stats.currentHP = 0;
                    }
                }

                return player;
            }
        );


        return super.applyHPChange(hpChangeAmount, this.battleScene.player2HPText);
    }
    public runTurn(): number {
        // just attack enemy 1
        const target = this.battleScene.enemies[0];
        if (!target.isLiving()) return 0;
        let runtimeInMS = 0;

        let damage = 0;

        if (!this.evadeTest()) {
            // target did not dodge
            this.battleScene.sfxScene.playSound('attack');
            damage = this.calculateAttackDamage(target);
            target.applyHPChange(damage);
            runtimeInMS += 2000;
            eventsCenter.emit('Message', `${this.name} attacks ${target.name} for ${damage} HP!`);

        }

        else {
            // target dodged
            this.battleScene.sfxScene.playSound('dodge');
            eventsCenter.emit('Message', `${this.name} attacks ${target.name}. ${target.name} dodges the attack!`);
            runtimeInMS += 2000;
            return runtimeInMS;
        }

        return runtimeInMS;
    }

    public getInitiative(): number {
        return this.stats.agility * Phaser.Math.FloatBetween(0, 1);
    }

    public calculateAttackDamage(target: (PlayerCharacter | Enemy | BotCharacter)): number {
        console.log(`calculating ${this.name}'s damage.`);
        console.log('formula: Math.max(1, Math.floor(actorStrength - (defenderDefense / 2) * randomModifier))');
        const actorStrength = this.getCombinedStat('strength');
        const defenderDefense = target.stats.defense;
        const damageAfterDefense = actorStrength - (defenderDefense / 2);
        const randomModifier = Phaser.Math.FloatBetween(0.34, 0.52);
        const finalAttackDamage = Math.max(
            1,
            Math.floor(
                damageAfterDefense * randomModifier
            )
        );
        console.log({actorStrength, defenderDefense, damageAfterDefense, randomModifier, finalAttackDamage});
        return finalAttackDamage;
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