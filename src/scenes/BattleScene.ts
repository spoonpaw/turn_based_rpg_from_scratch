import {abilities, IAbility} from '../abilities/abilities';
import BotCharacter from '../classes/BotCharacter';
import {Enemy} from '../classes/Enemy';
import PlayerCharacter from '../classes/PlayerCharacter';
import {enemies} from '../enemies/enemies';
import MonsterSoldier from '../jobs/monsters/MonsterSoldier';
import soldier from '../jobs/players/PlayerSoldier';
import {levels} from '../levels/Levels';
import { IStatIncreases } from '../types/Advancement';
import eventsCenter from '../utils/EventsCenter';
import BattleUIScene from './BattleUIScene';
import GameScene from './GameScene';
import MusicScene from './MusicScene';
import SaveAndLoadScene from './SaveAndLoadScene';
import SFXScene from './SFXScene';
import UIScene from './UIScene';

export default class BattleScene extends Phaser.Scene {
    public enemies!: Enemy[];
    gameScene!: GameScene;
    public heroes!: (PlayerCharacter | BotCharacter | Enemy)[];
    public interactionState!: string;
    public passiveEffects: {
        actor: PlayerCharacter|BotCharacter|Enemy,
        target: PlayerCharacter|BotCharacter|Enemy,
        ability: IAbility,
        turnDurationRemaining: number
    }[] = [];
    public player1HPText!: Phaser.GameObjects.Text;
    public player2HPText!: Phaser.GameObjects.Text;
    public sfxScene!: SFXScene;
    private _idCounter = 0;
    private background!: Phaser.GameObjects.Image;
    private battleUIScene!: BattleUIScene;
    private index!: number;
    private musicScene!: MusicScene;
    private player1MPText!: Phaser.GameObjects.Text;
    private player2?: PlayerCharacter | BotCharacter;
    private turnIndex!: number;
    private turnUnits!: (PlayerCharacter | BotCharacter | Enemy)[];
    private uiScene!: UIScene;
    private units!: (PlayerCharacter | BotCharacter | Enemy)[];
    private actionMenuFrame!: Phaser.GameObjects.Image;
    private player1MenuFrame!: Phaser.GameObjects.Image;
    private player2MenuFrame!: Phaser.GameObjects.Image;
    private saveAndLoadScene!: SaveAndLoadScene;

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
        this.saveAndLoadScene = <SaveAndLoadScene>this.scene.get('SaveAndLoad');

        this.startBattle();

        this.sys.events.on('wake', this.startBattle, this);
    }

    public generateID(): number {
        return this._idCounter++;

    }

    private checkForPlayer1LevelUp(): { levelUp: boolean, newLevel: number } {
        let experienceAmount = 0;

        for (const enemy of this.enemies) {
            const enemyData = enemies.find(obj => {
                return obj.key === enemy.texture.key;
            });
            experienceAmount += enemyData?.experience ?? 0;
        }

        const currentLevel = this.gameScene.player.level;
        const newLevel = Math.max(1, Math.ceil(this.gameScene.player.LEVELING_RATE * Math.sqrt(this.gameScene.player.experience + experienceAmount)));

        return {levelUp: newLevel > currentLevel, newLevel};
    }

    private checkForPlayer2LevelUp(player1LevelData: {
        levelUp: boolean,
        newLevel: number
    }): {
        levelUp: boolean,
        newLevel: number
    } {
        // Initialize the `experienceAmount` variable to 0
        let experienceAmount = 0;

        // Loop through the `enemies` array
        for (const enemy of this.enemies) {
            // Find the enemy data for the current enemy
            const enemyData = enemies.find(obj => {
                // Return the enemy data if the `key` property matches the enemy's texture key
                return obj.key === enemy.texture.key;
            });

            // Add the enemy's experience to the `experienceAmount` variable
            experienceAmount += enemyData?.experience ?? 0;
        }

        // Get the bot player from the game scene
        const bot = this.gameScene.bots[0];

        // Get the bot's current level
        const currentLevel = bot.level;

        // Calculate the new level of the bot based on its current experience and the `experienceAmount` gained from battle
        let newLevel = Math.max(
            1,
            Math.ceil(
                bot.LEVELING_RATE * Math.sqrt(
                    this.gameScene.bots[0].experience + experienceAmount
                )
            )
        );

        // Check if the new level exceeds the player's current level
        if (newLevel > player1LevelData.newLevel) {
            // If the new level exceeds the player's current level, set the new level to the player's current level
            newLevel = player1LevelData.newLevel;
        }

        // Return an object containing a boolean `levelUp` that indicates whether
        // the player leveled up, and a number `newLevel` representing the new level of the player.
        return { levelUp: newLevel > currentLevel, newLevel };
    }

    private checkForVictory(): boolean {
        let victory = true;
        // if all enemies are dead we have victory
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].isLiving()) {
                victory = false;
            }
        }

        return victory;
    }

    private endBattle(): void {
        this.battleUIScene.disableAllActionButtons();
        // send the player info to the game scene ui

        this.sendPlayerInfoToGameScene();

        this.clearStateAndRemoveSprites();

        // sleep the ui
        this.scene.sleep('BattleUI');

        this.gameScene.input.keyboard!.enabled = true;

        // return to game scene and sleep current battle scene
        this.scene.switch('Game');
    }

    private clearStateAndRemoveSprites() {
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
    }

    private endBattleGameOver(): void {
        // change to game over music
        this.musicScene.changeSong('gameover');

        // cut gold in half, set hit points to full, cut to game over screen, respawn
        eventsCenter.emit('Message', 'Thou art vanquished!');
        const newGoldAmount = Math.floor(this.gameScene.player.gold / 2);
        this.saveAndLoadScene.db.players.update(
            0,
            {
                gold: newGoldAmount
            }
        );
        this.gameScene.player.gold = newGoldAmount;
        eventsCenter.emit('updateResource', this.gameScene.player.stats.currentResource, this.gameScene.player.stats.maxResource);
        this.gameScene.player.stats.currentHP = this.gameScene.player.stats.maxHP;
        if (this.gameScene.bots.length > 0) {
            this.gameScene.bots[0].stats.currentHP = this.gameScene.bots[0].stats.maxHP;
            this.uiScene.player2hpText.setText(`HP: ${this.gameScene.bots[0].stats.currentHP}/${this.gameScene.bots[0].stats.maxHP}`);
        }
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

            this.clearStateAndRemoveSprites();

            // sleep the ui
            this.scene.sleep('BattleUI');

            this.battleUIScene.disableAllActionButtons();
            this.battleUIScene.cameras.main.fadeIn(0);

            this.cameras.main.fadeIn(0);

            // return to game scene and sleep current battle scene
            this.scene.switch('GameOver');
        });
    }

    private gameOverTest() {
        // check if all the heroes are dead (players and bots)
        return this.heroes.every((value) => {
            return !value.isLiving();
        });
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
            target: Enemy | PlayerCharacter | BotCharacter,
            actionType: string
        }
    ): void {
        let passiveAbilitySelected = false;
        let selectedAbility;
        if (data.actionType === 'ability') {
            // get the ability
            selectedAbility = abilities.find((obj) => {
                return obj.name === data.action;
            });
            if (selectedAbility!.type === 'passive') {
                passiveAbilitySelected = true;
            }
        }

        this.interactionState = `handling${data.action}select`;

        this.turnUnits = BattleScene.sortUnits(this.units);

        if (passiveAbilitySelected) {
            const unitUsingPassiveAbility = this.turnUnits.find((unit) => {
                return unit instanceof PlayerCharacter;
            }) as PlayerCharacter | BotCharacter | Enemy;
            this.turnUnits.splice(this.turnUnits.indexOf(unitUsingPassiveAbility), 1);
            this.turnUnits.unshift(unitUsingPassiveAbility);
        }

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
                eventsCenter.emit('Message', `${this.gameScene.player.name} fails to retreat!`);
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

    private parseNextUnitTurn(
        data: {
            action: string;
            target: Enemy | PlayerCharacter | BotCharacter
        }
    ): void {
        this.turnIndex += 1;

        let turnRunTime = 0;
        const currentUnit = this.turnUnits[this.turnIndex];
        if (currentUnit instanceof Enemy) {
            // the enemy is going to use an ability (default physical attack)
            if (currentUnit.isLiving()) {
                turnRunTime += currentUnit.runTurn();
            }
        }
        // current unit must be a player character or bot if not an enemy
        else {
            if (currentUnit.isLiving()) {
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
                const player = this.gameScene.player;
                player.stats.currentHP = unit.stats.currentHP;

                if (player.stats.currentHP <= 0) {
                    player.stats.currentHP = 1;
                }

                let goldAmount = 0;
                let experienceAmount = 0;

                for (const enemy of this.enemies) {
                    const enemyData = enemies.find(obj => {
                        return obj.key === enemy.texture.key;
                    });
                    goldAmount += enemyData?.gold ?? 0;
                    experienceAmount += enemyData?.experience ?? 0;
                }

                if (this.interactionState === 'handlingrunselect') {
                    goldAmount = 0;
                    experienceAmount = 0;
                }

                const newGoldAmount = player.gold + goldAmount;

                this.saveAndLoadScene.db.players.update(
                    0, {
                        gold: newGoldAmount
                    }
                );

                player.gold = newGoldAmount;

                eventsCenter.emit('updateResource', player.stats.currentResource, player.stats.maxResource);

                const currentLevel = player.level;

                const newExperienceAmount = player.experience + experienceAmount;

                this.saveAndLoadScene.db.players.update(
                    0,
                    {
                        experience: newExperienceAmount
                    }
                );

                player.experience = newExperienceAmount;

                const newLevel = Math.max(
                    1,
                    Math.ceil(
                        player.LEVELING_RATE * Math.sqrt(
                            player.experience
                        )
                    )
                );

                if (currentLevel < newLevel) {
                    // soldiers have a flat vim amount
                    let maxResourceIncrease;
                    if (unit.job.properName === 'Soldier') {
                        maxResourceIncrease = 0;
                    }
                    else {
                        maxResourceIncrease = this.getStatIncrease('intellect', newLevel) * 2;
                    }

                    player.stats = {
                        strength: player.stats.strength + this.getStatIncrease('strength', newLevel),
                        agility: player.stats.agility + this.getStatIncrease('agility', newLevel),
                        vitality: player.stats.vitality + this.getStatIncrease('vitality', newLevel),
                        intellect: player.stats.intellect + this.getStatIncrease('intellect', newLevel),
                        luck: player.stats.luck + this.getStatIncrease('luck', newLevel),
                        currentHP: unit.stats.currentHP, // getting the stat from the battle
                        maxHP: player.stats.maxHP + this.getStatIncrease('vitality', newLevel) * 2,
                        currentResource: unit.stats.currentResource, // getting the stat from the battle
                        maxResource: player.stats.maxResource + maxResourceIncrease,
                        attack: player.stats.attack + this.getStatIncrease('strength', newLevel),
                        defense: player.stats.defense + this.getStatIncrease('agility', newLevel) / 2
                    };
                }
                this.uiScene.updateHP(player.stats.currentHP, player.stats.maxHP);

                eventsCenter.emit('updateXP', player.experience);
            }

            else {
                const bot = this.gameScene.bots[0];
                // unit must be a bot character at this point
                bot.stats.currentHP = unit.stats.currentHP;
                if (bot.stats.currentHP <= 0) {
                    bot.stats.currentHP = 1;
                }

                const currentLevel = bot.level;

                let experienceAmount = 0;

                for (const enemy of this.enemies) {
                    const enemyData = enemies.find(obj => {
                        return obj.key === enemy.texture.key;
                    });
                    experienceAmount += enemyData?.experience ?? 0;
                }

                // Calculate the new level of the bot based on its current experience and the `experienceAmount` gained from battle
                let newLevel = Math.max(
                    1,
                    Math.ceil(
                        bot.LEVELING_RATE * Math.sqrt(
                            bot.experience + experienceAmount
                        )
                    )
                );

                while (newLevel > this.gameScene.player.level) {
                    // find the maximum whole number amount of gold that can be
                    //  received by the bot without exceeding amount required to get to
                    //  a level exceeding that of the player
                    experienceAmount -= 1;
                    newLevel = Math.max(
                        1,
                        Math.ceil(
                            bot.LEVELING_RATE * Math.sqrt(
                                bot.experience + experienceAmount
                            )
                        )
                    );
                    if (experienceAmount === 0) break;
                }

                if (this.interactionState === 'handlingrunselect') {
                    experienceAmount = 0;
                }

                bot.experience += experienceAmount;

                newLevel = Math.max(
                    1,
                    Math.ceil(
                        bot.LEVELING_RATE * Math.sqrt(
                            bot.experience
                        )
                    )
                );

                if (currentLevel < newLevel) {

                    // soldiers have a flat vim amount
                    let maxResourceIncrease;
                    if (unit.job.properName === 'Soldier') {
                        maxResourceIncrease = 0;
                    }
                    else {
                        maxResourceIncrease = this.getStatIncrease('intellect', newLevel) * 2;
                    }

                    bot.stats = {
                        strength: bot.stats.strength + this.getStatIncrease('strength', newLevel),
                        agility: bot.stats.agility + this.getStatIncrease('agility', newLevel),
                        vitality: bot.stats.vitality + this.getStatIncrease('vitality', newLevel),
                        intellect: bot.stats.intellect + this.getStatIncrease('intellect', newLevel),
                        luck: bot.stats.luck + this.getStatIncrease('luck', newLevel),
                        currentHP: unit.stats.currentHP,
                        maxHP: bot.stats.maxHP + this.getStatIncrease('vitality', newLevel) * 2,
                        currentResource: unit.stats.currentResource,
                        maxResource: bot.stats.maxResource + maxResourceIncrease,
                        attack: bot.stats.attack + this.getStatIncrease('strength', newLevel),
                        defense: bot.stats.defense + this.getStatIncrease('agility', newLevel) / 2
                    };

                }
                this.uiScene.updatePlayer2HP(bot.stats.currentHP, bot.stats.maxHP);
            }
        }
    }

    private shortenTextByPixel(phasertext: Phaser.GameObjects.Text, maxpixel: number): Phaser.GameObjects.Text {
        while (phasertext.width > maxpixel) {
            phasertext.text = phasertext.text.substring(0, phasertext.text.length - 1);
        }
        return phasertext;
    }

    private showGoldAndExperience(currentEnemies: Enemy[]): void {
        // the gold pieces/experience points should vary depending on the enemy
        let goldAmount = 0;
        let experienceAmount = 0;

        for (const enemy of currentEnemies) {
            const enemyData = enemies.find(obj => {
                return obj.key === enemy.texture.key;
            });
            goldAmount += enemyData?.gold ?? 0;
            experienceAmount += enemyData?.experience ?? 0;
        }

        eventsCenter.emit('Message', `You receive ${goldAmount} gold pieces.\nYou receive ${experienceAmount} experience points.`);
    }

    private shrinkTextByPixel(phasertext: Phaser.GameObjects.Text, maxpixel: number): Phaser.GameObjects.Text {
        let fontSize = phasertext.height;
        while (phasertext.width > maxpixel) {
            fontSize--;
            phasertext.setStyle({ fontSize: fontSize + 'px' });
        }
        return phasertext;
    }

    private startBattle(): void {
        // let count = 0;
        // this.children.each(gameObject => {
        //     if (gameObject.active) {
        //         count++;
        //     }
        // });

        this._idCounter = 0;
        this.passiveEffects = [];
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

        this.actionMenuFrame = this.add.image(2, 430, 'actionMenuFrame')
            .setOrigin(0, 0);

        this.player1MenuFrame = this.add.image(236, 606, 'heroMenuFrame')
            .setOrigin(0, 0);

        // if there is a player 2 (i.e. bots) generate everything for them
        if (this.gameScene.bots.length > 0) {
            if (this.gameScene.bots[0]) {
                this.player2MenuFrame = this.add.image(470, 606, 'heroMenuFrame')
                    .setOrigin(0, 0);
            }
            this.player2 = new BotCharacter(
                this,
                504,
                675,
                this.gameScene.bots[0].sprite.texture,
                0,
                this.gameScene.bots[0].name,
                this.gameScene.bots[0].type
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
                `HP: ${this.gameScene.bots[0].stats.currentHP}/${this.gameScene.bots[0].stats.maxHP}`, {
                    fontSize: '35px',
                    color: '#fff',
                    fontFamily: 'CustomFont'
                })
                .setResolution(3);

            const currentResource = this.gameScene.player.stats.currentResource;
            const maxResource = this.gameScene.player.stats.maxResource;
            this.player1MPText = this.add.text(534, 670, `Vim: ${currentResource}/${maxResource}`, {
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
            this.gameScene.player.name,
            this.gameScene.player.type
        );

        this.add.existing(soldier);

        this.shortenTextByPixel(
            this.add.text(
                250,
                610,
                this.gameScene.player.name,
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

        const currentResource = this.gameScene.player.stats.currentResource;
        const maxResource = this.gameScene.player.stats.maxResource;
        this.player1MPText = this.add.text(300, 670, `Vim: ${currentResource}/${maxResource}`, {
            fontSize: '35px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setResolution(3);

        // const selectedEnemy: string = Phaser.Math.RND.pick(levels[this.gameScene.currentMap as keyof typeof levels].enemies ?? []);
        const selectedEnemyKey: string = Phaser.Math.RND.pick(levels[this.gameScene.currentMap as keyof typeof levels].enemies ?? []);

        const enemy = new Enemy(
            this,
            Number(this.game.config.width) / 2,
            280,
            selectedEnemyKey,
            undefined,
            enemies.find((obj) => {
                return obj.key === selectedEnemyKey;
            })!.name,
            MonsterSoldier,
            enemies.find((obj) => {
                return obj.key === selectedEnemyKey;
            })!.skills!
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

        for (const [index, passiveEffect] of this.passiveEffects.entries()) {
            passiveEffect.turnDurationRemaining--;
            if (passiveEffect.turnDurationRemaining === 0) {
                this.passiveEffects.splice(index, 1);
            }
        }

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
            const levelUpData = this.checkForPlayer1LevelUp();
            if (levelUpData.levelUp) {
                levelUpDelay += 2000;
            }

            let player2LevelUpData = {levelUp: false, newLevel: 0};
            if (this.gameScene.bots.length > 0) {
                player2LevelUpData = this.checkForPlayer2LevelUp(levelUpData);
                if (player2LevelUpData.levelUp) {
                    levelUpDelay += 2000;
                }
            }

            // deliver the victory message and exit the battle
            eventsCenter.emit('Message', 'Thine enemies are slain.');
            this.time.addEvent({
                delay: 2000,
                callback: this.showGoldAndExperience,
                callbackScope: this,
                args: [this.enemies]
            });

            let cumulativeLevelUpMessageDelay = 0;
            if (levelUpData.levelUp) {
                cumulativeLevelUpMessageDelay += 2000;
                this.time.addEvent({
                    delay: 4000,
                    callback: () => {
                        eventsCenter.emit(
                            'Message',
                            `${this.heroes[0].name} reaches level ${levelUpData.newLevel}!`
                        );
                        // at the same time that this happens, update the battle scene max hp

                        this.player1HPText.setText(
                            `HP: ${this.heroes[0].stats.currentHP}/${this.heroes[0].stats.maxHP + this.getStatIncrease(
                                'vitality',
                                levelUpData.newLevel
                            ) * 2}`
                        );
                    }
                });
            }

            if (this.gameScene.bots.length > 0 && player2LevelUpData?.levelUp) {
                this.time.addEvent({
                    delay: 4000 + cumulativeLevelUpMessageDelay,
                    callback: () => {
                        eventsCenter.emit(
                            'Message',
                            `${this.gameScene.bots[0].name} reaches level ${player2LevelUpData.newLevel}!`
                        );

                        this.player2HPText.setText(
                            `HP: ${this.gameScene.bots[0].stats.currentHP}/${this.gameScene.bots[0].stats.maxHP + this.getStatIncrease(
                                'vitality',
                                player2LevelUpData.newLevel
                            ) * 2}`
                        );
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

        if (!this.heroes[0].isLiving()) {
            eventsCenter.emit('actionSelect', {
                action: 'pass',
                target: this.heroes[0]
            });
        }
    }
}