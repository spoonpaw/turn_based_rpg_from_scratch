// TODO: Add Sound Effects to battle scene (attack, heal, run)

// TODO: Add Ability button functionality

// TODO: Add logic for armor decreasing damage taken.

// TODO: Add logic for weapons increasing damage

import {Enemy} from '../classes/Enemy';
import PlayerCharacter from '../classes/PlayerCharacter';
import {enemies} from '../enemies/enemies';
import soldier, {IStatIncreases} from '../jobs/Soldier';
import {levels} from '../levels/Levels';
import eventsCenter from '../utils/EventsCenter';
import BattleUIScene from './BattleUIScene';
import GameScene from './GameScene';
import MusicScene from './MusicScene';
import UIScene from './UIScene';

export default class BattleScene extends Phaser.Scene {
    public interactionState!: string;
    public enemies!: Enemy[];
    public heroes!: PlayerCharacter[];
    private units!: (PlayerCharacter | Enemy)[];
    private turnUnits!: (PlayerCharacter | Enemy)[];
    private index!: number;
    private gameScene!: GameScene;
    public player1HPText!: Phaser.GameObjects.Text;
    private player1MPText!: Phaser.GameObjects.Text;
    private background!: Phaser.GameObjects.Image;
    private battleUIScene!: BattleUIScene;
    private turnIndex!: number;
    private musicScene!: MusicScene;
    private uiScene!: UIScene;

    constructor() {
        super('Battle');
    }

    create(): void {

        this.gameScene = <GameScene>this.scene.get('Game');
        this.uiScene = <UIScene>this.scene.get('UI');
        this.musicScene = <MusicScene>this.scene.get('Music');

        this.startBattle();

        this.sys.events.on('wake', this.startBattle, this);
    }

    private startBattle(): void {
        this.uiScene.selectCancel();

        this.turnIndex = -1;
        // sets the battle music - muted for now

        this.musicScene.titleSong.stop();
        this.musicScene.battleSong.play();

        // set background to grey
        this.cameras.main.setBackgroundColor('rgb(235, 235, 235)');

        this.background = this.add.image(0, 0, 'overworldbackground')
            .setOrigin(0, 0);
        // based on your game size, it may "stretch" and distort.
        this.background.displayWidth = this.sys.canvas.width;
        this.background.displayHeight = this.sys.canvas.height - 291;
        this.battleUIScene = <BattleUIScene>this.scene.get('BattleUI');

        this.gameScene.input.keyboard.enabled = false;

        this.interactionState = 'init';

        this.add.image(2, 430, 'actionMenuFrame')
            .setOrigin(0, 0);

        this.add.image(236, 606, 'heroMenuFrame')
            .setOrigin(0, 0);

        // instantiate the warrior player (player 1)
        const soldier = new PlayerCharacter(
            this,
            270,
            675,
            'hero',
            0
        );

        this.add.existing(soldier);

        this.add.text(
            250,
            610,
            'Soldier',
            {
                fontSize: '45px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
            .setResolution(10);

        this.player1HPText = this.add.text(300, 645, `HP: ${this.gameScene.player.stats.currentHP}/${this.gameScene.player.stats.maxHP}`, {
            fontSize: '35px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);


        let currentMP;
        let maxMP;

        if (this.gameScene.player.type === 'Soldier') {
            currentMP = 0;
            maxMP = 0;
        }
        else {
            currentMP = this.gameScene.player.stats.currentMP;
            maxMP = this.gameScene.player.stats.maxMP;
        }
        this.player1MPText = this.add.text(300, 670, `MP: ${currentMP}/${maxMP}`, {
            fontSize: '35px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);

        const selectedEnemy: string = Phaser.Math.RND.pick(levels[this.gameScene.currentMap as keyof typeof levels].enemies ?? []);

        const enemy = new Enemy(
            this,
            Number(this.game.config.width) / 2,
            280,
            selectedEnemy,
            undefined
        );

        this.add.existing(enemy);

        this.heroes = [soldier];

        this.enemies = [enemy];

        this.units = this.heroes.concat(this.enemies);

        this.index = -1;

        this.scene.run('BattleUI');

        eventsCenter.removeListener('actionSelect');
        eventsCenter.on('actionSelect', this.handleActionSelection, this);
    }

    private handleActionSelection(data: { action: string, target: Enemy | PlayerCharacter }): void {
        this.interactionState = `handling${data.action}select`;

        this.turnUnits = BattleScene.sortUnits(this.units);

        this.battleUIScene.hideUIFrames();
        this.battleUIScene.closeInventory();

        if (data.action === 'run') {
            if (BattleScene.escapeTest()) {

                // run was successful, exit combat
                // deliver the successful retreat message and exit the battle
                eventsCenter.emit('Message', 'You have successfully retreated.');
                this.time.addEvent({
                    delay: 2000,
                    callback: this.endBattle,
                    callbackScope: this
                });
                return;
            }
            else {
                // announce that the run failed! then let the enemies act!!
                this.turnUnits = this.units.filter(value => {
                    return !(value instanceof PlayerCharacter);
                });
                eventsCenter.emit('Message', `${this.heroes[0].type} has failed to retreat!`);
                this.time.addEvent({
                    delay: 2000,
                    callback: this.parseNextUnitTurn,
                    callbackScope: this,
                    args: [data]
                });
                return;
            }
        }

        // process the turns one by one with the proper delays
        this.parseNextUnitTurn(data);
    }

    private static escapeTest(): boolean {
        return Phaser.Math.Between(1, 2) === 1;
    }

    private parseNextUnitTurn(data: { action: string; target: Enemy | PlayerCharacter }): void {
        this.turnIndex += 1;

        let turnRunTime = 0;
        const currentUnit = this.turnUnits[this.turnIndex];
        if (currentUnit instanceof Enemy) {
            // the enemy is going to use an ability (default physical attack)
            if (currentUnit.living) {
                turnRunTime += currentUnit.runTurn();
            }
        }
        // current unit must be a player character if not an enemy
        else {
            if (currentUnit.living) {
                turnRunTime += currentUnit.runTurn(data);
            }
        }

        if (this.gameOverTest()) {
            this.time.addEvent({
                delay: turnRunTime,
                callback: this.endBattleGameOver,
                callbackScope: this
            });
        }

        // if this is the last turn, then start a new turn after the correct delay!
        else if (this.turnIndex === this.turnUnits.length - 1) {
            this.time.addEvent({
                delay: turnRunTime,
                callback: this.startNewTurn,
                callbackScope: this
            });
        }
        else {
            this.time.addEvent({
                delay: turnRunTime,
                callback: this.parseNextUnitTurn,
                callbackScope: this,
                args: [data]
            });
        }
    }

    private gameOverTest() {
        return !this.heroes[0].living;
    }

    private static sortUnits(units: (PlayerCharacter | Enemy)[]): (PlayerCharacter | Enemy)[] {

        return units.sort((a, b) => {
            // randomize the turn order every round based on agility
            const aInitiative = a.getInitiative();
            const bInitiative = b.getInitiative();

            if (aInitiative > bInitiative) {
                return -1;
            }
            else {
                return 1;
            }
        });

    }

    private checkForLevelUp(): { levelUp: boolean, newLevel: number } {
        let experienceAmount = 0;

        for (const enemy of this.enemies) {
            const enemyData = enemies.find(obj => {
                return obj.name === enemy.texture.key;
            });
            experienceAmount += enemyData?.experience ?? 0;
        }

        const currentLevel = Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.player.experience)));

        const newLevel = Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.player.experience + experienceAmount)));

        return {levelUp: newLevel > currentLevel, newLevel};
    }

    private startNewTurn(): void {
        this.battleUIScene.commandMenuText.setText('Command?');

        this.turnIndex = -1;
        // check for victory or game over state
        if (this.interactionState === 'gameover') {
            this.endBattleGameOver();
            return;
        }

        this.battleUIScene.disableAllActionButtons();

        if (this.checkForVictory()) {
            // check if this fight provides enough experience for the hero to level up.
            // calculate for whether the total cut scene time should have a level up message (+2000 ms)

            let levelUpDelay = 0;
            const levelUpData = this.checkForLevelUp();
            if (levelUpData.levelUp) {
                levelUpDelay += 2000;
            }

            // deliver the victory message and exit the battle
            eventsCenter.emit('Message', 'Thine enemies are slain.');
            this.time.addEvent({
                delay: 2000,
                callback: this.showGoldAndExperience,
                callbackScope: this,
                args: [this.enemies]
            });

            if (levelUpData.levelUp) {
                this.time.addEvent({
                    delay: 4000,
                    callback: () => eventsCenter.emit('Message', `${this.heroes[0].type} has reached level ${levelUpData.newLevel}!`)
                });
            }

            this.time.addEvent({
                delay: 4000 + levelUpDelay,
                callback: this.endBattle,
                callbackScope: this
            });
            return;
        }

        this.battleUIScene.disableAllActionButtons();
        this.battleUIScene.showCommandAndHotkeyFrames();
        this.interactionState = 'mainselect';

    }

    private checkForVictory(): boolean {
        let victory = true;
        // if all enemies are dead we have victory
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].living) {
                victory = false;
            }
        }

        return victory;
    }

    private showGoldAndExperience(currentEnemies: Enemy[]): void {
        // the gold pieces/experience points should vary depending on the enemy
        let goldAmount = 0;
        let experienceAmount = 0;

        for (const enemy of currentEnemies) {
            const enemyData = enemies.find(obj => {
                return obj.name === enemy.texture.key;
            });
            goldAmount += enemyData?.gold ?? 0;
            experienceAmount += enemyData?.experience ?? 0;
        }

        eventsCenter.emit('Message', `You receive ${goldAmount} gold pieces.\nYou receive ${experienceAmount} experience points.`);
    }

    private endBattle(): void {
        this.musicScene.battleSong.stop();
        this.musicScene.titleSong.play();

        this.battleUIScene.disableAllActionButtons();
        // send the player info to the game scene ui

        this.sendPlayerInfoToGameScene();

        // clear state, remove sprites
        this.heroes.length = 0;
        this.enemies.length = 0;
        for (let i = 0; i < this.units.length; i++) {
            // unlink item
            this.units[i].setVisible(false);
            this.units[i].destroy();
        }
        this.units.length = 0;
        for (const child of this.children.getChildren()) {
            child.destroy();
        }

        this.interactionState = 'init';

        // sleep the ui
        this.scene.sleep('BattleUI');

        this.gameScene.input.keyboard.enabled = true;

        // return to game scene and sleep current battle scene
        this.scene.switch('Game');
    }

    private sendPlayerInfoToGameScene(): void {
        for (const unit of this.heroes) {
            if (unit.type === 'Soldier') {
                this.gameScene.player.stats.currentHP = unit.stats.currentHP;
                eventsCenter.emit('updateHP', this.gameScene.player.stats.currentHP);

                let goldAmount = 0;
                let experienceAmount = 0;

                for (const enemy of this.enemies) {
                    const enemyData = enemies.find(obj => {
                        return obj.name === enemy.texture.key;
                    });
                    goldAmount += enemyData?.gold ?? 0;
                    experienceAmount += enemyData?.experience ?? 0;
                }

                if (this.interactionState === 'handlingrunselect') {
                    goldAmount = 0;
                    experienceAmount = 0;
                }

                this.gameScene.player.gold += goldAmount;

                // eventsCenter.emit('updateGold', this.gameScene.player.gold);
                eventsCenter.emit('updateMP', this.gameScene.player.stats.currentMP, this.gameScene.player.stats.maxMP);

                const currentLevel = Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.player.experience)));

                this.gameScene.player.experience += experienceAmount;

                const newLevel = Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.player.experience)));

                if (currentLevel < newLevel) {

                    this.gameScene.player.stats = {
                        strength: this.gameScene.player.stats.strength + this.getStatIncrease('strength', newLevel),
                        agility: this.gameScene.player.stats.agility + this.getStatIncrease('agility', newLevel),
                        vitality: this.gameScene.player.stats.vitality + this.getStatIncrease('vitality', newLevel),
                        intellect: this.gameScene.player.stats.intellect + this.getStatIncrease('intellect', newLevel),
                        luck: this.gameScene.player.stats.luck + this.getStatIncrease('luck', newLevel),
                        currentHP: this.heroes[0].stats.currentHP,
                        maxHP: this.gameScene.player.stats.maxHP + this.getStatIncrease('vitality', newLevel) * 2,
                        currentMP: this.heroes[0].stats.currentMP,
                        maxMP: this.gameScene.player.stats.maxMP + this.getStatIncrease('intellect', newLevel) * 2,
                        attack: this.gameScene.player.stats.attack + this.getStatIncrease('strength', newLevel),
                        defense: this.gameScene.player.stats.defense + this.getStatIncrease('agility', newLevel) / 2
                    };

                }

                eventsCenter.emit('updateXP', this.gameScene.player.experience);
            }
        }
    }

    private getStatIncrease(stat: keyof IStatIncreases, level: number): number {
        const statIncreaseRangeIncrementObject = soldier.statIncreases[stat].find(obj => {
            return obj.range[0] <= level && level <= obj.range[1];
        });
        return statIncreaseRangeIncrementObject?.increment ?? 0;
    }

    private endBattleGameOver(): void {
        // cut gold in half, set hit points to full, cut to game over screen, respawn

        eventsCenter.emit('Message', 'Thou art vanquished!');
        this.gameScene.player.gold = Math.floor(this.gameScene.player.gold / 2);
        // eventsCenter.emit('updateGold', this.gameScene.player.gold);
        eventsCenter.emit('updateMP', this.gameScene.player.stats.currentMP, this.gameScene.player.stats.maxMP);
        this.gameScene.player.stats.currentHP = this.gameScene.player.stats.maxHP;
        eventsCenter.emit('updateHP', this.gameScene.player.stats.currentHP);

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.battleUIScene.cameras.main.fadeOut(2000);
                this.cameras.main.fadeOut(3000);
            },
            callbackScope: this
        });



        this.cameras.main.once('camerafadeoutcomplete', () => {
            // clear state, remove sprites
            this.heroes.length = 0;
            this.enemies.length = 0;
            for (let i = 0; i < this.units.length; i++) {
                // link item
                this.units[i].destroy();
            }
            this.units.length = 0;


            // sleep the ui
            this.scene.sleep('BattleUI');


            this.battleUIScene.disableAllActionButtons();
            this.battleUIScene.cameras.main.fadeIn(0);

            this.interactionState = 'init';
            this.cameras.main.fadeIn(0);

            // return to game scene and sleep current battle scene
            this.scene.switch('GameOver');
        });
    }
}