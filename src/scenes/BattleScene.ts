// TODO: fix this glitch: if i close the game on the game over screen
//  i load the game with zero HP!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


import {abilities, IAbility} from '../abilities/abilities';
import BotCharacter from '../classes/BotCharacter';
import {Enemy} from '../classes/Enemy';
import {DBUnit, IPlayer} from '../classes/GameDatabase';
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
    public gameScene!: GameScene;
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
    public units!: (PlayerCharacter | BotCharacter | Enemy)[];
    private _idCounter = 0;
    private background!: Phaser.GameObjects.Image;
    private battleUIScene!: BattleUIScene;
    private index!: number;
    private musicScene!: MusicScene;
    private player1MPText!: Phaser.GameObjects.Text;
    private player2?: PlayerCharacter | BotCharacter;
    private turnIndex!: number;
    public roundUnits!: (PlayerCharacter | BotCharacter | Enemy)[];
    private uiScene!: UIScene;
    private actionMenuFrame!: Phaser.GameObjects.Image;
    private player1MenuFrame!: Phaser.GameObjects.Image;
    private player2MenuFrame!: Phaser.GameObjects.Image;
    private saveAndLoadScene!: SaveAndLoadScene;
    private player2MPText!: Phaser.GameObjects.Text;

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

    create(data?: {
        loadBattleData: boolean,
        savedCombatState: {
            enemies: DBUnit[],
            heroes: DBUnit[],
            passiveEffects: {
                actor: DBUnit,
                target: DBUnit,
                ability: IAbility,
                turnDurationRemaining: number
            }[],
            units: DBUnit[],
            roundUnits: DBUnit[],
            turnIndex: number,
            roundIndex: number,
            action: string,
            target: DBUnit | undefined,
            actionType: string
            escaped: boolean | undefined
        }

    }): void {
        this.gameScene = <GameScene>this.scene.get('Game');
        this.uiScene = <UIScene>this.scene.get('UI');
        this.musicScene = <MusicScene>this.scene.get('Music');
        this.sfxScene = <SFXScene>this.scene.get('SFX');
        this.saveAndLoadScene = <SaveAndLoadScene>this.scene.get('SaveAndLoad');

        if (data?.loadBattleData) this.loadBattle(data.savedCombatState);
        else if (!data?.loadBattleData) this.startBattle();

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

        this.saveAndLoadScene.db.players.update(
            0,
            {inCombat: false}
        );

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
        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                player.combatState = {
                    enemies: [],
                    heroes: [],
                    passiveEffects: [],
                    units: [],
                    roundUnits: [],
                    turnIndex: 0,
                    roundIndex: 0,
                    action: '',
                    target: undefined,
                    actionType: '',
                    escaped: undefined
                };
            }
        );
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

        this.saveAndLoadScene.db.players.update(
            0,
            {inCombat: false}
        );

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

        const newHP = this.gameScene.player.stats.maxHP;
        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                player.stats.currentHP = newHP;
                return player;
            }
        );
        this.gameScene.player.stats.currentHP = newHP;
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

        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                console.log('getting the target from the action select to store in the db');
                console.log({playerCombatStateUnits: player.combatState.units, dataTarget: data.target});
                const saveTarget = player.combatState.units.find(unit => unit.id === data.target.id);


                player.combatState.action = data.action;
                player.combatState.target = saveTarget;
                player.combatState.actionType = data.actionType;
                return player;
            }
        );

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

        const sortedUnits = BattleScene.sortUnits(this.units);

        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                player.combatState.roundUnits = [];
                sortedUnits.forEach((unit) => {
                    const match = player.combatState.units.find((playerUnit) => {
                        return playerUnit.id === unit.id;
                    });
                    if (match) player.combatState.roundUnits.push(match);
                });

                return player;

            }
        );

        this.roundUnits = sortedUnits;

        if (passiveAbilitySelected) {
            const unitUsingPassiveAbility = this.roundUnits.find((unit) => {
                return unit instanceof PlayerCharacter;
            }) as PlayerCharacter | BotCharacter | Enemy;

            this.saveAndLoadScene.db.players.update(
                0,
                (player: IPlayer) => {

                    const roundUnitWithSameId = player.combatState.roundUnits.find(roundUnit => roundUnit.id === unitUsingPassiveAbility.id);
                    if (roundUnitWithSameId) {
                        player.combatState.roundUnits.splice(player.combatState.roundUnits.indexOf(roundUnitWithSameId), 1);
                        player.combatState.roundUnits.unshift(roundUnitWithSameId);
                    }
                    return player;
                }
            );

            this.roundUnits.splice(this.roundUnits.indexOf(unitUsingPassiveAbility), 1);
            this.roundUnits.unshift(unitUsingPassiveAbility);
        }

        this.battleUIScene.hideUIFrames();
        this.battleUIScene.closeInventory();

        if (data.action === 'run') {
            if (BattleScene.escapeTest()) {
                this.saveAndLoadScene.db.players.update(
                    0,
                    (player: IPlayer) => {
                        player.combatState.escaped = true;
                        return player;
                    }
                );

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
                this.saveAndLoadScene.db.players.update(
                    0,
                    (player: IPlayer) => {
                        player.combatState.escaped = false;
                        return player;
                    }
                );
                // announce that the run failed! then let the enemies act!!
                const roundUnitsWithoutHeroes = this.units.filter(value => {
                    return !(value instanceof PlayerCharacter || value instanceof BotCharacter);
                });
                this.saveAndLoadScene.db.players.update(
                    0,
                    (player: IPlayer) => {
                        player.combatState.roundUnits = player.combatState.units.filter( unit => {
                            return roundUnitsWithoutHeroes.some(value => value.id === unit.id);
                        });
                        return player;
                    }
                );
                this.roundUnits = roundUnitsWithoutHeroes;
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

    public parseNextUnitTurn(
        data: {
            action: string;
            target: Enemy | PlayerCharacter | BotCharacter
        }
    ): void {
        this.turnIndex += 1;

        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                player.combatState.turnIndex = this.turnIndex;
                return player;
            }
        );

        let turnRunTime = 0;
        console.log('assigning the value to current unit on the battle scene!');
        console.log({roundUnits: this.roundUnits, turnIndex: this.turnIndex});
        const currentUnit = this.roundUnits[this.turnIndex];
        console.log({currentUnit});
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

        // TODO: store a snapshot of the combat after each turn is run
        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                for (const passiveEffect of this.passiveEffects) {
                    const targetUnit = player.combatState.units.find(unit => unit.id === passiveEffect.target.id);
                    if (targetUnit) {

                        player.combatState.passiveEffects.push({
                            ability: passiveEffect.ability,
                            target: targetUnit,
                            turnDurationRemaining: passiveEffect.turnDurationRemaining,
                            actor: {
                                name: passiveEffect.actor.name,
                                job: passiveEffect.actor.job,
                                id: passiveEffect.actor.id,
                                key: passiveEffect.actor.key,
                                stats: passiveEffect.actor.stats,
                                equipment: {
                                    body: passiveEffect.actor.equipment.body,
                                    head: passiveEffect.actor.equipment.head,
                                    offhand: passiveEffect.actor.equipment.offhand,
                                    weapon: passiveEffect.actor.equipment.weapon
                                },
                                inventory: passiveEffect.actor.inventory,
                                actorType: passiveEffect.actor.job.name,
                            }
                        });
                    }
                }
                player.combatState.turnIndex++;
                return player;
            }
        );

        if (this.gameOverTest()) {
            this.time.addEvent({
                delay: turnRunTime,
                callback: this.endBattleGameOver,
                callbackScope: this
            });
        }

        // if this is the last turn, then start a new turn after the correct delay!
        else if (this.turnIndex === this.roundUnits.length - 1) {
            this.time.addEvent({
                delay: turnRunTime,
                callback: this.startNewRound,
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
                const gameScenePlayer = this.gameScene.player;
                this.saveAndLoadScene.db.players.update(
                    0,
                    (player: IPlayer) => {
                        player.stats.currentHP = unit.stats.currentHP;
                        return player;
                    }
                );
                gameScenePlayer.stats.currentHP = unit.stats.currentHP;

                if (gameScenePlayer.stats.currentHP <= 0) {
                    this.saveAndLoadScene.db.players.update(
                        0,
                        (player: IPlayer) => {
                            player.stats.currentHP = 1;
                            return player;
                        }
                    );
                    gameScenePlayer.stats.currentHP = 1;
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

                const newGoldAmount = gameScenePlayer.gold + goldAmount;

                this.saveAndLoadScene.db.players.update(
                    0, {
                        gold: newGoldAmount
                    }
                );

                gameScenePlayer.gold = newGoldAmount;

                eventsCenter.emit('updateResource', gameScenePlayer.stats.currentResource, gameScenePlayer.stats.maxResource);

                const currentLevel = gameScenePlayer.level;

                const newExperienceAmount = gameScenePlayer.experience + experienceAmount;

                this.saveAndLoadScene.db.players.update(
                    0,
                    {
                        experience: newExperienceAmount
                    }
                );

                gameScenePlayer.experience = newExperienceAmount;

                const newLevel = Math.max(
                    1,
                    Math.ceil(
                        gameScenePlayer.LEVELING_RATE * Math.sqrt(
                            gameScenePlayer.experience
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

                    const newStats = {
                        strength: gameScenePlayer.stats.strength + this.getStatIncrease('strength', newLevel),
                        agility: gameScenePlayer.stats.agility + this.getStatIncrease('agility', newLevel),
                        vitality: gameScenePlayer.stats.vitality + this.getStatIncrease('vitality', newLevel),
                        intellect: gameScenePlayer.stats.intellect + this.getStatIncrease('intellect', newLevel),
                        luck: gameScenePlayer.stats.luck + this.getStatIncrease('luck', newLevel),
                        currentHP: unit.stats.currentHP, // getting the stat from the battle
                        maxHP: gameScenePlayer.stats.maxHP + this.getStatIncrease('vitality', newLevel) * 2,
                        currentResource: unit.stats.currentResource, // getting the stat from the battle
                        maxResource: gameScenePlayer.stats.maxResource + maxResourceIncrease,
                        attack: gameScenePlayer.stats.attack + this.getStatIncrease('strength', newLevel),
                        defense: gameScenePlayer.stats.defense + this.getStatIncrease('agility', newLevel) / 2
                    };

                    this.saveAndLoadScene.db.players.update(
                        0,
                        {
                            stats: newStats
                        }
                    );

                    gameScenePlayer.stats = newStats;
                }
                this.uiScene.updateHP(gameScenePlayer.stats.currentHP, gameScenePlayer.stats.maxHP);

                eventsCenter.emit('updateXP', gameScenePlayer.experience);
            }

            else {
                const bot = this.gameScene.bots[0];
                // unit must be a bot character at this point
                this.saveAndLoadScene.db.players.update(
                    0,
                    (player: IPlayer) => {
                        player.bots[0].stats.currentHP = unit.stats.currentHP;
                        return player;
                    }
                );
                bot.stats.currentHP = unit.stats.currentHP;
                if (bot.stats.currentHP <= 0) {
                    this.saveAndLoadScene.db.players.update(
                        0,
                        (player: IPlayer) => {
                            player.stats.currentHP = 1;
                            return player;
                        }
                    );
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

                const newExperienceAmount = bot.experience + experienceAmount;

                this.saveAndLoadScene.db.players.update(
                    0,
                    (player: IPlayer) => {
                        player.bots[0].experience = newExperienceAmount;
                        return player;
                    }
                );

                bot.experience = newExperienceAmount;

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

                    const newStats = {
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

                    this.saveAndLoadScene.db.players.update(
                        0,
                        (player: IPlayer) => {
                            player.bots[0].stats = newStats;
                            return player;
                        }
                    );

                    bot.stats = newStats;

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

    private loadBattle(savedCombatState:  {
        enemies: DBUnit[],
            heroes: DBUnit[],
            passiveEffects: {
            actor: DBUnit,
                target: DBUnit,
                ability: IAbility,
                turnDurationRemaining: number
        }[],
            units: DBUnit[],
            roundUnits: DBUnit[],
            turnIndex: number,
            roundIndex: number,
            action: string,
            target: DBUnit | undefined,
            actionType: string
        escaped: boolean | undefined
    }   ): void {

        console.log('loading the battle from a saved state!!!!!');

        this.musicScene.scene.bringToTop();

        this.uiScene.selectCancel();
        this.gameScene.gamePadScene?.scene.stop();
        this.uiScene.scene.sendToBack();

        this.turnIndex = savedCombatState.turnIndex - 1;

        this.musicScene.changeSong('battle');

        this.cameras.main.setBackgroundColor('rgb(235, 235, 235)');

        this.background = this.add.image(0, 0, 'overworldbackground')
            .setOrigin(0, 0);
        this.background.displayWidth = this.sys.canvas.width;
        this.background.displayHeight = this.sys.canvas.height - 291;
        this.battleUIScene = <BattleUIScene>this.scene.get('BattleUI');

        this.gameScene.input.keyboard!.enabled = false;

        this.interactionState = 'init';

        this.actionMenuFrame = this.add.image(2, 430, 'actionMenuFrame')
            .setOrigin(0, 0);

        this.player1MenuFrame = this.add.image(236, 606, 'heroMenuFrame')
            .setOrigin(0, 0);

        if (savedCombatState.heroes.length > 1) {
            this.player2MenuFrame = this.add.image(470, 606, 'heroMenuFrame')
                .setOrigin(0, 0);

            // TODO: GONNA NEED TO FIND THE BOT IN THE HERO LIST!

            const botHero = savedCombatState.heroes.find( unit => unit.actorType.startsWith('Monster'))!;

            this.player2 = new BotCharacter(
                this,
                504,
                675,
                this.gameScene.bots[0].sprite.texture,
                0,
                this.gameScene.bots[0].name,
                this.gameScene.bots[0].type,
                botHero.id
            );
            this.player2.stats = botHero.stats;
            if (this.player2.stats.currentHP <= 0) this.player2.setVisible(false);
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
                `HP: ${this.player2.stats.currentHP}/${this.player2.stats.maxHP}`, {
                    fontSize: '35px',
                    color: '#fff',
                    fontFamily: 'CustomFont'
                })
                .setResolution(3);

            const currentResource = botHero.stats.currentResource;
            const maxResource = botHero.stats.maxResource;

            this.player2MPText = this.add.text(534, 670, `Vim: ${currentResource}/${maxResource}`, {
                fontSize: '35px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
                .setResolution(3);

        }

        const playerHero = savedCombatState.heroes.find( unit => unit.actorType.startsWith('Player'))!;
        const soldier = new PlayerCharacter(
            this,
            270,
            675,
            'hero',
            0,
            this.gameScene.player.name,
            this.gameScene.player.type,
            playerHero.id
        );
        soldier.stats = playerHero.stats;
        if (soldier.stats.currentHP <= 0) soldier.setVisible(false);
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
            `HP: ${soldier.stats.currentHP}/${soldier.stats.maxHP}`, {
                fontSize: '35px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
            .setResolution(3);


        const currentResource = soldier.stats.currentResource;
        const maxResource = soldier.stats.maxResource;
        this.player1MPText = this.add.text(
            300,
            670,
            `Vim: ${currentResource}/${maxResource}`,
            {
                fontSize: '35px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
            .setResolution(3);


        const enemyUnit = savedCombatState.enemies[0];
        const enemy = new Enemy(
            this,
            Number(this.game.config.width) / 2,
            280,
            enemyUnit.key,
            undefined,
            enemyUnit.name,
            enemyUnit.job,
            enemies.find(obj => {
                return obj.key === enemyUnit.key;
            })!.skills,
            enemyUnit.id
        );
        this.add.existing(enemy);

        this.heroes = [soldier];

        if (this.player2) {
            this.heroes.push(this.player2);
        }

        this.enemies = [enemy];

        this.units = this.heroes.concat(this.enemies);

        this.scene.run('BattleUI', {loadFromSave: true, savedCombatState});

        eventsCenter.removeListener('actionSelect');
        eventsCenter.on('actionSelect', this.handleActionSelection, this);


        for (const passiveEffect of savedCombatState.passiveEffects) {
            this.passiveEffects.push({
                ability: passiveEffect.ability,
                actor: this.units.find(unit => unit.id === passiveEffect.actor.id)!,
                target: this.units.find(unit => unit.id === passiveEffect.target.id)!,
                turnDurationRemaining: passiveEffect.turnDurationRemaining
            });
        }
    }

    private startBattle(): void {
        // let count = 0;
        // this.children.each(gameObject => {
        //     if (gameObject.active) {
        //         count++;
        //     }
        // });

        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                player.inCombat = true;
                player.combatState.roundIndex = 0;
                player.combatState.turnIndex = 0;
                return player;
            }
        );

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

            const currentResource = this.gameScene.bots[0].stats.currentResource;
            const maxResource = this.gameScene.bots[0].stats.maxResource;
            this.player2MPText = this.add.text(534, 670, `Vim: ${currentResource}/${maxResource}`, {
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
        this.player1MPText = this.add.text(
            300,
            670,
            `Vim: ${currentResource}/${maxResource}`,
            {
                fontSize: '35px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
            .setResolution(3);

        // const selectedEnemy: string = Phaser.Math.RND.pick(levels[this.gameScene.currentMap as keyof typeof levels].enemies ?? []);
        const selectedEnemyKey: string = Phaser.Math.RND.pick(
            levels[this.gameScene.currentMap as keyof typeof levels].enemies ?? []
        );

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
            })!.skills
        );

        this.add.existing(enemy);


        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {

                player.combatState.heroes = [{
                    name: soldier.name,
                    job: soldier.job,
                    id: soldier.id,
                    key: soldier.key,
                    stats: soldier.stats,
                    equipment: {
                        body: soldier.equipment.body,
                        head: soldier.equipment.head,
                        offhand: soldier.equipment.offhand,
                        weapon: soldier.equipment.weapon
                    },
                    inventory: soldier.inventory,
                    // living: boolean,
                    actorType: soldier.job.name
                }];


                if (this.player2) {
                    player.combatState.heroes.push({
                        name: this.player2.name,
                        job: this.player2.job,
                        id: this.player2.id,
                        key: this.player2.key,
                        stats: this.player2.stats,
                        equipment: {
                            body: undefined,
                            head: undefined,
                            offhand: undefined,
                            weapon: undefined
                        },
                        inventory: [],
                        // living: boolean,
                        actorType: this.player2.job.name
                    });

                }

                player.combatState.enemies = [{
                    name: enemy.name,
                    job: enemy.job,
                    id: enemy.id,
                    key: enemy.key,
                    stats: enemy.stats,
                    equipment: {
                        body: undefined,
                        head: undefined,
                        offhand: undefined,
                        weapon: undefined
                    },
                    inventory: [],
                    // living: boolean,
                    actorType: enemy.job.name
                }];

                player.combatState.units = player.combatState.heroes.concat(player.combatState.enemies);
                return player;
            }
        );

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

    private startNewRound(): void {
        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                player.combatState.roundIndex++;
                return player;
            }
        );

        for (const [index, passiveEffect] of this.passiveEffects.entries()) {
            passiveEffect.turnDurationRemaining--;
            if (passiveEffect.turnDurationRemaining === 0) {
                this.passiveEffects.splice(index, 1);
            }
        }

        this.battleUIScene.commandMenuText.setText('Command?');

        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                player.combatState.turnIndex = 0;
                return player;
            }
        );

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