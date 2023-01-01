import {abilities, IAbility} from '../abilities/abilities';
import BattleScene from '../scenes/BattleScene';
import BattleUIScene from '../scenes/BattleUIScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import BotCharacter from './BotCharacter';
import {Enemy} from './Enemy';
// import Item from './Item';
import Unit from './Unit';

export default class PlayerCharacter extends Unit {
    public damageTween!: Phaser.Tweens.Tween | Phaser.Tweens.Tween[];
    public equipment: Equipment;
    // public inventory!: Item[];
    public stats!: Stats;
    public key!: string;

    constructor(
        scene: BattleScene,
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
        const battleUIScene = <BattleUIScene>scene.scene.get('BattleUI');
        this.stats = this.gameScene.player.stats;
        this.equipment = this.gameScene.player.equipment;
        this.inventory = this.gameScene.player.inventory;
        this.key = 'PlayerSoldier';

        this.setInteractive();
        this.on('pointerdown', () => {
            // if (false) {
            //
            // }
            // else
            if (scene.interactionState.startsWith('inventoryaction')) {
                const inventorySlotNumber = Number(scene.interactionState.split('inventoryaction')[1]);

                battleUIScene.message.setVisible(false);
                battleUIScene.confirmSelectedAbilityOrItemFrame.setVisible(false);
                battleUIScene.confirmSelectedAbilityOrItemFrameB.setVisible(false);
                battleUIScene.selectedItemAndAbilityIcon.setVisible(false);
                battleUIScene.selectedItemAndAbilityIcon.buttonText.setVisible(false);
                battleUIScene.selectedItemAndAbilityCommandText.setVisible(false);

                for (const item of battleUIScene.inventoryButtons) {
                    item.deselect();
                    item.setVisible(false);
                    item.buttonText.setVisible(false);
                }

                eventsCenter.emit('actionSelect', {
                    action: this.inventory[inventorySlotNumber].name,
                    target: this
                });
            }
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
        if (!target.living) return 0;
        let runtimeInMS = 0;

        if (data.action === 'attack') {

            let damage = 0;

            if (!this.evadeTest()) {
                if (!this.criticalStrikeTest()) {
                    this.battleScene.sfxScene.playSound('attack');
                    damage += this.calculateAttackDamage(target);
                    eventsCenter.emit('Message', `${this.name} attacked ${target.name} for ${damage} HP!`);
                }
                else {
                    this.battleScene.sfxScene.playSound('criticalattack');
                    damage += this.calculateCriticalStrikeDamage();
                    eventsCenter.emit('Message', `${this.name} attacked ${target.name} for ${damage} HP! A critical strike!`);
                }
                runtimeInMS += 2000;
                target.applyHPChange(damage);
            }
            else {
                this.battleScene.sfxScene.playSound('dodge');
                eventsCenter.emit('Message', `${this.name} attacked ${target.name}. ${target.name} dodged the attack!`);
                runtimeInMS += 2000;
                return runtimeInMS;
            }
        }

        else if (data.action === 'Guard') {


            for (const abilityButton of this.battleUIScene.abilityButtons) {
                abilityButton.destroy();
                abilityButton.buttonText.destroy();
            }
            this.battleUIScene.abilityButtons = [];

            this.battleUIScene.destroyAbilityButtons();
            this.battleUIScene.generateAbilityButtons();

            if (data.target.living) {

                // calculate the exact amount healed, announce it in a message
                runtimeInMS += 2000;
                // TODO: battle scene needs to store an array of passive effects. it needs to know the actor and the
                //  target for each effect as well as the ability itself. each passive effect must have a number of
                //  active turns before it expires at the top of each round, the passive effects are iterated over,
                //  the remaining turn count would be decremented and if the number is zero, then that passive effect
                // should be removed from the list of passive effects
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

                eventsCenter.emit('Message', `${this.name} steps forward to defend ${target.name}.`);
            }
        }



        // TODO: DON'T HARDCODE ITEMS BY NAME!
        //  categorize, like not just cypressium staff does this. you need to check if an item is being used.
        //  if it is some inert object like most equipment then run this branch
        else if (data.action === 'Cypressium Staff') {
            runtimeInMS += 2000;
            eventsCenter.emit('Message', `${this.name} uses a ${this.name} on ${target.name}; it has no effect.`);
        }
        else if (data.action === 'Health Potion') {
            // get the selected inventory slot index from the battle ui scene delete it from the player's inventory
            //  and regenerate the inventory list

            const inventoryIndex = this.battleUIScene.inventoryIndex;
            this.inventory.splice(inventoryIndex, 1);

            for (const inventoryButton of this.battleUIScene.inventoryButtons) {
                inventoryButton.destroy();
                inventoryButton.buttonText.destroy();
            }
            this.battleUIScene.inventoryButtons = [];

            this.battleUIScene.destroyInventoryButtons();
            this.battleUIScene.generateInventoryButtons();

            if (data.target.living) {

                // calculate the exact amount healed, announce it in a message
                runtimeInMS += 2000;
                const amountHealed = data.target.applyHPChange(-30);
                this.battleScene.sfxScene.playSound('potion');
                eventsCenter.emit('Message', `${this.name} uses a health potion on ${target.name}, healing them for ${amountHealed} HP.`);
            }
        }

        return runtimeInMS;
    }

    public updateSceneOnReceivingDamage(): void {
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