import BattleScene from '../scenes/BattleScene';
import Stats from '../stats/Stats';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import {Enemy} from './Enemy';
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
                this.botButtonCallback();
            });
    }

    public applyHPChange(hpChangeAmount: number): number {
        return super.applyHPChange(hpChangeAmount, this.battleScene.player2HPText);
    }

    public runTurn(): number {
        // just attack player 1
        const target = this.battleScene.enemies[0];
        if (!target.living) return 0;
        let runtimeInMS = 0;

        let damage = 0;

        if (!this.evadeTest()) {
            // target did not dodge
            this.battleScene.sfxScene.playSound('attack');
            damage = this.calculateAttackDamage(target);
            target.applyHPChange(damage);
            runtimeInMS += 2000;
            eventsCenter.emit('Message', `${this.name} attacked ${target.name} for ${damage} HP!`);

        }

        else {
            // target dodged
            this.battleScene.sfxScene.playSound('dodge');
            eventsCenter.emit('Message', `${this.name} attacked ${target.name}. ${target.name} dodged the attack!`);
            runtimeInMS += 2000;
            return runtimeInMS;
        }

        return runtimeInMS;
    }

    getInitiative(): number {
        return this.stats.agility * Phaser.Math.FloatBetween(0, 1);
    }

    updateSceneOnReceivingDamage(): void {
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

    private botButtonCallback() {
        if (this.battleScene.interactionState.startsWith('abilityaction')) {
            const abilitySlotNumber = Number(this.battleScene.interactionState.split('abilityaction')[1]);
            this.selectAbilityOrItem(abilitySlotNumber, 'ability');
        }
        else if (this.battleScene.interactionState.startsWith('inventoryaction')) {
            const inventorySlotNumber = Number(this.battleScene.interactionState.split('inventoryaction')[1]);
            this.selectAbilityOrItem(inventorySlotNumber, 'item');
        }
    }
}