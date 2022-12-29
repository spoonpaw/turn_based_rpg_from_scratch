
// TODO: Add Ability button functionality


import BotCharacter from '../classes/BotCharacter';
import {Enemy} from '../classes/Enemy';
import PlayerCharacter from '../classes/PlayerCharacter';
import {enemies} from '../enemies/enemies';
import soldier, {IStatIncreases} from '../jobs/Soldier';
import {levels} from '../levels/Levels';
import eventsCenter from '../utils/EventsCenter';
import BattleUIScene from './BattleUIScene';
import GameScene from './GameScene';
import MusicScene from './MusicScene';
import SFXScene from './SFXScene';
import UIScene from './UIScene';

export default class BattleScene extends Phaser.Scene {
    public enemies!: Enemy[];
    public heroes!: (PlayerCharacter | BotCharacter)[];
    public interactionState!: string;
    public player1HPText!: Phaser.GameObjects.Text;
    public sfxScene!: SFXScene;
    private background!: Phaser.GameObjects.Image;
    private battleUIScene!: BattleUIScene;
    gameScene!: GameScene;
    private index!: number;
    private musicScene!: MusicScene;
    private player1MPText!: Phaser.GameObjects.Text;
    private player2?: PlayerCharacter | BotCharacter;
    player2HPText!: Phaser.GameObjects.Text;
    private turnIndex!: number;
    private turnUnits!: (PlayerCharacter | BotCharacter | Enemy)[];
    private uiScene!: UIScene;
    private units!: (PlayerCharacter | BotCharacter | Enemy)[];

    public constructor() {
        super('Battle');
    }

    private static escapeTest(): boolean {
        return Phaser.Math.Between(1, 2) === 1;
    }

    private static sortUnits(units: (PlayerCharacter | BotCharacter | Enemy)[]): (PlayerCharacter | BotCharacter | Enemy)[] {

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

    create(): void {

        this.gameScene = <GameScene>this.scene.get('Game');
        this.uiScene = <UIScene>this.scene.get('UI');
        this.musicScene = <MusicScene>this.scene.get('Music');
        this.sfxScene = <SFXScene>this.scene.get('SFX');

        this.startBattle();

        this.sys.events.on('wake', this.startBattle, this);
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

    private endBattle(): void {

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

        this.gameScene.input.keyboard!.enabled = true;

        // return to game scene and sleep current battle scene
        this.scene.switch('Game');
    }

    private endBattleGameOver(): void {
        // change to game over music
        this.musicScene.changeSong('gameover');

        // cut gold in half, set hit points to full, cut to game over screen, respawn
        eventsCenter.emit('Message', 'Thou art vanquished!');
        this.gameScene.player.gold = Math.floor(this.gameScene.player.gold / 2);
        // eventsCenter.emit('updateGold', this.gameScene.player.gold);
        eventsCenter.emit('updateMP', this.gameScene.player.stats.currentMP, this.gameScene.player.stats.maxMP);
        this.gameScene.player.stats.currentHP = this.gameScene.player.stats.maxHP;
        // eventsCenter.emit('updateHP', [this.gameScene.player.stats.currentHP, this.gameScene.player.stats.maxHP]);
        this.uiScene.updateHP(this.gameScene.player.stats.currentHP, this.gameScene.player.stats.maxHP);

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.musicScene.scene.bringToTop();
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

    private gameOverTest() {
        return !this.heroes[0].living;
    }

    private getStatIncrease(stat: keyof IStatIncreases, level: number): number {
        const statIncreaseRangeIncrementObject = soldier.statIncreases[stat].find(obj => {
            return obj.range[0] <= level && level <= obj.range[1];
        });
        return statIncreaseRangeIncrementObject?.increment ?? 0;
    }

    private handleActionSelection(
        data: {
            action: string,
            target: Enemy | PlayerCharacter | BotCharacter
        }
    ): void {
        this.interactionState = `handling${data.action}select`;

        this.turnUnits = BattleScene.sortUnits(this.units);

        this.battleUIScene.hideUIFrames();
        this.battleUIScene.closeInventory();

        if (data.action === 'run') {
            if (BattleScene.escapeTest()) {

                // run was successful, exit combat
                // deliver the successful retreat message and exit the battle
                eventsCenter.emit('Message', 'You have successfully retreated.');
                this.sfxScene.playSound('runaway');
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
                    return !(value instanceof PlayerCharacter || value instanceof BotCharacter);
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

    private parseNextUnitTurn(data: { action: string; target: Enemy | PlayerCharacter | BotCharacter }): void {
        this.turnIndex += 1;

        let turnRunTime = 0;
        const currentUnit = this.turnUnits[this.turnIndex];
        if (currentUnit instanceof Enemy) {
            // the enemy is going to use an ability (default physical attack)
            if (currentUnit.living) {
                turnRunTime += currentUnit.runTurn();
            }
        }
        // current unit must be a player character or bot if not an enemy
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

    private sendPlayerInfoToGameScene(): void {
        for (const unit of this.heroes) {
            if (unit instanceof PlayerCharacter) {
                this.gameScene.player.stats.currentHP = unit.stats.currentHP;

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
                        currentHP: unit.stats.currentHP, // getting the stat from the battle
                        maxHP: this.gameScene.player.stats.maxHP + this.getStatIncrease('vitality', newLevel) * 2,
                        currentMP: unit.stats.currentMP, // getting the stat from the battle
                        maxMP: this.gameScene.player.stats.maxMP + this.getStatIncrease('intellect', newLevel) * 2,
                        attack: this.gameScene.player.stats.attack + this.getStatIncrease('strength', newLevel),
                        defense: this.gameScene.player.stats.defense + this.getStatIncrease('agility', newLevel) / 2
                    };

                }
                this.uiScene.updateHP(this.gameScene.player.stats.currentHP, this.gameScene.player.stats.maxHP);

                eventsCenter.emit('updateXP', this.gameScene.player.experience);
            }

            else {
                // unit must be a bot character at this point
                this.gameScene.bots[0].stats.currentHP = unit.stats.currentHP;

                const currentLevel = Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.bots[0].experience)));

                let experienceAmount = 0;

                for (const enemy of this.enemies) {
                    const enemyData = enemies.find(obj => {
                        return obj.name === enemy.texture.key;
                    });
                    experienceAmount += enemyData?.experience ?? 0;
                }

                if (this.interactionState === 'handlingrunselect') {
                    experienceAmount = 0;
                }

                this.gameScene.bots[0].experience += experienceAmount;

                const newLevel = Math.max(1, Math.ceil(0.3 * Math.sqrt(this.gameScene.bots[0].experience)));

                if (currentLevel < newLevel) {

                    this.gameScene.bots[0].stats = {
                        strength: this.gameScene.bots[0].stats.strength + this.getStatIncrease('strength', newLevel),
                        agility: this.gameScene.bots[0].stats.agility + this.getStatIncrease('agility', newLevel),
                        vitality: this.gameScene.bots[0].stats.vitality + this.getStatIncrease('vitality', newLevel),
                        intellect: this.gameScene.bots[0].stats.intellect + this.getStatIncrease('intellect', newLevel),
                        luck: this.gameScene.bots[0].stats.luck + this.getStatIncrease('luck', newLevel),
                        currentHP: unit.stats.currentHP,
                        maxHP: this.gameScene.bots[0].stats.maxHP + this.getStatIncrease('vitality', newLevel) * 2,
                        currentMP: unit.stats.currentMP,
                        maxMP: this.gameScene.bots[0].stats.maxMP + this.getStatIncrease('intellect', newLevel) * 2,
                        attack: this.gameScene.bots[0].stats.attack + this.getStatIncrease('strength', newLevel),
                        defense: this.gameScene.bots[0].stats.defense + this.getStatIncrease('agility', newLevel) / 2
                    };

                }
                // TODO: make an update player2 hp method
                this.uiScene.updatePlayer2HP(unit.stats.currentHP, unit.stats.maxHP);

                // eventsCenter.emit('updateXP', this.gameScene.player.experience);
            }
        }
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

    private shortenTextByPixel(phasertext: Phaser.GameObjects.Text, maxpixel: number): Phaser.GameObjects.Text {
        while (phasertext.width > maxpixel) {
            phasertext.text = phasertext.text.substring(0, phasertext.text.length - 1);
        }
        return phasertext;
    }


    private startBattle(): void {
        // TODO: add all the bots to the scene if there are any!
        this.musicScene.scene.bringToTop();

        this.uiScene.selectCancel();
        this.gameScene.gamePadScene?.scene.stop();
        this.uiScene.scene.sendToBack();

        this.turnIndex = -1;
        // sets the battle music - muted for now

        this.musicScene.changeSong('battle');

        // set background to grey
        this.cameras.main.setBackgroundColor('rgb(235, 235, 235)');

        this.background = this.add.image(0, 0, 'overworldbackground')
            .setOrigin(0, 0);
        // based on your game size, it may "stretch" and distort.
        this.background.displayWidth = this.sys.canvas.width;
        this.background.displayHeight = this.sys.canvas.height - 291;
        this.battleUIScene = <BattleUIScene>this.scene.get('BattleUI');

        this.gameScene.input.keyboard!.enabled = false;

        this.interactionState = 'init';

        this.add.image(2, 430, 'actionMenuFrame')
            .setOrigin(0, 0);

        this.add.image(236, 606, 'heroMenuFrame')
            .setOrigin(0, 0);

        // if there is a player 2 (i.e. bots) generate everything for them
        if (this.gameScene.bots.length > 0) {
            if (this.gameScene.bots[0]) {
                this.add.image(470, 606, 'heroMenuFrame')
                    .setOrigin(0, 0);
            }
            this.player2 = new BotCharacter(
                this,
                504,
                675,
                this.gameScene.bots[0].sprite.texture,
                0,
                this.gameScene.bots[0].name
            );
            this.add.existing(this.player2);

            this.shortenTextByPixel(
                this.add.text(
                    484,
                    610,
                    this.gameScene.bots[0].name,
                    {
                        fontSize: '44px',
                        color: '#fff',
                        fontFamily: 'CustomFont',
                        metrics: {
                            ascent: 37,
                            descent: 10,
                            fontSize: 47
                        }

                    })
                    .setResolution(3),
                210
            );

            this.player2HPText = this.add.text(
                534,
                645,
                `HP: ${this.gameScene.bots[0].stats.currentHP}/${this.gameScene.player.stats.maxHP}`, {
                    fontSize: '35px',
                    color: '#fff',
                    fontFamily: 'CustomFont'
                })
                .setResolution(3);

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
            this.player1MPText = this.add.text(534, 670, `MP: ${currentMP}/${maxMP}`, {
                fontSize: '35px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
                .setResolution(3);

        }

        // instantiate the warrior player (player 1)
        const soldier = new PlayerCharacter(
            this,
            270,
            675,
            'hero',
            0,
            'Soldier' // TODO: let the player pick their name
        );

        this.add.existing(soldier);

        this.shortenTextByPixel(

            this.add.text(
                250,
                610,
                'Soldier',
                {
                    fontSize: '45px',
                    color: '#fff',
                    fontFamily: 'CustomFont'
                })
                .setResolution(3),
            210
        );

        this.player1HPText = this.add.text(
            300,
            645,
            `HP: ${this.gameScene.player.stats.currentHP}/${this.gameScene.player.stats.maxHP}`, {
                fontSize: '35px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
            .setResolution(3);

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
            .setResolution(3);

        const selectedEnemy: string = Phaser.Math.RND.pick(levels[this.gameScene.currentMap as keyof typeof levels].enemies ?? []);

        const enemy = new Enemy(
            this,
            Number(this.game.config.width) / 2,
            280,
            selectedEnemy,
            undefined,
            selectedEnemy
        );

        this.add.existing(enemy);

        this.heroes = [soldier];

        if (this.player2) {
            this.heroes.push(this.player2);
        }

        this.enemies = [enemy];

        this.units = this.heroes.concat(this.enemies);

        this.index = -1;

        this.scene.run('BattleUI');

        eventsCenter.removeListener('actionSelect');
        eventsCenter.on('actionSelect', this.handleActionSelection, this);
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
                    callback: () => {
                        eventsCenter.emit(
                            'Message',
                            `${this.heroes[0].type} has reached level ${levelUpData.newLevel}!`);
                        // at the same time that this happens, update the battle scene max hp

                        this.player1HPText.setText(`HP: ${this.heroes[0].stats.currentHP}/${this.heroes[0].stats.maxHP + this.getStatIncrease('vitality', levelUpData.newLevel) * 2}`);
                    }
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
}