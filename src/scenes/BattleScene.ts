import Phaser from 'phaser';
import PlayerCharacter from '../classes/PlayerCharacter';
import Enemy from '../classes/Enemy';

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
        // player character - warrior
        const warrior = new PlayerCharacter(this, 700, 155, 'player', 16, 'Warrior', 100, 100);
        this.add.existing(warrior);

        // add second player
        // player character - mage
        const mage = new PlayerCharacter(this, 700, 360, 'player', 19, 'Mage', 80, 100);
        this.add.existing(mage);

        const dragonBlue = new Enemy(this, 125, 100, 'dragonblue', null, 'Dragon', 50, 3);
        this.add.existing(dragonBlue);

        const dragonOrange = new Enemy(this, 125, 300, 'dragonorange', null, 'Dragon2', 50, 3);
        this.add.existing(dragonOrange);

        // array with heroes
        this.heroes = [warrior, mage];

        // array with enemies
        this.enemies = [dragonBlue, dragonOrange];

        // array with both parties, who will attack
        this.units = this.heroes.concat(this.enemies);

        this.index = -1; // currently active unit

        // run ui scene at the same time
        this.scene.run('BattleUI');
    }

    nextTurn() {
        // if we have victory or game over
        if (this.checkEndBattle()) {
            this.endBattle();
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
        return victory || gameOver;
    }

    receivePlayerSelection(action: string, target: number) {
        if (action === 'attack') {
            this.units[this.index].attack(this.enemies[target]);
        }
        // next turn in 3 seconds
        this.time.addEvent({delay: 3000, callback: this.nextTurn, callbackScope: this});
    }

    endBattle() {
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
}