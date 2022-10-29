// TODO: Add logic for armor decreasing damage taken.

// TODO: Add logic for weapons increasing damage

import GameScene from './GameScene';
import PlayerCharacter from '../classes/PlayerCharacter';
import {Enemy} from '../classes/Enemy';
import eventsCenter from '../utils/EventsCenter';
import BattleUIScene from './BattleUIScene';
import {levels} from '../levels/Levels';
import {Turn} from '../types/Turn';
import soldier, {IStatIncreases} from '../jobs/Soldier';
import {enemies} from '../enemies/enemies';

export default class BattleScene extends Phaser.Scene {
    public interactionState!: string;
    public enemies!: Enemy[];
    public heroes!: PlayerCharacter[];
    private units!: (PlayerCharacter | Enemy)[];
    private index!: number;
    private gameScene!: GameScene;
    private player1HPText!: Phaser.GameObjects.Text;
    private player1MPText!: Phaser.GameObjects.Text;
    private background!: Phaser.GameObjects.Image;
    private battleUIScene!: BattleUIScene;

    constructor() {
        super('Battle');
    }

    create(): void {

        this.gameScene = <GameScene>this.scene.get('Game');
        this.interactionState = 'init';

        // set background to grey
        this.cameras.main.setBackgroundColor('rgb(235, 235, 235)');
        this.background = this.add.image(0, 0, 'overworldbackground')
            .setOrigin(0, 0);
        // based on your game size, it may "stretch" and distort.
        this.background.displayWidth = this.sys.canvas.width;
        this.background.displayHeight = this.sys.canvas.height - 291;

        this.startBattle();

        this.sys.events.on('wake', this.startBattle, this);
    }

    private startBattle(): void {
        // sets the battle music - muted for now
        // const song = this.sound.add('battlesong', {
        //     loop: true
        // });
        // song.play();
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

        this.player1HPText = this.add.text(300, 640, `HP: ${this.gameScene.player.stats.currentHP}`, {
            fontSize: '45px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);

        this.player1MPText = this.add.text(300, 670, 'MP: 0', {
            fontSize: '45px',
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

        this.battleUIScene.hideUIFrames();

        // see who goes first - sort the unit list
        this.units = this.units.sort((a, b) => {
            // randomize the turn order every round based on dexterity
            const aInitiative = a.getInitiative();
            const bInitiative = b.getInitiative();

            if (aInitiative > bInitiative) {
                return -1;
            }
            else {
                return 1;
            }
        });
        // simulate the entire combat ahead of time. storing all turn info.
        //  that way we will know the exact outcome and be able to precisely plan for
        //  each message and allow for exactly the right amount of time before ending
        //  the combat. the turn information will need to be stored and parsed in a way that
        //  generates the correct messages for the turn and starts the next turn after the correct ms

        const turnArray: Turn[] = [];

        // build the turn list
        for (const unit of this.units) {
            // skip the unit if it's dead

            if (!unit.living) {
                continue;
            }

            // if the current unit is an enemy, it will attack the hero
            if (unit instanceof Enemy) {
                const currentTurn = unit.calculateAttack(this.heroes[0]);
                if (currentTurn) {
                    turnArray.push(currentTurn);
                }
            }
            else {
                const currentTurn = unit.calculateAttack(data.target);
                if (currentTurn) {
                    turnArray.push(currentTurn);
                }
            }
        }

        // get total cutscene time

        const totalCutSceneTime = turnArray.length * 2000;

        // iterate over the turnArray, pass the turn data object to the
        //  unit turn handler methods

        for (const [index, turn] of turnArray.entries()) {
            if (turn.actor instanceof Enemy) {
                this.time.addEvent({
                    delay: index * 2000,
                    callback: this.handleEnemyUnitTurn,
                    callbackScope: this,
                    args: [turn]
                });
            }
            else {
                this.time.addEvent({
                    delay: index * 2000,
                    callback: this.handlePlayerUnitTurn,
                    callbackScope: this,
                    args: [turn]
                });
            }
        }
        this.time.addEvent({
            delay: totalCutSceneTime,
            callback: this.startNewTurn,
            callbackScope: this
        });
    }

    private startNewTurn(): void {
        // check for victory or game over state
        if (this.interactionState === 'gameover') {
            this.endBattleGameOver();
            return;
        }

        this.battleUIScene.disableAllActionButtons();

        if (this.checkForVictory()) {
            // deliver the victory message and exit the battle
            eventsCenter.emit('Message', 'Thine enemies are slain.');
            this.time.addEvent({
                delay: 2000,
                callback: this.showGoldAndExperience,
                callbackScope: this,
                args: [this.enemies]
            });
            this.time.addEvent({
                delay: 4000,
                callback: this.endBattle,
                callbackScope: this
            });
            return;
        }

        this.battleUIScene.disableAllActionButtons();
        this.battleUIScene.showCommandAndHotkeyFrames();
        this.interactionState = 'mainselect';
    }

    private handlePlayerUnitTurn(turn: Turn): void {
        if (turn.actor instanceof PlayerCharacter) {
            if (this.interactionState === 'handlingattackselect') {
                turn.actor.processTurn(turn);
                turn.target.updateSceneOnReceivingDamage();
            }
        }
    }

    private handleEnemyUnitTurn(turn: Turn): void {
        if (turn.actor instanceof Enemy) {
            turn.actor.processTurn(turn);
            turn.target.updateSceneOnReceivingDamage();
            this.updateBattleScenePlayerStats();

            if (!this.heroes[0].living) {

                this.time.addEvent({
                    delay: 2000,
                    callback: this.gameOver,
                    callbackScope: this
                });

                this.time.addEvent({
                    delay: 4000,
                    callback: this.endBattleGameOver,
                    callbackScope: this
                });
            }
        }
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

    private gameOver(): void {
        this.battleUIScene.hideUIFrames();
        eventsCenter.emit('Message', 'Thou art defeated.');
    }

    private updateBattleScenePlayerStats(): void {
        this.player1HPText.setText(`HP: ${this.heroes[0].stats.currentHP}`);
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

                this.gameScene.player.gold += goldAmount;

                eventsCenter.emit('updateGold', this.gameScene.player.gold);

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

    private endBattle(): void {
        // send the player info to the game scene ui
        this.sendPlayerInfoToGameScene();

        // clear state, remove sprites
        this.heroes.length = 0;
        this.enemies.length = 0;
        for (let i = 0; i < this.units.length; i++) {
            // unlink item
            this.units[i].destroy();
        }
        this.units.length = 0;

        this.interactionState = 'init';

        // sleep the ui
        this.scene.sleep('BattleUI');

        this.gameScene.input.keyboard.enabled = true;

        // return to game scene and sleep current battle scene
        this.scene.switch('Game');
    }

    private endBattleGameOver(): void {
        // cut gold in half, set hit points to full, cut to game over screen, respawn

        this.gameScene.player.gold = Math.floor(this.gameScene.player.gold / 2);
        eventsCenter.emit('updateGold', this.gameScene.player.gold);
        this.gameScene.player.stats.currentHP = this.gameScene.player.stats.maxHP;
        eventsCenter.emit('updateHP', this.gameScene.player.stats.currentHP);

        this.battleUIScene.cameras.main.fadeOut(2000);
        this.cameras.main.fadeOut(3000);

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