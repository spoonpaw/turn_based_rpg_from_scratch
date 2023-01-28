import Phaser from 'phaser';

import BattleScene from '../scenes/BattleScene';
import BattleUIScene from '../scenes/BattleUIScene';
import GameScene from '../scenes/GameScene';
import SaveAndLoadScene from '../scenes/SaveAndLoadScene';
import {Equipment} from '../types/Equipment';
import eventsCenter from '../utils/EventsCenter';
import Item from './Item';
import {MonsterJob} from './Jobs/MonsterJob';
import {PlayerJob} from './Jobs/PlayerJob';

export default abstract class Unit extends Phaser.GameObjects.Sprite {
    public id: number;
    abstract damageTween: Phaser.Tweens.Tween | Phaser.Tweens.Tween[];
    public equipment: Equipment = {
        body: undefined,
        head: undefined,
        offhand: undefined,
        weapon: undefined
    };
    public inventory: Item[] = [];
    // public living: boolean;
    // abstract stats: Stats;
    abstract currentHP: number;
    abstract currentResource: number;
    abstract key: string;
    abstract maxHP: number;
    protected battleScene: BattleScene;
    protected battleUIScene: BattleUIScene;
    protected gameScene: GameScene;
    protected saveAndLoadScene!: SaveAndLoadScene;

    protected constructor(
        public scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        public name: string,
        public job: PlayerJob | MonsterJob,
        id?: number
    ) {
        super(scene, x, y, texture, frame);

        // get reference to game scene
        this.gameScene = <GameScene>this.scene.scene.get('Game');
        this.battleScene = <BattleScene>this.scene.scene.get('Battle');
        this.battleUIScene = <BattleUIScene>this.scene.scene.get('BattleUI');
        this.saveAndLoadScene = <SaveAndLoadScene>this.scene.scene.get('SaveAndLoad');

        // this.living = true;

        if (id) this.id = id;
        else this.id = this.battleScene.generateID();
    }
    abstract getInitiative(): number;
    protected selectAbilityOrItem(actionIndex: number, actionType: 'ability' | 'item'): void {
        this.battleUIScene.hideAbilitySelectionUI();

        let availableActions: string[];
        if (actionType === 'ability') {

            // gets a list of all the abilities that the player character has learned and is currently able to use, based on their level
            availableActions = this.battleScene.gameScene.player.job.skills
                .filter(ability => ability.levelAttained <= this.battleScene.gameScene.player.level)
                .map(ability => ability.name);
        }
        else {
            availableActions = this.gameScene.player.inventory.map(item => item.name);
        }

        eventsCenter.emit('actionSelect', {
            action: availableActions[actionIndex],
            target: this,
            actionType
        });
    }

    public updateSceneOnReceivingDamage(): void {
        // take care of flashing the enemy sprite if it gets damaged or hiding it if it dies.
        if (this.currentHP <= 0) {
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

    applyHPChange(hpChangeAmount: number, hpText: Phaser.GameObjects.Text) {
        const initialCharacterHP = this.currentHP;

        // handle healing hp change (negative hp change signifies healing)
        if (hpChangeAmount < 0) {
            this.currentHP = Math.min(this.maxHP, this.currentHP - hpChangeAmount);
        }

        // apply damage
        else {
            // handle the math of taking damage,
            this.currentHP -= hpChangeAmount;
            this.updateSceneOnReceivingDamage();
        }

        if (this.currentHP <= 0) {
            this.currentHP = 0;
        }

        // setting up the ui hp
        hpText.setText(`HP: ${this.currentHP}/${this.maxHP}`);

        // return actual hp change
        return this.currentHP - initialCharacterHP;
    }

    protected unitButtonCallback() {
        if (this.battleScene.interactionState.startsWith('abilityaction')) {
            const abilitySlotNumber = Number(this.battleScene.interactionState.split('abilityaction')[1]);
            this.selectAbilityOrItem(abilitySlotNumber, 'ability');
        }
        else if (this.battleScene.interactionState.startsWith('inventoryaction')) {
            const inventorySlotNumber = Number(this.battleScene.interactionState.split('inventoryaction')[1]);
            this.selectAbilityOrItem(inventorySlotNumber, 'item');
        }
    }

    public isLiving(): boolean {
        return this.currentHP > 0;
    }
}