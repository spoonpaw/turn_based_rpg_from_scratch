import _, {clone} from 'lodash';

import {IAbility} from '../abilities/abilities';
import {enemies} from '../enemies/enemies';
import BattleScene from '../scenes/BattleScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import BotCharacter from './BotCharacter';
import {IPlayer} from './GameDatabase';
import Item from './Item';
import {MonsterJob} from './Jobs/MonsterJob';
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
    public key!: string;
    public stats!: Stats;
    private _currentHP!: number;

    constructor(
        public scene: BattleScene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        name: string,
        job: MonsterJob,
        public skills: IAbility[] = [],
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

        this.battleScene = <BattleScene>this.scene.scene.get('Battle');

        const enemy = _.clone(
            enemies.find(obj => {
                return obj.key === this.texture.key;
            })
        );
        const stats = _.clone(
            enemies.find(obj => {
                return obj.key === this.texture.key;
            })!.stats
        );

        this.stats = stats ?? new Stats(
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

    public applyHPChange(hpChangeAmount: number): number {

        this.currentHP -= hpChangeAmount;
        if (this.currentHP <= 0) {
            this.currentHP = 0;
            this.battleScene.endBattleBackEndActions();
        }
        this.updateSceneOnReceivingDamage();
        return 0;
    }

    public calculateAttackDamage(target: (PlayerCharacter | Enemy | BotCharacter)): number {
        return Math.max(
            1,
            Math.floor(
                (this.strength - (target.defense / 2)) *
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
                this.strength * (Phaser.Math.Between(54, 64) / 64)
            )
        );
    }

    public criticalStrikeTest(): boolean {
        return Phaser.Math.Between(1, 64) === 1;
    }

    public evadeTest(): boolean {
        return Phaser.Math.Between(1, 64) === 1;
    }

    public getInitiative(): number {
        return this.agility * Phaser.Math.FloatBetween(0, 1);
    }

    public runTurn(): number {

        let runtimeInMS = 0;

        // if there are enough targets to justify it and enough resources to spend, execute
        //  a powerful aoe attack

        const livingHeroes = this.battleScene.heroes.filter(unit => unit.isLiving());
        const moreThanOneLivingHero = livingHeroes.length > 1;
        const enableAOEAttacks = false;

        if (this.hasAoEAbility() && moreThanOneLivingHero && enableAOEAttacks) {
            // do aoe damage to the player's party!
            const aoeAbility = this.getAOEAbility();
            eventsCenter.emit(
                'Message',
                aoeAbility.useTemplate.replace(
                    '${abilityUser}',
                    this.name
                )
            );
            runtimeInMS += 2000 + (2000 * this.battleScene.heroes.length);

            this.scene.time.addEvent({
                delay: 2000,
                callback: () => {
                    // Iterate through the targets and apply damage
                    for (const [index, target] of this.battleScene.heroes.entries()) {
                        if (this.evadeTest()) {
                            this.scene.time.addEvent(
                                {
                                    delay: 2000 * (index),
                                    callback: () => {
                                        this.battleScene.sfxScene.playSound('dodge');
                                        eventsCenter.emit('Message', aoeAbility.dodgeTemplate.replace('${abilityTarget}', target.name));
                                    }
                                }
                            );
                        }
                        else {
                            this.scene.time.addEvent(
                                {
                                    delay: 2000 * (index),
                                    callback: () => {
                                        this.battleScene.sfxScene.playSound('attack');
                                        const damage = this.calculateAttackDamage(target);
                                        eventsCenter.emit('Message', aoeAbility.targetTemplate.replace('${abilityTarget}', target.name).replace('${damage}', String(damage)));
                                        target.applyHPChange(damage);
                                    }
                                }
                            );
                        }
                    }
                },
                callbackScope: this
            });

            return runtimeInMS;
        }
        else {
            // attain random target!
            const listOfLivingTargets = this.battleScene.heroes.filter(
                (obj) => {
                    return obj.isLiving();
                }
            );

            const randomHeroIndex = Phaser.Math.RND.between(
                0,
                Math.max(0, listOfLivingTargets.length - 1)
            );

            let target = listOfLivingTargets[randomHeroIndex];

            if (!target) return 0;

            let damage = 0;

            // check to see if a guard is active on the player. if so, change the target to the
            //  unit that used Guard
            let guardOnTarget = false;
            const initialTarget = clone(target);
            for (const passiveEffect of this.battleScene.passiveEffects) {
                if (passiveEffect.ability.name === 'Guard' &&
                    passiveEffect.target.id === target.id &&
                    passiveEffect.actor.isLiving()
                ) {
                    target = this.battleScene.heroes.find((obj) => {
                        return obj.id === passiveEffect.actor.id;
                    }) as PlayerCharacter | BotCharacter | Enemy;
                    guardOnTarget = true;

                }
            }

            if (guardOnTarget) {
                if (this.evadeTest()) {
                    this.battleScene.sfxScene.playSound('dodge');
                    eventsCenter.emit('Message', `${this.name} attacks ${initialTarget.name}. ${target.name} intercepts and dodges the attack!`);
                    runtimeInMS += 2000;
                    return runtimeInMS;
                }
                else {
                    this.battleScene.sfxScene.playSound('attack');
                    damage = this.calculateAttackDamage(target);        // Check if the IDs of the unit using the Guard ability and the unit being guarded match
                    if (initialTarget.id === target.id) {
                        // If the IDs match, reduce the damage taken by 15%
                        damage *= 0.85;
                        damage = Math.floor(damage);
                        eventsCenter.emit('Message', `${this.name} attacks ${target.name}, who fights defensively and takes ${damage} damage.`);
                    }
                    else {
                        eventsCenter.emit('Message', `${this.name} attacks ${initialTarget.name}. ${target.name} intercepts the attack taking ${damage} damage.`);

                    }
                    target.applyHPChange(damage);
                    runtimeInMS += 2000;
                }
            }
            else {
                if (this.evadeTest()) {
                    this.battleScene.sfxScene.playSound('dodge');
                    eventsCenter.emit('Message', `${this.name} attacks ${target.name}. ${target.name} dodges the attack!`);
                    runtimeInMS += 2000;
                    return runtimeInMS;
                }
                else {
                    this.battleScene.sfxScene.playSound('attack');
                    damage = this.calculateAttackDamage(target);
                    eventsCenter.emit('Message', `${this.name} attacks ${target.name} for ${damage} HP!`);
                    target.applyHPChange(damage);
                    runtimeInMS += 2000;
                }
            }
            return runtimeInMS;
        }
    }

    private getAOEAbility(): IAbility {
        return this.skills.find((ability: IAbility) => {
            return (
                ability.targets === 'enemies' ||
                (
                    Array.isArray(
                        ability.targets
                    ) &&
                    ability.targets.includes('enemies')
                ) &&
                ability.resourceCost < this.currentResource
            );
        }) as IAbility;
    }

    private hasAoEAbility(): boolean {
        return this.skills.some((ability: IAbility) => {
            return (
                ability.targets === 'enemies' ||
                (
                    Array.isArray(
                        ability.targets
                    ) &&
                    ability.targets.includes('enemies')
                ) &&
                    ability.resourceCost < this.currentResource
            );
        });
    }

    private calculateStat(stat: keyof Stats): number {
        return this.stats[stat];
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
        return this.calculateStat('defense');
    }
    public get currentHP() {

        return this.stats.currentHP;
    }
    public set currentHP(newValue) {
        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                player.combatState.units.find(unit => unit.id === this.id)!.currentHP = newValue;
                return player;
            }
        );
        this.stats.currentHP = newValue;
    }
    public get currentResource() {
        return this.stats.currentResource;
    }
    public set currentResource(resource) {
        this.stats.currentResource = resource;
    }

}