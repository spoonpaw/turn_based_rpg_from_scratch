import GameScene from './GameScene';
import PlayerCharacter from '../classes/PlayerCharacter';
import {Enemy} from '../classes/Enemy';
import eventsCenter from '../utils/EventsCenter';
import BattleUIScene from './BattleUIScene';
import {levels} from '../levels/Levels';
import {Turn} from '../types/Turn';
import warrior from '../jobs/Warrior';

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

    startNewTurn(): void {
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
                callback: BattleScene.showGoldAndExperience,
                callbackScope: this
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

    handleActionSelection(data: { action: string, target: Enemy | PlayerCharacter }): void {
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

    private handlePlayerUnitTurn(turn: Turn): void {
        if (turn.actor instanceof PlayerCharacter) {
            if (this.interactionState === 'handlingattackselect') {
                turn.target.updateSceneOnReceivingDamage();
                turn.actor.processTurn(turn);
                this.updateBattleScenePlayerStats();
            }
        }
    }

    private handleEnemyUnitTurn(turn: Turn): void {
        if (turn.actor instanceof Enemy) {
            turn.target.updateSceneOnReceivingDamage();
            turn.actor.processTurn(turn);
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

    private static showGoldAndExperience(): void {
        eventsCenter.emit('Message', 'You receive 3 gold pieces.\nYou receive 10 experience points.');
    }

    private sendPlayerInfoToGameScene(): void {

        for (const unit of this.heroes) {
            if (unit.type === 'Warrior') {
                this.gameScene.player.stats.currentHP = unit.stats.currentHP;
                eventsCenter.emit('updateHP', this.gameScene.player.stats.currentHP);

                this.gameScene.player.gold += 3;
                eventsCenter.emit('updateGold', this.gameScene.player.gold);

                const currentLevel = Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.player.experience)));
                this.gameScene.player.experience += 10;

                const newLevel = Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.player.experience)));

                if (currentLevel < newLevel) {
                    // this.gameScene.player.stats = warrior.advancement[newLevel - 1];
                    this.gameScene.player.stats = {
                        constitution: warrior.advancement[newLevel - 1].constitution,

                        dexterity: warrior.advancement[newLevel - 1].dexterity,
                        strength: warrior.advancement[newLevel - 1].strength,
                        maxHP: warrior.advancement[newLevel - 1].maxHP,
                        armor: this.heroes[0].stats.armor,
                        agility: warrior.advancement[newLevel - 1].agility,
                        intellect: warrior.advancement[newLevel - 1].intellect,
                        weapon: this.heroes[0].stats.weapon,
                        currentMP: this.heroes[0].stats.currentMP,
                        maxMP: warrior.advancement[newLevel - 1].maxHP,
                        currentHP: this.heroes[0].stats.currentHP,

                    };
                }
                eventsCenter.emit('updateXP', this.gameScene.player.experience);
            }
        }
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
        const warrior = new PlayerCharacter(
            this,
            270,
            675,
            'hero',
            0
        );

        this.add.existing(warrior);

        this.add.text(
            250,
            610,
            'Warrior',
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

        this.heroes = [warrior];

        this.enemies = [enemy];

        this.units = this.heroes.concat(this.enemies);

        this.index = -1;

        this.scene.run('BattleUI');

        eventsCenter.removeListener('actionSelect');
        eventsCenter.on('actionSelect', this.handleActionSelection, this);
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