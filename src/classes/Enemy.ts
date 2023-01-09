import _, {clone} from 'lodash';

import {abilities, IAbility} from '../abilities/abilities';
import {enemies} from '../enemies/enemies';
import BattleScene from '../scenes/BattleScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import BotCharacter from './BotCharacter';
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

    constructor(
        public scene: BattleScene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        name: string,
        job: MonsterJob,
        private skills: IAbility[] = []
    ) {
        super(
            scene,
            x,
            y,
            texture,
            frame,
            name,
            job
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

        console.log('enemy was just cloned!');
        console.log({clonedEnemy: enemy});
        console.log({clonedStats: stats});

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
            if (scene.interactionState.startsWith('abilityaction')) {
                console.log(`ability potentially used on ${this.name}`);
                const selectedAbilityAttainment = this.battleUIScene.getSelectedAbilityAttainment();

                const selectedAbility = abilities.find((obj) => {
                    return obj.name === selectedAbilityAttainment.name;
                }) as IAbility;

                if (
                    selectedAbility.targets !== 'enemy' &&
                    !(
                        Array.isArray(selectedAbility.targets) &&
                        selectedAbility.targets.includes('enemy')
                    )
                ) {
                    return;
                }
                this.battleUIScene.hideAbilitySelectionUI();

                eventsCenter.emit('actionSelect', {
                    action: selectedAbilityAttainment.name,
                    target: this,
                    actionType: 'ability'
                });
            }
            else if (scene.interactionState === 'attack') {
                eventsCenter.emit('actionSelect', {
                    action: 'attack', target: this
                });
            }
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
        console.log('beginning to run the enemy\'s turn');
        let runtimeInMS = 0;

        // if there are enough targets to justify it and enough resources to spend, execute the
        //  a powerful aoe attack

        const livingHeroes = this.battleScene.heroes.filter(unit => unit.living);
        const moreThanOneLivingHero = livingHeroes.length > 1;

        if (this.hasAoEAbility() && moreThanOneLivingHero) {
            // do aoe damage to the player's party!
            const aoeAbility = this.getAOEAbility();
            console.log('subtracting aoe ability resource cost from current resource');
            this.stats.currentResource -= aoeAbility.resourceCost;
            console.log({resourceCost: aoeAbility.resourceCost, enemyResourceAfterSubtractingResourceCost: this.stats.currentResource});
            eventsCenter.emit('Message', aoeAbility.useTemplate.replace('${abilityUser}', this.name));
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
                                        console.log({ damage });
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
                    return obj.living;
                }
            );
            const randomIndex = Phaser.Math.RND.between(0, listOfLivingTargets.length - 1);

            let target = listOfLivingTargets[randomIndex];
            console.log({initialTarget: target});
            if (!target) return 0;

            let damage = 0;

            // check to see if a guard is active on the player. if so, change the target to the
            //  unit that used Guard
            let guardOnTarget = false;
            const initialTarget = clone(target);
            for (const passiveEffect of this.battleScene.passiveEffects) {
                if (passiveEffect.ability.name === 'Guard' &&
                    passiveEffect.target.id === target.id &&
                    passiveEffect.actor.living
                ) {
                    target = this.battleScene.heroes.find((obj) => {
                        return obj.id === passiveEffect.actor.id;
                    }) as PlayerCharacter | BotCharacter | Enemy;
                    guardOnTarget = true;

                }
            }

            console.log({guardOnTarget});
            console.log({targetAfterCheckingForGuard: target});
            console.log({initialTargetAfterCheckingForGuard: initialTarget});

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
                        eventsCenter.emit('Message', `${this.name} attacks ${target.name}, who fought defensively and took ${damage} damage.`);
                    }
                    else {
                        eventsCenter.emit('Message', `${this.name} attacks ${initialTarget.name}. ${target.name} intercepts the attack taking ${damage} damage.`);

                    }
                    console.log({damage});
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
                    console.log({damage});
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
                ability.resourceCost < this.stats.currentResource
            );
        }) as IAbility;
    }

    private hasAoEAbility(): boolean {
        return this.skills.some((ability: IAbility) => {
            return (
                (
                    ability.targets === 'enemies' ||
                    Array.isArray(
                        ability.targets
                    ) &&
                    ability.targets.includes('enemies')
                ) &&
                ability.resourceCost <= this.stats.currentResource
            );
        });
    }

}