import {abilities, IAbility} from '../abilities/abilities';
import {items} from '../items/items';
import BattleScene from '../scenes/BattleScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import BotCharacter from './BotCharacter';
import {Enemy} from './Enemy';
import {PlayerJob} from './Jobs/PlayerJob';
// import Item from './Item';
import Unit from './Unit';

export default class PlayerCharacter extends Unit {
    public damageTween!: Phaser.Tweens.Tween | Phaser.Tweens.Tween[];
    public equipment: Equipment;
    // public inventory!: Item[];
    public stats!: Stats;
    public key!: string;
    private invisiblePlayerButton!: Phaser.GameObjects.Rectangle;

    constructor(
        scene: BattleScene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        name: string,
        job: PlayerJob
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
        this.stats = this.gameScene.player.stats;
        this.equipment = this.gameScene.player.equipment;
        this.inventory = this.gameScene.player.inventory;
        this.key = 'PlayerSoldier';

        this.invisiblePlayerButton = this.scene.add.rectangle(
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
        return super.applyHPChange(hpChangeAmount, this.battleScene.player1HPText);
    }

    public calculateAttackDamage(target: (PlayerCharacter | Enemy | BotCharacter)): number {
        return Math.max(
            1,
            Math.floor(
                (this.getCombinedStat('strength') - (target.stats.defense / 2)) * Phaser.Math.FloatBetween(
                    0.34,
                    0.52
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

    public criticalStrikeTest(): boolean {
        return Phaser.Math.Between(1, 64) === 1;
    }

    public evadeTest(): boolean {
        return Phaser.Math.Between(1, 64) === 1;
    }

    public getInitiative(): number {
        return this.stats.agility * Phaser.Math.FloatBetween(0, 1);
    }

    public runTurn(
        data: {
            action: string;
            target: Enemy | PlayerCharacter | BotCharacter;
        }
    ): number {
        const target = data.target;
        // TODO: REDIRECT THE PLAYER'S ATTACK IF THEIR INTENDED TARGET IS NOT ALIVE AND THERE IS STILL > 0 ENEMIES LIVING
        if (!target.isLiving()) return 0;
        let runtimeInMS = 0;

        if (data.action === 'attack') {

            let damage = 0;

            if (!this.evadeTest()) {
                if (!this.criticalStrikeTest()) {
                    this.battleScene.sfxScene.playSound('attack');
                    damage += this.calculateAttackDamage(target);
                    eventsCenter.emit('Message', `${this.name} attacks ${target.name} for ${damage} HP!`);
                }
                else {
                    this.battleScene.sfxScene.playSound('criticalattack');
                    damage += this.calculateCriticalStrikeDamage();
                    eventsCenter.emit('Message', `${this.name} attacks ${target.name} for ${damage} HP! A critical strike!`);
                }
                runtimeInMS += 2000;
                target.applyHPChange(damage);
            }
            else {
                this.battleScene.sfxScene.playSound('dodge');
                eventsCenter.emit('Message', `${this.name} attacks ${target.name}. ${target.name} dodges the attack!`);
                runtimeInMS += 2000;
                return runtimeInMS;
            }
        }

        else if (data.action === 'Power Strike') {

            for (const abilityButton of this.battleUIScene.abilityButtons) {
                abilityButton.destroyUIActionButton();
            }
            this.battleUIScene.abilityButtons = [];

            this.battleUIScene.destroyAbilityButtons();
            this.battleUIScene.generateAbilityButtons();

            let damage = 0;
            const powerStrikeAbility = abilities.find((obj) => {
                return obj.name === data.action;
            }) as IAbility;

            if (!this.evadeTest()) {
                if (!this.criticalStrikeTest()) {
                    this.battleScene.sfxScene.playSound('attack');
                    damage += this.calculateAttackDamage(target);
                    damage = Math.floor(damage + powerStrikeAbility.power);
                    eventsCenter.emit(
                        'Message',
                        powerStrikeAbility.targetTemplate
                            .replace(
                                '${abilityUser}',
                                this.name
                            )
                            .replace(
                                '${abilityTarget}',
                                target.name
                            )
                            .replace(
                                '${damage}',
                                String(damage)
                            )
                    );
                }
                else {
                    this.battleScene.sfxScene.playSound('criticalattack');
                    damage += this.calculateCriticalStrikeDamage();
                    damage = Math.floor(damage + powerStrikeAbility.power);
                    eventsCenter.emit(
                        'Message',
                        powerStrikeAbility.targetCriticalHitTemplate
                            .replace(
                                '${abilityUser}',
                                this.name
                            )
                            .replace(
                                '${abilityTarget}',
                                target.name
                            )
                            .replace(
                                '${damage}',
                                String(damage)
                            )
                    );
                }
                runtimeInMS += 2000;
                target.applyHPChange(damage);
            }
            else {
                this.battleScene.sfxScene.playSound('dodge');
                eventsCenter.emit(
                    'Message',
                    powerStrikeAbility.dodgeTemplate
                        .replace(
                            '${abilityUser}',
                            this.name
                        )
                        .replace(
                            '${abilityTarget}',
                            target.name
                        )
                );
                runtimeInMS += 2000;
                return runtimeInMS;
            }

        }

        else if (data.action === 'Guard') {

            for (const abilityButton of this.battleUIScene.abilityButtons) {
                abilityButton.destroyUIActionButton();
            }
            this.battleUIScene.abilityButtons = [];

            this.battleUIScene.destroyAbilityButtons();
            this.battleUIScene.generateAbilityButtons();

            if (data.target.isLiving()) {
                // battle scene needs to store an array of passive effects. it needs to know the actor and the
                //  target for each effect as well as the ability itself. each passive effect must have a number of
                //  active turns before it expires at the top of each round, the passive effects are iterated over,
                //  the remaining turn count would be decremented and if the number is zero, then that passive effect
                // should be removed from the list of passive effects

                runtimeInMS += 2000;
                const guardAbility = abilities.find((obj) => {
                    return obj.name === data.action;
                }) as IAbility;
                const passiveGuardEffect = {
                    actor: this,
                    target: data.target,
                    ability: guardAbility,
                    turnDurationRemaining: guardAbility.turnDuration!
                };
                this.battleScene.passiveEffects.push(passiveGuardEffect);

                if (data.target.id === this.id) {
                    eventsCenter.emit(
                        'Message',
                        guardAbility.useSelfTemplate
                            .replace('${abilityUser}', this.name)
                    );
                }
                else {
                    eventsCenter.emit(
                        'Message',
                        guardAbility.useTemplate
                            .replace('${abilityUser}', this.name)
                            .replace('${abilityTarget}', data.target.name)
                    );
                }
            }
        }

        else if (data.action === 'Health Potion') {
            // get the selected inventory slot index from the battle ui scene delete it from the player's inventory
            //  and regenerate the inventory list

            const inventoryIndex = this.battleUIScene.inventoryIndex;
            this.inventory.splice(inventoryIndex, 1);

            for (const inventoryButton of this.battleUIScene.inventoryButtons) {
                inventoryButton.destroyUIActionButton();
            }
            this.battleUIScene.inventoryButtons = [];

            this.battleUIScene.destroyInventoryButtons();
            this.battleUIScene.generateInventoryButtons();

            if (data.target.isLiving()) {

                // calculate the exact amount healed, announce it in a message
                runtimeInMS += 2000;
                const amountHealed = data.target.applyHPChange(-30);
                this.battleScene.sfxScene.playSound('potion');
                eventsCenter.emit('Message', `${this.name} uses a health potion on ${target.name}, healing them for ${amountHealed} HP.`);
            }
        }

        // default branch. player is using an item without an effect.
        else if (items.some((value) => {
            return value.name === data.action;
        })) {

            runtimeInMS += 2000;
            eventsCenter.emit('Message', `${this.name} uses a ${data.action} on ${target.name}; it has no effect.`);
        }

        return runtimeInMS;
    }

}