import BattleScene from '../scenes/BattleScene';
import BattleUIScene from '../scenes/BattleUIScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import {Enemy} from './Enemy';
import Item from './Item';
import Unit from './Unit';

export default class PlayerCharacter extends Unit {
    public damageTween!: Phaser.Tweens.Tween | Phaser.Tweens.Tween[];
    public equipment: Equipment;
    public inventory!: Item[];
    public stats!: Stats;
    public type: string;

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
        this.stats = this.gameScene.player.stats;
        this.equipment = this.gameScene.player.equipment;
        this.inventory = this.gameScene.player.inventory;
        this.type = 'Soldier';

        this.setInteractive();
        this.on('pointerdown', () => {
            if (scene.interactionState.startsWith('inventoryaction')) {
                const inventorySlotNumber = Number(scene.interactionState.split('inventoryaction')[1]);

                const battleUIScene = <BattleUIScene>scene.scene.get('BattleUI');

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
        const initialCharacterHP = this.stats.currentHP;

        // handle healing hp change (negative hp change signifies healing)
        if (hpChangeAmount < 0) {
            this.stats.currentHP = Math.min(this.stats.maxHP, this.stats.currentHP - hpChangeAmount);
        }

        // apply damage
        else {
            // handle the math of taking damage,
            this.stats.currentHP -= hpChangeAmount;
            this.updateSceneOnReceivingDamage();
        }

        if (this.stats.currentHP <= 0) {
            this.stats.currentHP = 0;
            this.living = false;
        }

        // setting up the ui hp
        this.battleScene.player1HPText.setText(`HP: ${this.stats.currentHP}/${this.stats.maxHP}`);

        // return actual hp change
        return this.stats.currentHP - initialCharacterHP;
    }

    public calculateAttackDamage(target: (PlayerCharacter | Enemy)): number {
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

    public getCombinedStat(stat: keyof typeof this.stats): number {
        const baseStat = this.stats[stat];
        let weaponBonus = 0;
        if (this.equipment.weapon) {
            weaponBonus += this.equipment.weapon.stats![stat as keyof typeof this.equipment.weapon.stats];
        }

        let headBonus = 0;
        if (this.equipment.head) {
            headBonus += this.equipment.head.stats![stat as keyof typeof this.equipment.head.stats];
        }

        let bodyBonus = 0;
        if (this.equipment.body) {
            bodyBonus += this.equipment.body.stats![stat as keyof typeof this.equipment.body.stats];
        }

        let offHandBonus = 0;
        if (this.equipment.offhand) {
            offHandBonus += this.equipment.offhand.stats![stat as keyof typeof this.equipment.offhand.stats];
        }

        const totalEquipmentBonus = weaponBonus + headBonus + bodyBonus + offHandBonus;

        if (stat === 'defense') {
            return (this.stats.agility / 2) + totalEquipmentBonus;
        }

        return baseStat + totalEquipmentBonus;
    }

    public getInitiative(): number {
        return this.stats.agility * Phaser.Math.FloatBetween(0, 1);
    }

    public runTurn(data: { action: string; target: Enemy | PlayerCharacter; }) {
        const target = data.target;
        let runtimeInMS = 0;

        if (data.action === 'attack') {

            let damage = 0;

            if (!this.evadeTest()) {
                if (!this.criticalStrikeTest()) {
                    this.battleScene.sfxScene.playSound('attack');
                    damage += this.calculateAttackDamage(target);
                    eventsCenter.emit('Message', `${this.type} attacked ${target.type} for ${damage} HP!`);
                }
                else {
                    this.battleScene.sfxScene.playSound('criticalattack');
                    damage += this.calculateCriticalStrikeDamage();
                    eventsCenter.emit('Message', `${this.type} attacked ${target.type} for ${damage} HP! A critical strike!`);
                }
                runtimeInMS += 2000;
                target.applyHPChange(damage);
            }
            else {
                this.battleScene.sfxScene.playSound('dodge');
                eventsCenter.emit('Message', `${this.type} attacked ${target.type}. ${target.type} dodged the attack!`);
                runtimeInMS += 2000;
                return runtimeInMS;
            }
        }
        else if (data.action === 'Cypressium Staff') {
            runtimeInMS += 2000;
            eventsCenter.emit('Message', `${this.type} uses an extendable cypressiom staff on ${target.type}; it has no effect.`);
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
                eventsCenter.emit('Message', `${this.type} uses a health potion on ${target.type}, healing them for ${amountHealed} HP.`);
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