import GameScene from './GameScene';
import PlayerCharacter from '../classes/PlayerCharacter';
import Enemy from '../classes/Enemy';
import eventsCenter from '../utils/EventsCenter';
import NewBattleUIScene from './NewBattleUIScene';

export default class NewBattleScene extends Phaser.Scene {
    public interactionState!: string;
    private heroes!: PlayerCharacter[];
    private enemies!: Enemy[];
    private units!: (PlayerCharacter | Enemy)[];
    private index!: number;
    private gameScene!: GameScene;
    private player1HPText!: Phaser.GameObjects.Text;
    private player2MPText!: Phaser.GameObjects.Text;

    constructor() {
        super('NewBattle');
    }

    create() {

        this.gameScene = <GameScene>this.scene.get('Game');
        this.interactionState = 'init';

        // set background to grey
        this.cameras.main.setBackgroundColor('rgb(235, 235, 235)');

        this.startBattle();

        this.sys.events.on('wake', this.startBattle, this);

    }

    handleActionSelection(data: { action: string, target: Enemy | PlayerCharacter }) {
        this.interactionState = `handling${data.action}select`;

        const battleUIScene = <NewBattleUIScene>this.scene.get('NewBattleUI');
        battleUIScene.hideUIFrames();

        // see who goes first
        this.units = this.units.sort((a, b) => {
            if (a.initiative > b.initiative) {
                return -1;
            }
            else {
                return 1;
            }
        });

        // let all the units take their action this turn
        let totalCutsceneTime = 0;
        for (const [index, unit] of this.units.entries()) {

            totalCutsceneTime += 2000;
            if (unit instanceof Enemy) {
                this.time.addEvent({
                    delay: index * 2000,
                    callback: this.handleEnemyUnitTurn,
                    callbackScope: this,
                    args: [unit]
                });
            }
            else {
                this.time.addEvent({
                    delay: index * 2000,
                    callback: this.handlePlayerUnitTurn,
                    callbackScope: this,
                    args: [unit, data.target]
                });
            }
        }
        this.time.addEvent({
            delay: totalCutsceneTime,
            callback: this.startNewTurn,
            callbackScope: this
        });
    }

    handleEnemyUnitTurn(enemy: Enemy) {
        // just attack the player for now...
        enemy.attack(this.heroes[0]);
        this.updateBattleScenePlayerStats();
        eventsCenter.emit('NewMessage', `The ${enemy.type} attacks ${this.heroes[0].type} for ${enemy.damage} damage.`);


        if (!this.heroes[0].living) {
            this.time.addEvent({
                delay: 2000,
                callback: this.gameOver,
                callbackScope: this
            });
        }
    }

    gameOver() {
        eventsCenter.emit('NewMessage', 'Thou art defeated.');
    }

    handlePlayerUnitTurn(player: PlayerCharacter, target: PlayerCharacter | Enemy) {
        if (!player.living) {
            this.interactionState = 'gameover';
            return;
        }

        if (this.interactionState === 'handlingattackselect') {
            player.attack(target);
            eventsCenter.emit('NewMessage', `The ${player.type} attacks the ${target.type} for ${player.damage} damage.`);
        }
    }

    updateBattleScenePlayerStats() {
        this.player1HPText.setText(`HP: ${this.heroes[0].hp}`);
    }

    checkForVictory() {
        let victory = true;
        // if all enemies are dead we have victory
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].living) {
                victory = false;
            }
        }
        return victory;
    }

    showGoldAndExperience() {
        eventsCenter.emit('NewMessage', 'You receive 3 gold pieces.\nYou receive 10 experience points.');
    }


    sendPlayerInfoToGameScene() {

        for (const unit of this.heroes) {
            if (unit.type === 'Warrior') {
                this.gameScene.player.health = unit.hp;
                eventsCenter.emit('updateHP', this.gameScene.player.health);

                this.gameScene.player.gold += 3;
                eventsCenter.emit('updateGold', this.gameScene.player.gold);

                this.gameScene.player.experience += 10;
                eventsCenter.emit('updateXP', this.gameScene.player.experience);
            }
        }
    }

    endBattle() {
        // send the player info to the game scene ui
        this.sendPlayerInfoToGameScene();

        // clear state, remove sprites
        this.heroes.length = 0;
        this.enemies.length = 0;
        for (let i = 0; i < this.units.length; i++) {
            // link item
            this.units[i].destroy();
        }
        this.units.length = 0;

        this.interactionState = 'init';

        // sleep the ui
        this.scene.sleep('NewBattleUI');
        // this.scene.stop('NewBattleUI');

        // return to game scene and sleep current battle scene
        this.scene.switch('Game');
    }


    startNewTurn() {
        // check for victory or game over state
        if (this.interactionState === 'gameover') {
            this.endBattleGameOver();
            return;
        }

        const battleUIScene = <NewBattleUIScene>this.scene.get('NewBattleUI');
        battleUIScene.disableAllActionButtons();

        if (this.checkForVictory()) {
            // deliver the victory message and exit the battle
            eventsCenter.emit('NewMessage', 'Thine enemies are slain.');
            this.time.addEvent({
                delay: 2000,
                callback: this.showGoldAndExperience,
                callbackScope: this
            });
            this.time.addEvent({
                delay: 4000,
                callback: this.endBattle,
                callbackScope: this
            });
            return;
        }

        battleUIScene.disableAllActionButtons();
        battleUIScene.showCommandAndHotkeyFrames();
        this.interactionState = 'mainselect';
    }

    private startBattle() {
        // sets the battle music - muted for now
        // const song = this.sound.add('battlesong', {
        //     loop: true
        // });
        // song.play();

        this.interactionState = 'init';

        this.add.image(2, 430, 'actionMenuFrame')
            .setOrigin(0, 0);

        this.add.image(236, 606, 'heroMenuFrame')
            .setOrigin(0, 0);

        const warrior = new PlayerCharacter(this, 270, 675, 'hero', 0, 'Warrior', this.gameScene.player.health, this.gameScene.player.damage, 10);
        this.add.existing(warrior);

        this.add.text(250, 610, 'Warrior', {fontSize: '45px', color: '#fff', fontFamily: 'CustomFont'})
            .setResolution(10);

        this.player1HPText = this.add.text(300, 640, `HP: ${this.gameScene.player.health}`, {
            fontSize: '45px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);

        this.player2MPText = this.add.text(300, 670, 'MP: 0', {
            fontSize: '45px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(10);

        const cyberFly = new Enemy(this, Number(this.game.config.width) / 2, 280, 'cyberfly', null, 'CyberFly', 10, 3, 100);
        this.add.existing(cyberFly);

        this.heroes = [warrior];

        this.enemies = [cyberFly];

        this.units = this.heroes.concat(this.enemies);

        this.index = -1;

        this.scene.run('NewBattleUI');

        eventsCenter.removeListener('actionSelect');
        eventsCenter.on('actionSelect', this.handleActionSelection, this);
    }

    private endBattleGameOver() {
        // cut gold in half, set hit points to full, cut to game over screen, respawn

        this.gameScene.player.gold = Math.floor(this.gameScene.player.gold / 2);
        eventsCenter.emit('updateGold', this.gameScene.player.gold);
        this.gameScene.player.health = this.gameScene.player.maxHealth;
        eventsCenter.emit('updateHP', this.gameScene.player.health);

        const battleUIScene = this.scene.get('NewBattleUI');
        battleUIScene.cameras.main.fadeOut(2000);
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
            this.scene.sleep('NewBattleUI');


            const battleUIScene = <NewBattleUIScene>this.scene.get('NewBattleUI');
            battleUIScene.disableAllActionButtons();
            battleUIScene.cameras.main.fadeIn(0);

            const battleScene = <NewBattleScene>this.scene.get('NewBattle');
            battleScene.interactionState = 'init';
            battleScene.cameras.main.fadeIn(0);

            // return to game scene and sleep current battle scene
            this.scene.switch('GameOver');
        });
    }
}