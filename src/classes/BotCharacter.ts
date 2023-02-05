import monsterSoldier from '../jobs/monsters/MonsterSoldier';
import BattleScene from '../scenes/BattleScene';
import {IBaseStatBlock, IStatIncreases} from '../types/Advancement';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import {Enemy} from './Enemy';
import {IPlayer} from './GameDatabase';
import {PlayerJob} from './Jobs/PlayerJob';
import PlayerCharacter from './PlayerCharacter';
import Unit from './Unit';

export default class BotCharacter extends Unit {
    private _currentHP!: number;
    public currentResource: number;
    public damageTween!: Phaser.Tweens.Tween | Phaser.Tweens.Tween[];
    public equipment: Equipment = {
        body: undefined,
        head: undefined,
        offhand: undefined,
        weapon: undefined
    };
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
        this.currentHP = this.gameScene.bots[0].currentHP;

        this.currentResource = this.gameScene.bots[0].currentResource;
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
        return this.agility * Phaser.Math.FloatBetween(0, 1);
    }

    public calculateAttackDamage(target: (PlayerCharacter | Enemy | BotCharacter)): number {
        const actorStrength = this.strength;
        const defenderDefense = target.defense;
        const damageAfterDefense = actorStrength - (defenderDefense / 2);
        const randomModifier = Phaser.Math.FloatBetween(0.34, 0.52);
        const finalAttackDamage = Math.max(
            1,
            Math.floor(
                damageAfterDefense * randomModifier
            )
        );
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
                this.strength * (Phaser.Math.Between(54, 64) / 64)
            )
        );
    }

    private calculateStat(stat: keyof IBaseStatBlock & keyof IStatIncreases): number {
        let statValue = monsterSoldier.baseStats[stat];
        if (this.gameScene.bots[0].level > 1) {
            for (let i = 2; i <= this.gameScene.bots[0].level; i++) {
                const incrementAmount = monsterSoldier.statIncreases[stat].find(
                    (incrementRange) => {
                        return incrementRange.range[0] <= i && i <= incrementRange.range[1];
                    }
                )?.increment as number;
                statValue += incrementAmount;
            }
        }
        return statValue;
    }

    public get maxHP() {
        return this.calculateStat('vitality') * 2;
    }

    public get agility() {
        return this.calculateStat('agility');
    }

    public get vitality() {
        return this.calculateStat('vitality');
    }

    public get intellect() {
        return this.calculateStat('intellect');
    }

    public get luck() {
        return this.calculateStat('luck');
    }

    public get strength() {
        return this.calculateStat('strength');
    }

    public get defense() {
        return this.calculateStat('agility') / 2;
    }

    public set currentHP(newValue: number) {
        // console.trace();
        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                const unit = player.combatState.units.find(unit => unit.id === this.id);
                if (unit) {
                    unit.currentHP = newValue;
                }
                return player;
            }
        );
        this._currentHP = newValue;
    }

    public get currentHP(): number {
        return this._currentHP;
    }
}