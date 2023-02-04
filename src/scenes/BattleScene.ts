import _ from 'lodash';

import {abilities, IAbility} from '../abilities/abilities';
import BotCharacter from '../classes/BotCharacter';
import {Enemy} from '../classes/Enemy';
import {DBUnit, IPlayer} from '../classes/GameDatabase';
import PlayerCharacter from '../classes/PlayerCharacter';
import {enemies} from '../enemies/enemies';
import MonsterSoldier from '../jobs/monsters/MonsterSoldier';
import playerSoldier from '../jobs/players/PlayerSoldier';
import {levels} from '../levels/Levels';
import {IStatIncreases} from '../types/Advancement';
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
    public turnIndex!: number;
    public roundUnits!: (PlayerCharacter | BotCharacter | Enemy)[];
    private uiScene!: UIScene;
    private actionMenuFrame!: Phaser.GameObjects.Image;
    private player1MenuFrame!: Phaser.GameObjects.Image;
    private player2MenuFrame!: Phaser.GameObjects.Image;
    private saveAndLoadScene!: SaveAndLoadScene;
    private player2MPText!: Phaser.GameObjects.Text;
    private playerExperienceGain!: number;
    private botExperienceGain!: number;

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

    public create(data?: {
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

        console.log('determining whether or not to start the battle!');
        console.log({data});
        if (data?.loadBattleData) {
            this.loadBattle(data.savedCombatState);
        }
        else if (!data?.loadBattleData || !data) this.startBattle();

        this.sys.events.on('wake', this.startBattle, this);
    }

    public generateID(): number {
        return this._idCounter++;

    }

    private checkForPlayer1LevelUp(): { levelUp: boolean, newLevel: number } {
        const gameScenePlayer = this.gameScene.player;
        console.log('checkForPlayer1LevelUp method started');
        if (gameScenePlayer.level === 1) {
            return {levelUp: false, newLevel: 1};
        }
        else if (this.playerExperienceGain === 0) {
            return {levelUp: false, newLevel: gameScenePlayer.level};
        }
        else {
            // get the total exp from the enemies
            let experienceAmount = 0;

            for (const enemy of this.enemies) {
                const enemyData = enemies.find(obj => {
                    return obj.key === enemy.texture.key;
                });
                experienceAmount += enemyData?.experience ?? 0;
                console.log(`Experience amount after adding enemy's experience: ${experienceAmount}`);
            }

            // get the player's current level
            const currentLevel = gameScenePlayer.level;
            console.log(`Current player level: ${currentLevel}`);
            console.log(`Current player experience: ${gameScenePlayer.experience}`);

            const newLevel = gameScenePlayer.getLevelFromExperience(gameScenePlayer.experience - experienceAmount);
            console.log(`New player level: ${newLevel}`);

            console.log('checkForPlayer1LevelUp method finished');
            return {levelUp: newLevel < currentLevel, newLevel: currentLevel};

        }
    }

    private checkForPlayer2LevelUp(): {
        levelUp: boolean,
        newLevel: number
        } {
        // Get the bot player from the game scene
        const bot = this.gameScene.bots[0];

        // Get the bot's current level
        const currentLevel = bot.level;

        if (currentLevel === 1) {
            return {levelUp: false, newLevel: bot.level};
        }
        else if (this.botExperienceGain === 0) {
            return {levelUp: false, newLevel: bot.level};
        }
        else {
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

            // Calculate the new level of the bot based on its current experience and the `experienceAmount` gained from battle
            const newLevel = bot.getLevelFromExperience(bot.experience - experienceAmount);

            // Return an object containing a boolean `levelUp` that indicates whether
            // the player leveled up, and a number `newLevel` representing the new level of the player.
            return {levelUp: newLevel < currentLevel, newLevel: currentLevel};
        }
    }

    public checkForVictory(): boolean {
        return !this.enemies.some(enemy => enemy.isLiving());
    }

    private endBattleFrontEndActions() {
        this.battleUIScene.disableAllActionButtons();
        for (const unit of this.heroes) {
            if (unit instanceof PlayerCharacter) {
                const gameScenePlayer = this.gameScene.player;

                eventsCenter.emit(
                    'updateResource',
                    gameScenePlayer.currentResource,
                    gameScenePlayer.maxResource
                );

                this.uiScene.updateHP(
                    gameScenePlayer.currentHP,
                    gameScenePlayer.maxHP
                );
            }
            else {
                const bot = this.gameScene.bots[0];
                // unit must be a bot character at this point
                this.uiScene.updatePlayer2HP(bot.currentHP, bot.maxHP);
            }
        }
        this.removeSprites();
        this.scene.sleep('BattleUI');

        this.gameScene.input.keyboard!.enabled = true;

        // return to game scene and sleep current battle scene
        this.scene.switch('Game');
    }

    public endBattleBackEndActions() {
        this.saveAndLoadScene.db.players.update(
            0,
            {inCombat: false}
        );
        this.heroes.sort((a, b) => {
            if (a instanceof PlayerCharacter && !(b instanceof PlayerCharacter)) {
                return -1;
            }
            else if (!(a instanceof PlayerCharacter) && b instanceof PlayerCharacter) {
                return 1;
            }
            else {
                return 0;
            }
        });

        for (const unit of this.heroes) {
            if (unit instanceof PlayerCharacter) {
                const gameScenePlayer = this.gameScene.player;
                gameScenePlayer.currentHP = unit.currentHP;

                if (gameScenePlayer.currentHP <= 0) {
                    gameScenePlayer.currentHP = 1;
                }

                let goldAmount = 0;
                let experienceAmount = 0;

                if (this.interactionState === 'handlingrunselect') {
                    goldAmount = 0;
                    experienceAmount = 0;
                }

                else {
                    for (const enemy of this.enemies) {
                        const enemyData = enemies.find(obj => {
                            return obj.key === enemy.texture.key;
                        });
                        goldAmount += enemyData?.gold ?? 0;
                        experienceAmount += enemyData?.experience ?? 0;
                    }

                    gameScenePlayer.gold = gameScenePlayer.gold + goldAmount;
                }
                const newExperienceAmount = Math.min(gameScenePlayer.experience + experienceAmount, gameScenePlayer.maxExperience);

                console.log(`incrementing the player's experience! new exp amount: ${newExperienceAmount}`);
                this.playerExperienceGain = newExperienceAmount - gameScenePlayer.experience;
                gameScenePlayer.experience = newExperienceAmount;
                console.log(`player's new level: ${gameScenePlayer.level}`);
            }
            else {
                const bot = this.gameScene.bots[0];
                // unit must be a bot character at this point
                bot.currentHP = unit.currentHP;
                if (bot.currentHP <= 0) {
                    bot.currentHP = 1;
                }

                console.log('initializing bot experience (0)');
                let experienceAmount = 0;

                if (this.interactionState === 'handlingrunselect') {
                    experienceAmount = 0;
                }
                else {
                    for (const enemy of this.enemies) {
                        const enemyData = enemies.find(obj => {
                            return obj.key === enemy.texture.key;
                        });
                        experienceAmount += enemyData?.experience ?? 0;
                        console.log(`bot experience calculated from enemies: ${experienceAmount}`);
                    }

                    // Calculate the new level of the bot based on its current experience and the `experienceAmount` gained from battle
                    let newLevel = bot.getLevelFromExperience(
                        bot.experience + experienceAmount
                    );
                    console.log(`calculated bot level accounting for new experience points: ${newLevel}`);
                    let newLevelExceedsPlayersCurrentLevel = newLevel > this.gameScene.player.level;
                    console.log(`new bot level exceeds player's current level: ${newLevelExceedsPlayersCurrentLevel}`);
                    while (newLevelExceedsPlayersCurrentLevel) {
                        experienceAmount -= 1;
                        console.log(`decrementing experience amount, new experience amount: ${experienceAmount}`);
                        newLevel = bot.getLevelFromExperience(bot.experience + experienceAmount);
                        console.log(`calculated bot level accounting for new experience points: ${newLevel}`);
                        newLevelExceedsPlayersCurrentLevel = newLevel > this.gameScene.player.level;
                        console.log(`new bot level exceeds player's current level: ${newLevelExceedsPlayersCurrentLevel}`);

                    }
                }

                const newExperienceAmount = Math.min(bot.experience + experienceAmount, bot.maxExperience);

                this.botExperienceGain = newExperienceAmount - bot.experience;
                bot.experience = newExperienceAmount;

            }
        }
        this.clearState();
    }

    private clearState() {
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
    }

    private removeSprites() {
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

    public endBattleGameOverBackendActions(): void {
        this.saveAndLoadScene.db.players.update(
            0,
            {inCombat: false}
        );

        // cut gold in half, set hit points to full, cut to game over screen, respawn
        this.gameScene.player.gold = Math.floor(this.gameScene.player.gold / 2);

        const newHP = this.gameScene.player.maxHP;
        this.saveAndLoadScene.db.players.update(
            0,
            (player: IPlayer) => {
                player.position.x = levels['overworld']['spawnCoords'][0].x;
                player.position.y = levels['overworld']['spawnCoords'][0].y;
                return player;
            }
        );
        this.gameScene.player.currentHP = newHP;
        if (this.gameScene.bots.length > 0) {
            const newBotHP = this.gameScene.bots[0].maxHP;
            this.gameScene.bots[0].currentHP = newBotHP;
        }
        this.clearState();
    }

    public endBattleGameOverFrontEndActions(): void {
        // change to game over music
        this.musicScene.changeSong('gameover');
        eventsCenter.emit('Message', 'Thou art vanquished!');
        eventsCenter.emit('updateResource', this.gameScene.player.currentResource, this.gameScene.player.maxResource);
        if (this.gameScene.bots.length > 0) {
            const newBotHP = this.gameScene.bots[0].maxHP;
            this.uiScene.player2hpText.setText(`HP: ${newBotHP}/${newBotHP}`);
        }
        this.uiScene.updateHP(this.gameScene.player.currentHP, this.gameScene.player.maxHP);
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

            this.removeSprites();

            // sleep the ui
            this.scene.sleep('BattleUI');

            this.battleUIScene.disableAllActionButtons();
            this.battleUIScene.cameras.main.fadeIn(0);

            this.cameras.main.fadeIn(0);

            // return to game scene and sleep current battle scene
            this.scene.switch('GameOver');
        });
    }

    public gameOverTest() {
        // check if all the heroes are dead (players and bots)
        console.log('testing whether each hero is dead from the game over test method!');
        console.log({
            heroesArray: this.heroes
        });
        let allHeroesAreDead = true;
        for (const hero of this.heroes) {
            console.log(`checking if ${hero.name} is dead.`);
            if (hero.isLiving()) {
                console.log(`${hero.name} appears to be living. their current hp is ${hero.currentHP}`);
                allHeroesAreDead = false;
            }
            else {
                console.log(`${hero.name} appears to be dead. their current hp is ${hero.currentHP}`);
                continue;
            }
        }

        return allHeroesAreDead;
    }

    private getStatIncrease(stat: keyof IStatIncreases, level: number): number {
        const statIncreaseRangeIncrementObject = playerSoldier.statIncreases[stat].find(obj => {
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
                console.log(
                    {
                        playerCombatStateUnits: player.combatState.units,
                        dataTarget: data.target
                    }
                );
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
                this.endBattleBackEndActions();
                this.sfxScene.playSound('runaway');
                this.time.addEvent({
                    delay: 2000,
                    callback: this.endBattleFrontEndActions,
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
        console.log({currentUnitCurrentHP: currentUnit.currentHP});
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

        // store a snapshot of the combat after each turn is run
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
                                currentHP: passiveEffect.actor.currentHP,
                                currentResource: passiveEffect.actor.currentResource,
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
                callback: this.endBattleGameOverFrontEndActions,
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
        const enemiesStillLiving = savedCombatState.enemies.some(enemy => enemy.currentHP > 0);
        const heroesStillLiving = savedCombatState.heroes.some(hero => hero.currentHP > 0);

        console.log('loading the battle from a saved state!!!!!');

        this.musicScene.scene.bringToTop();

        this.uiScene.selectCancel();
        this.gameScene.gamePadScene?.scene.stop();
        this.uiScene.scene.sendToBack();

        console.log('setting the turn index to the value of saved combat state turn index minus one');
        console.log({savedTurnIndex: savedCombatState.turnIndex, savedTurnIndexMinusOne: savedCombatState.turnIndex - 1});
        if (savedCombatState.turnIndex >= savedCombatState.roundUnits.length) {
            this.turnIndex = -1;
        }
        else {
            this.turnIndex = savedCombatState.turnIndex - 1;
        }

        if (enemiesStillLiving && heroesStillLiving) this.musicScene.changeSong('battle');

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

            // find the bot in the hero list
            const botHero = savedCombatState.heroes.find( unit => unit.actorType.startsWith('Monster'))!;

            this.player2 = new BotCharacter(
                this,
                504,
                675,
                this.gameScene.bots[0].sprite.texture,
                0,
                this.gameScene.bots[0].name,
                this.gameScene.bots[0].job,
                botHero.id
            );
            this.player2.currentHP = botHero.currentHP;
            this.player2.currentResource = botHero.currentResource;
            if (this.player2.currentHP <= 0) this.player2.setVisible(false);
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
                `HP: ${this.player2.currentHP}/${this.player2.maxHP}`, {
                    fontSize: '35px',
                    color: '#fff',
                    fontFamily: 'CustomFont'
                })
                .setResolution(3);

            const currentResource = botHero.currentResource;
            const maxResource = 100;

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
            this.gameScene.player.job,
            playerHero.id
        );
        soldier.currentHP = playerHero.currentHP;
        soldier.currentResource = playerHero.currentResource;
        if (soldier.currentHP <= 0) soldier.setVisible(false);
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
            `HP: ${soldier.currentHP}/${soldier.maxHP}`, {
                fontSize: '35px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
            .setResolution(3);


        const currentResource = soldier.currentResource;
        const maxResource = 100;
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
        enemy.stats = _.clone(
            enemies.find(obj => {
                return obj.key === enemyUnit.key;
            })!.stats
        );
        enemy.currentHP = enemyUnit.currentHP;
        enemy.currentResource = enemyUnit.currentResource;
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
        console.log('starting the battle!!');
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
                this.gameScene.bots[0].job
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
                `HP: ${this.gameScene.bots[0].currentHP}/${this.gameScene.bots[0].maxHP}`, {
                    fontSize: '35px',
                    color: '#fff',
                    fontFamily: 'CustomFont'
                })
                .setResolution(3);

            const currentResource = this.gameScene.bots[0].currentResource;
            const maxResource = 100;
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
            this.gameScene.player.job
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
            `HP: ${this.gameScene.player.currentHP}/${this.gameScene.player.maxHP}`, {
                fontSize: '35px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
            .setResolution(3);

        const currentResource = this.gameScene.player.currentResource;
        const maxResource = this.gameScene.player.maxResource;
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
                    currentHP: soldier.currentHP,
                    currentResource: soldier.currentResource,
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
                        currentHP: this.player2.currentHP,
                        currentResource: this.player2.currentResource,
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
                    currentHP: enemy.currentHP,
                    currentResource: enemy.currentResource,
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
        // if (this.interactionState === 'gameover') {
        //     this.endBattleGameOver();
        //     return;
        // }

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
                player2LevelUpData = this.checkForPlayer2LevelUp();
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
                            `HP: ${this.heroes[0].currentHP}/${this.heroes[0].maxHP}`
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
                            `HP: ${this.heroes[1].currentHP}/${this.gameScene.bots[0].maxHP}`
                        );
                    }
                });
            }

            this.time.addEvent({
                delay: 4000 + levelUpDelay,
                callback: this.endBattleFrontEndActions,
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