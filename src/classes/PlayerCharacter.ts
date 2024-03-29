import {abilities, IAbility} from '../abilities/abilities';
import {items} from '../items/items';
import playerSoldier from '../jobs/players/PlayerSoldier';
import BattleScene from '../scenes/BattleScene';
import {IBaseStatBlock, IStatIncreases} from '../types/Advancement';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import BotCharacter from './BotCharacter';
import {Enemy} from './Enemy';
import {IPlayer} from './GameDatabase';
import Item from './Item';
import {PlayerJob} from './Jobs/PlayerJob';
import Unit from './Unit';

export default class PlayerCharacter extends Unit {
    private _currentHP!: number;
    public currentResource: number;
    public damageTween!: Phaser.Tweens.Tween | Phaser.Tweens.Tween[];
    public equipment: Equipment;
    public key!: string;
    private invisiblePlayerButton!: Phaser.GameObjects.Rectangle;

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
        // this.stats = this.gameScene.player.stats;
        this.currentHP = this.gameScene.player.currentHP;
        this.currentResource = this.gameScene.player.currentResource;
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

    public calculateCriticalStrikeDamage() {
        return Math.max(
            1,
            Math.floor(
                this.strength * (Phaser.Math.Between(54, 64) / 64)
            )
        );
    }

    public get level() {
        return this.gameScene.player.level;
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

            this.saveAndLoadScene.db.players.update(
                0,
                (player: IPlayer) => {
                    player.inventory.splice(inventoryIndex, 1);
                    return player;
                }
            );

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

    private calculateStat(stat: (keyof IBaseStatBlock & keyof IStatIncreases) | 'defense'): number {
        let derivedStat;
        if (stat === 'defense') {
            derivedStat = 'defense';
            stat = 'agility';
        }
        let statValue = playerSoldier.baseStats[stat];
        if (this.level > 1) {
            for (let i = 2; i <= this.level; i++) {
                const incrementAmount = playerSoldier.statIncreases[stat].find(
                    (incrementRange) => {
                        return incrementRange.range[0] <= i && i <= incrementRange.range[1];
                    }
                )?.increment as number;
                statValue += incrementAmount;
            }
        }

        const totalEquipmentBonus = this.getTotalEquipmentBonus(stat);
        if (derivedStat === 'defense') {
            const derivedStatEquipmentBonus = this.getTotalEquipmentBonus(derivedStat);
            return ((statValue + totalEquipmentBonus) / 2) + derivedStatEquipmentBonus;
        }
        return statValue + totalEquipmentBonus;
    }

    private getTotalEquipmentBonus(stat: (keyof IBaseStatBlock & keyof IStatIncreases) | 'defense'): number {
        let totalBonus = 0;
        for (const key in this.equipment) {
            const item = this.equipment[key];
            if (item) {
                totalBonus += this.getEquipmentStat(item, stat);
            }
        }
        return totalBonus;
    }

    private getEquipmentStat(equipment: Item, stat: (keyof IBaseStatBlock & keyof IStatIncreases) | 'defense'): number {
        if (!equipment || !equipment.stats) {
            return 0;
        }
        return equipment.stats[stat];
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

    set currentHP(newValue: number) {
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

    get currentHP(): number {
        return this._currentHP;
    }

}