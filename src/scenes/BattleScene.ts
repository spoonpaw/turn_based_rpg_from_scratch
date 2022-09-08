import Phaser from 'phaser';
import PlayerCharacter from '../classes/PlayerCharacter';
import Enemy from '../classes/Enemy';
import GameScene from './GameScene';
import eventsCenter from '../utils/EventsCenter';

export default class BattleScene extends Phaser.Scene {
    heroes!: PlayerCharacter[];
    enemies!: Enemy[];
    private units!: (Enemy | PlayerCharacter)[];
    private index!: number;

    constructor() {
        super('Battle');
    }

    create() {

        // set background to blue
        this.cameras.main.setBackgroundColor('rgb(65, 97, 251)');

        this.startBattle();

        // on wake event we call startBattle too
        this.sys.events.on('wake', this.startBattle, this);
    }

    startBattle() {
        // game scene reference
        const gameScene = <GameScene>this.scene.get('Game');

        // player character - warrior
        const warrior = new PlayerCharacter(this, 700, 155, 'player', 16, 'Warrior', gameScene.player.health, 5);
        this.add.existing(warrior);

        // add second player
        // player character - mage
        // const mage = new PlayerCharacter(this, 700, 360, 'player', 19, 'Mage', 80, 49);
        // this.add.existing(mage);

        const dragonBlue = new Enemy(this, 125, 100, 'dragonblue', null, 'Dragon', 5, 3);
        this.add.existing(dragonBlue);

        const dragonOrange = new Enemy(this, 125, 300, 'dragonorange', null, 'Dragon2', 5, 3);
        this.add.existing(dragonOrange);

        // array with heroes
        this.heroes = [warrior];
        // this.heroes = [warrior, mage];

        // array with enemies
        this.enemies = [dragonBlue, dragonOrange];

        // array with both parties, who will attack
        this.units = this.heroes.concat(this.enemies);

        this.index = -1; // currently active unit

        // run ui scene at the same time
        this.scene.run('BattleUI');
    }

    sendVictoryMessage() {
        // display the victory message
        this.events.emit(
            'Message',
            'Thine enemies are slain!'
        );
    }

    sendDefeatMessage() {
        // display the victory message
        this.events.emit(
            'Message',
            'Thou hast been vanquished!'
        );
    }

    sendGoldMessage() {
        // display the gold message
        this.events.emit(
            'Message',
            'You receive 3 gold pieces.'
        );
    }

    sendExperienceMessage() {
        // display the gold message
        this.events.emit(
            'Message',
            'You receive 10 experience points.'
        );
    }

    endBattleGameOver() {
        // cut gold in half, set hit points to full, cut to game over screen, respawn
        const gameScene = <GameScene>this.scene.get('Game');
        gameScene.player.gold = Math.floor(gameScene.player.gold / 2);
        eventsCenter.emit('updateGold', gameScene.player.gold);
        gameScene.player.health = gameScene.player.maxHealth;
        eventsCenter.emit('updateHP', gameScene.player.health);

        const battleUIScene = this.scene.get('BattleUI');
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
            this.scene.sleep('BattleUI');


            const battleUIScene = this.scene.get('BattleUI');
            battleUIScene.cameras.main.fadeIn(0);
            const battleScene = this.scene.get('Battle');
            battleScene.cameras.main.fadeIn(0);

            // return to game scene and sleep current battle scene
            this.scene.switch('GameOver');
        });

    }

    nextTurn() {
        // if we have victory or game over
        if (this.checkEndBattle() === 'victory') {

            this.sendVictoryMessage();

            this.time.addEvent({
                delay: 3000, callback: this.sendExperienceMessage, callbackScope: this
            });

            this.time.addEvent({
                delay: 6000, callback: this.sendGoldMessage, callbackScope: this
            });

            this.time.addEvent({
                delay: 8500, callback: this.endBattle, callbackScope: this
            });

            return;
        }
        else if (this.checkEndBattle() === 'gameover') {
            // Add death message 'Thou hast been vanquished.'
            this.sendDefeatMessage();

            this.time.addEvent({
                delay: 2500, callback: this.endBattleGameOver, callbackScope: this
            });

            return;
        }

        do {
            // currently active unit
            this.index++;
            // if there are no more units, we start again from the first one
            if (this.index >= this.units.length) {
                this.index = 0;
            }
        } while (!this.units[this.index].living);

        // if it's a player hero
        if (this.units[this.index] instanceof PlayerCharacter) {
            // we need the player to select action and then enemy
            this.events.emit('PlayerSelect', this.index);
        }
        else { // else if it's an enemy unit
            // pick a random living hero to be attacked
            let r;

            do {
                r = Math.floor(Math.random() * this.heroes.length);
            } while (!this.heroes[r].living);

            // call the enemy's attack function
            this.units[this.index].attack(this.heroes[r]);

            // add timer for the next turn, so gameplay will be smooth
            this.time.addEvent({
                delay: 3000,
                callback: this.nextTurn,
                callbackScope: this
            });
        }
    }

    checkEndBattle() {
        let victory = true;
        // if all enemies are dead we have victory
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].living) {
                victory = false;
            }
        }
        let gameOver = true;
        // if all heroes are dead we have game over
        for (let i = 0; i < this.heroes.length; i++) {
            if (this.heroes[i].living) {
                gameOver =false;
            }
        }
        if (victory) {
            return 'victory';
        }
        else if (gameOver) {
            return 'gameover';
        }
    }

    receivePlayerSelection(action: string, target: number) {
        if (action === 'attack') {
            this.units[this.index].attack(this.enemies[target]);
        }
        // next turn in 3 seconds
        this.time.addEvent({delay: 3000, callback: this.nextTurn, callbackScope: this});
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


        // sleep the ui
        this.scene.sleep('BattleUI');

        // return to game scene and sleep current battle scene
        this.scene.switch('Game');
    }

    sendPlayerInfoToGameScene() {
        const gameScene = <GameScene>this.scene.get('Game');

        for (const unit of this.heroes) {
            if (unit.type === 'Warrior'){
                gameScene.player.health = unit.hp;
                eventsCenter.emit('updateHP', gameScene.player.health);

                gameScene.player.gold += 3;
                eventsCenter.emit('updateGold', gameScene.player.gold);

                gameScene.player.experience += 10;
                eventsCenter.emit('updateXP', gameScene.player.experience);
            }
        }
    }
}