// TODO: if i refresh quickly from game over in combat scene, the bot doesn't get his health back!!
//  to reproduce, just refresh when the screen says thou art vanquished


// TODO: LOAD THE PLAYER INTO THEIR SAVED BATTLE IF THEY ARE LOADED INTO A COMBAT SCENE!!!!!!!


// TODO: FIX THIS -> when the player enters a new level, they must store the
//  player's tile coordinates as being the same as the new levels spawn coordinates...
//  or something... the issue is this: if i close the game one step east and one step south
//  of the town, when i open the game again, i am on the overworld but up out of bounds on
//  top of a mountain. seems really tough to reproduce this error, not sure if it's fixed
//  or if i'm still missing something. haven't seen this glitch in a while. not sure
//  if it's fixed or not

// TODO: i saw a glitch where the font wasn't getting applied to the loading string at the
//  beginning of the game. haven't seen it reoccur for a moment, not sure if it's fixed or not

// TODO: STORE EXPERIENCE POINTS, STATS, EQUIPMENT, AND INVENTORY WHEN THEY CHANGE!!

// TODO: add an npc who walks in a predescribed pattern and will stop and speak when interacted with

// TODO: add an npc questgiver

// TODO: add items in the dressers

// TODO: add a sign that can be read

import {clone} from 'lodash';

import Bot from '../classes/Bot';
import BotGridPhysics from '../classes/BotGridPhysics';
import {DBUnit, IPlayer} from '../classes/GameDatabase';
import GridControls from '../classes/GridControls';
import Item from '../classes/Item';
import BotScientist from '../classes/npcs/BotScientist';
import Innkeeper from '../classes/npcs/Innkeeper';
import Merchant from '../classes/npcs/Merchant';
import Player from '../classes/Player';
import PlayerGridPhysics from '../classes/PlayerGridPhysics';
import {items} from '../items/items';
import MonsterSoldier from '../jobs/monsters/MonsterSoldier';
import playerSoldierJob from '../jobs/players/PlayerSoldier';
import {ILevelData, levels} from '../levels/Levels';
import {Direction} from '../types/Direction';
import {Equipment} from '../types/Equipment';
import GamePadScene from './GamePadScene';
import MusicScene from './MusicScene';
import SaveAndLoadScene from './SaveAndLoadScene';
import UIScene from './UIScene';
import Vector2 = Phaser.Math.Vector2;

export default class GameScene extends Phaser.Scene {
    static readonly TILE_SIZE = 48;
    public armorMerchant!: Merchant | undefined;
    public botScientist!: BotScientist | undefined;
    public bots: Bot[] = [];
    public currentMap!: string;
    public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    public gamePadScene?: GamePadScene;
    public gridControls!: GridControls;
    public gridPhysics!: PlayerGridPhysics;
    public innKeeper!: Innkeeper | undefined;
    public itemMerchant!: Merchant | undefined;
    public musicScene!: MusicScene;
    public npcs: (Innkeeper | Merchant | BotScientist)[] = [];
    public operatingSystem!: string;
    public player!: Player;
    public playerTileX!: number;
    public playerTileY!: number;
    public readyToInteractObject: Innkeeper | Merchant | BotScientist | undefined;
    public spaceDown!: boolean;
    public uiScene!: UIScene;
    public weaponMerchant!: Merchant | undefined;
    public botGridPhysics!: BotGridPhysics;
    public saveIndex!: number;
    private currentTilemap!: Phaser.Tilemaps.Tilemap;
    private exitingCurrentLevel!: boolean;
    private movedFromSpawn!: boolean;
    private nonHostileSpace!: boolean;
    private lastPlayerDirection!: Direction;
    // private botGridControls!: BotGridControls;
    private encounter_counter = 0;
    private saveAndLoadScene!: SaveAndLoadScene;
    private firstUpdateRun = false;
    public MAX_LEVEL = 5;
    public PLAYER_LEVELING_RATE = 0.3;
    public BOT_LEVELING_RATE = 0.4;

    public constructor() {
        super('Game');
    }

    checkForRandomEncounter(): boolean {
        const randNum = Phaser.Math.RND.between(0, 8);
        return randNum === 0;
    }

    public init(
        data: {
            nameData?: string;
            saveIndex?: number;
            levelData?: ILevelData;
            loadFromSave?: boolean;
        }) {
        console.log('entering game scene init method');
        this.saveIndex = 0;
        this.saveAndLoadScene = <SaveAndLoadScene>this.scene.get('SaveAndLoad');
        this.uiScene = <UIScene>this.scene.get('UI');
        this.musicScene = <MusicScene>this.scene.get('Music');
        if (data.loadFromSave) {
            console.log('entering game scene init method\'s if(loadfromsave) branch');
            // load the game info from dexie
            this.uiScene.scene.bringToTop();

            this.npcs = [];

            this.innKeeper = undefined;
            this.weaponMerchant = undefined;
            this.armorMerchant = undefined;
            this.itemMerchant = undefined;
            this.botScientist = undefined;

            this.saveAndLoadScene.getPlayerByIndex(0).then((player: IPlayer) => {
                console.log('loading the player data from the database');
                console.log({storedTilemap: player.currentTilemap});
                const levelData = levels[player.currentTilemap];
                this.nonHostileSpace = !levelData.hostile;
                if (!player.inCombat) this.musicScene.changeSong(levelData.music);

                // store the current map in the database!!!
                this.saveAndLoadScene.db.players.update(
                    0,
                    {
                        currentTilemap: player.currentTilemap
                    }
                );

                this.currentMap = player.currentTilemap;
                this.exitingCurrentLevel = false;

                this.currentTilemap = this.make.tilemap(
                    {key: levelData.tilemapKey}
                );
                this.currentTilemap.addTilesetImage(levelData.tilesetName, levelData.tilesetKey);
                for (let i = 0; i < this.currentTilemap.layers.length; i++) {
                    const layer = this.currentTilemap
                        .createLayer(i, levelData.tilesetName, 0, 0);
                    layer?.setDepth(i);
                }

                const playerSprite = this.add.sprite(0, 0, player.texture);
                playerSprite.setDepth(2);
                this.cameras.main.startFollow(playerSprite);
                this.player = new Player(
                    player.name,
                    playerSprite,
                    new Phaser.Math.Vector2(
                        player.position.x,
                        player.position.y
                    ),
                    player.gold,
                    player.experience,
                    'Human',
                    playerSoldierJob,
                    player.inventory,
                    player.equipment,
                    player.currentHP,
                    player.currentResource
                );
                this.scene.launch('UI');

                this.bots = [];
                if (player.bots.length > 0) {
                    const bot = player.bots[0];
                    const botTexture = bot.texture;
                    const botSprite = this.add.sprite(0, 0, botTexture);
                    botSprite.setDepth(1);
                    this.bots.push(
                        new Bot(
                            bot.name,
                            botSprite,
                            bot.experience,
                            'Red Bot',
                            MonsterSoldier,
                            bot.currentHP,
                            bot.currentResource
                        )
                    );
                    this.setupBotGridPhysics();
                }
                this.setupPlayerGridPhysics();

                this.sys.events.removeListener('wake');
                this.sys.events.on('wake', this.wake, this);

                // iterate over the levels npcs and implement their functions
                for (const npc of levelData.npcs) {
                    // place npc sprites
                    if (npc.name === 'botscientist') {
                        const botScientistSprite = this.add.sprite(0, 0, 'npc5');
                        botScientistSprite.setDepth(2);
                        this.botScientist = new BotScientist(
                            botScientistSprite,
                            new Phaser.Math.Vector2(
                                npc.x,
                                npc.y
                            )
                        );
                        this.npcs.push(this.botScientist);
                    }
                    else if (npc.name === 'itemmerchant') {
                        const itemMerchantSprite = this.add.sprite(0, 0, 'npc4');
                        itemMerchantSprite.setDepth(2);

                        if (npc.inventory) {
                            this.itemMerchant = new Merchant(
                                itemMerchantSprite,
                                new Phaser.Math.Vector2(
                                    npc.x,
                                    npc.y
                                ),
                                npc.inventory
                            );
                            this.npcs.push(this.itemMerchant);
                        }
                    }

                    else if (npc.name === 'armormerchant') {
                        const armorMerchantSprite = this.add.sprite(0, 0, 'npc3');
                        armorMerchantSprite.setDepth(2);

                        if (npc.inventory) {
                            this.armorMerchant = new Merchant(
                                armorMerchantSprite,
                                new Phaser.Math.Vector2(
                                    npc.x,
                                    npc.y
                                ),
                                npc.inventory
                            );
                            this.npcs.push(this.armorMerchant);
                        }
                    }

                    else if (npc.name === 'weaponmerchant') {
                        const weaponMerchantSprite = this.add.sprite(0, 0, 'npc2');
                        weaponMerchantSprite.setDepth(2);

                        if (npc.inventory) {
                            this.weaponMerchant = new Merchant(
                                weaponMerchantSprite,
                                new Phaser.Math.Vector2(
                                    npc.x,
                                    npc.y
                                ),
                                npc.inventory
                            );
                            this.npcs.push(this.weaponMerchant);
                        }
                    }

                    else if (npc.name === 'innkeeper') {
                        // spawning an innkeeper
                        const innKeeperSprite = this.add.sprite(0, 0, 'npc1');
                        innKeeperSprite.setDepth(2);

                        this.innKeeper = new Innkeeper(
                            innKeeperSprite,
                            new Phaser.Math.Vector2(
                                npc.x,
                                npc.y
                            )
                        );
                        this.npcs.push(this.innKeeper);
                    }
                }

                this.playerTileX = this.player.getTilePos().x;
                this.playerTileY = this.player.getTilePos().y;
                this.movedFromSpawn = false;

                const someHeroesAreAlive = player.combatState.heroes.some((hero: DBUnit) => hero.currentHP > 0);
                if (player.inCombat && someHeroesAreAlive) {
                    // TODO: if the heroes are all dead just take the gold
                    //  and put the player back at spawn. don't start the
                    //  battle.
                    this.scene.launch('Battle', {
                        loadBattleData: true,
                        savedCombatState: player.combatState
                    });
                    this.scene.sleep('Game');
                }

            });
        }
    }

    public create(
        data: {
            nameData?: string;
            saveIndex?: number;
            levelData?: ILevelData;
            loadFromSave?: boolean;
        }
    ) {
        console.log('entering the game scene\'s create method');
        this.saveIndex = 0;
        this.encounter_counter = 0;

        this.input.keyboard!.enabled = true;

        this.gamePadScene?.scene.restart();

        if (this.operatingSystem === 'mobile') {
            // launching the game pad scene
            this.scene.launch('GamePad');
            this.gamePadScene = <GamePadScene>this.scene.get('GamePad');
        }
        // if data is empty then the game just started so load the player in the spawn location
        if (data.nameData) {
            console.log('entering the game scene\'s create method\'s if (namedata) branch');
            // new player created! welcome to Caelor!
            // just got the player's namedata on the initial spawn

            // create the game scene when the level 1 player initially spawns.
            // create the map
            this.scene.launch('UI');
            this.uiScene.scene.bringToTop();
            this.musicScene.scene.bringToTop();

            this.musicScene.changeSong('town');
            if (this.musicScene.gameOverSong.isPlaying) {
                this.musicScene.changeSong('overworld');
            }

            this.nonHostileSpace = true;

            // store the current map in the database!!!
            this.saveAndLoadScene.db.players.update(
                0,
                {
                    currentTilemap: levels.town.name
                }
            );

            this.currentMap = levels.town.name;
            this.exitingCurrentLevel = false;
            this.currentTilemap = this.make.tilemap(
                {key: levels.town.tilemapKey}
            );
            this.currentTilemap.addTilesetImage(levels.town.tilesetName, levels.town.tilesetKey);
            for (let i = 0; i < this.currentTilemap.layers.length; i++) {
                const layer = this.currentTilemap
                    .createLayer(i, levels.town.tilesetName, 0, 0);
                layer?.setDepth(i);
            }

            // load the player sprite
            const playerSprite = this.add.sprite(0, 0, 'hero');
            playerSprite.setDepth(2);
            this.cameras.main.startFollow(playerSprite);

            const aBunchOfPotions = [];
            const potionItem = items.find(obj => {
                return obj.name === 'Health Potion';
            });
            for (let i = 0; i < 8; i++) {
                const potion = new Item(
                    potionItem!.key,
                    potionItem!.activekey,
                    potionItem!.name,
                    potionItem!.type,
                    potionItem!.cost,
                    potionItem!.sellPrice,
                    potionItem!.description,
                    potionItem!.hpchange
                );
                aBunchOfPotions.push(potion);
            }

            const emptyEquipment: Equipment = {
                body: undefined,
                head: undefined,
                offhand: undefined,
                weapon: undefined
            };

            this.player = new Player(
                data.nameData,
                playerSprite,
                new Phaser.Math.Vector2(
                    12,
                    14
                ),
                this.player?.gold ?? 0,
                this.player?.experience ?? 0,
                'Human',
                playerSoldierJob,
                [],
                emptyEquipment,
                playerSoldierJob.baseStats.vitality * 2,
                100
            );

            //upload the player interface to the client database
            this.saveAndLoadScene.upsertPlayer({
                id: 0,
                bots: [],
                combatState: {
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
                },
                currentTilemap: 'town',
                equipment: {body: undefined, head: undefined, offhand: undefined, weapon: undefined},
                experience: 0,
                facing: Direction.DOWN,
                gold: 0,
                inCombat: false,
                inventory: this.player.inventory,
                name: data.nameData,
                job: this.player.job,
                position: new Phaser.Math.Vector2(
                    12,
                    14
                ),
                currentHP: this.player.currentHP,
                currentResource: this.player.currentResource,
                // stats: this.player.stats,
                texture: this.player.sprite.texture.key

            });

            this.setupPlayerGridPhysics();

            this.sys.events.removeListener('wake');
            this.sys.events.on('wake', this.wake, this);

            this.npcs = [];

            this.innKeeper = undefined;
            this.weaponMerchant = undefined;
            this.armorMerchant = undefined;
            this.itemMerchant = undefined;
            this.botScientist = undefined;

            for (const npc of levels.town.npcs) {
                // place npc sprites
                if (npc.name === 'botscientist') {
                    const botScientistSprite = this.add.sprite(0, 0, 'npc5');
                    botScientistSprite.setDepth(2);
                    this.botScientist = new BotScientist(
                        botScientistSprite,
                        new Phaser.Math.Vector2(
                            npc.x,
                            npc.y
                        )
                    );
                    this.npcs.push(this.botScientist);
                }
                else if (npc.name === 'itemmerchant') {
                    const itemMerchantSprite = this.add.sprite(0, 0, 'npc4');
                    itemMerchantSprite.setDepth(2);

                    if (npc.inventory) {
                        this.itemMerchant = new Merchant(
                            itemMerchantSprite,
                            new Phaser.Math.Vector2(
                                npc.x,
                                npc.y
                            ),
                            npc.inventory
                        );
                        this.npcs.push(this.itemMerchant);
                    }
                }

                else if (npc.name === 'armormerchant') {
                    const armorMerchantSprite = this.add.sprite(0, 0, 'npc3');
                    armorMerchantSprite.setDepth(2);

                    if (npc.inventory) {
                        this.armorMerchant = new Merchant(
                            armorMerchantSprite,
                            new Phaser.Math.Vector2(
                                npc.x,
                                npc.y
                            ),
                            npc.inventory
                        );
                        this.npcs.push(this.armorMerchant);
                    }
                }

                else if (npc.name === 'weaponmerchant') {
                    const weaponMerchantSprite = this.add.sprite(0, 0, 'npc2');
                    weaponMerchantSprite.setDepth(2);

                    if (npc.inventory) {
                        this.weaponMerchant = new Merchant(
                            weaponMerchantSprite,
                            new Phaser.Math.Vector2(
                                npc.x,
                                npc.y
                            ),
                            npc.inventory
                        );
                        this.npcs.push(this.weaponMerchant);
                    }
                }

                else if (npc.name === 'innkeeper') {
                    // spawning an innkeeper
                    const innKeeperSprite = this.add.sprite(0, 0, 'npc1');
                    innKeeperSprite.setDepth(2);

                    this.innKeeper = new Innkeeper(
                        innKeeperSprite,
                        new Phaser.Math.Vector2(
                            npc.x,
                            npc.y
                        )
                    );
                    this.npcs.push(this.innKeeper);
                }
            }

            this.playerTileX = this.player.getTilePos().x;
            this.playerTileY = this.player.getTilePos().y;

        }
        else if (data.levelData) {
            console.log('entering the game scene\'s create method\'s else if (leveldata) branch');

            this.uiScene.scene.bringToTop();

            this.npcs = [];

            this.innKeeper = undefined;
            this.weaponMerchant = undefined;
            this.armorMerchant = undefined;
            this.itemMerchant = undefined;
            this.botScientist = undefined;

            this.musicScene.changeSong(data.levelData.music);

            // store the current map in the database!!!
            this.saveAndLoadScene.db.players.update(
                0,
                {
                    currentTilemap: data.levelData.name,
                    position: new Phaser.Math.Vector2(
                        data.levelData.spawnCoords[0].x,
                        data.levelData.spawnCoords[0].y
                    ),
                }
            );

            // spawn the character in the correct position based on data passed to the restart method
            // create the map
            this.currentMap = data.levelData.name;
            this.exitingCurrentLevel = false;
            this.currentTilemap = this.make.tilemap({key: data.levelData.tilemapKey});
            this.currentTilemap.addTilesetImage(data.levelData.tilesetName, data.levelData.tilesetKey);
            for (let i = 0; i < this.currentTilemap.layers.length; i++) {
                const layer = this.currentTilemap
                    .createLayer(i, data.levelData.tilesetName, 0, 0);
                layer?.setDepth(i);
            }

            const playerSprite = this.add.sprite(0, 0, 'hero');
            playerSprite.setDepth(2);
            this.cameras.main.startFollow(playerSprite);
            this.player = new Player(
                this.player.name,
                playerSprite,
                new Phaser.Math.Vector2(
                    data.levelData.spawnCoords[0].x,
                    data.levelData.spawnCoords[0].y
                ),
                this.player.gold,
                this.player.experience,
                'Human',
                playerSoldierJob,
                this.player.inventory,
                this.player.equipment,
                this.player.currentHP,
                this.player.currentResource
                // this.player.stats
            );
            this.setupPlayerGridPhysics();

            // Spawn the bots if there are any
            if (this.bots.length > 0) {
                // Spawn the bot!
                const botClone = clone(this.bots[0]);
                const botCurrentHP = this.bots[0].currentHP;
                const botCurrentResource = this.bots[0].currentResource;

                const botSprite = this.add.sprite(0, 0, botClone.sprite.texture);
                botSprite.setDepth(1);
                const bot = new Bot(
                    botClone.name,
                    botSprite,
                    botClone.experience,
                    botClone.species,
                    botClone.job,
                    botCurrentHP,
                    botCurrentResource
                );
                this.bots[0] = bot;

                this.setupBotGridPhysics();
            }

            this.sys.events.removeListener('wake');
            this.sys.events.on('wake', this.wake, this);

            // iterate over the levels npcs and implement their functions
            for (const npc of data.levelData.npcs) {
                // place npc sprites
                if (npc.name === 'botscientist') {
                    const botScientistSprite = this.add.sprite(0, 0, 'npc5');
                    botScientistSprite.setDepth(2);
                    this.botScientist = new BotScientist(
                        botScientistSprite,
                        new Phaser.Math.Vector2(
                            npc.x,
                            npc.y
                        )
                    );
                    this.npcs.push(this.botScientist);
                }
                else if (npc.name === 'itemmerchant') {
                    const itemMerchantSprite = this.add.sprite(0, 0, 'npc4');
                    itemMerchantSprite.setDepth(2);

                    if (npc.inventory) {
                        this.itemMerchant = new Merchant(
                            itemMerchantSprite,
                            new Phaser.Math.Vector2(
                                npc.x,
                                npc.y
                            ),
                            npc.inventory
                        );
                        this.npcs.push(this.itemMerchant);
                    }
                }

                else if (npc.name === 'armormerchant') {
                    const armorMerchantSprite = this.add.sprite(0, 0, 'npc3');
                    armorMerchantSprite.setDepth(2);

                    if (npc.inventory) {
                        this.armorMerchant = new Merchant(
                            armorMerchantSprite,
                            new Phaser.Math.Vector2(
                                npc.x,
                                npc.y
                            ),
                            npc.inventory
                        );
                        this.npcs.push(this.armorMerchant);
                    }
                }

                else if (npc.name === 'weaponmerchant') {
                    const weaponMerchantSprite = this.add.sprite(0, 0, 'npc2');
                    weaponMerchantSprite.setDepth(2);

                    if (npc.inventory) {
                        this.weaponMerchant = new Merchant(
                            weaponMerchantSprite,
                            new Phaser.Math.Vector2(
                                npc.x,
                                npc.y
                            ),
                            npc.inventory
                        );
                        this.npcs.push(this.weaponMerchant);
                    }
                }

                else if (npc.name === 'innkeeper') {
                    // spawning an innkeeper
                    const innKeeperSprite = this.add.sprite(0, 0, 'npc1');
                    innKeeperSprite.setDepth(2);

                    this.innKeeper = new Innkeeper(
                        innKeeperSprite,
                        new Phaser.Math.Vector2(
                            npc.x,
                            npc.y
                        )
                    );
                    this.npcs.push(this.innKeeper);
                }
            }

            this.playerTileX = this.player.getTilePos().x;
            this.playerTileY = this.player.getTilePos().y;
            this.movedFromSpawn = false;
        }
    }

    public preload() {
        if (this.sys.game.device.os.desktop) {
            this.operatingSystem = 'desktop';
        }
        if (this.sys.game.device.os.android) {
            this.operatingSystem = 'mobile';
        }
        if (this.sys.game.device.os.iOS) {
            this.operatingSystem = 'mobile';
        }
    }

    public update(_time: number, delta: number) {

        if (!this.gridControls) {
            return;
        }

        this.gridControls.update();
        this.gridPhysics.update(delta);

        // Check if the player's position has changed
        const xPositionChanged = this.playerTileX !== this.player.getTilePos().x;
        const yPositionChanged = this.playerTileY !== this.player.getTilePos().y;
        const xOrYPositionChanged = yPositionChanged || xPositionChanged;

        let playerPos = undefined;
        if (xOrYPositionChanged) {
            // Get the player's current position
            playerPos = this.player.getTilePos();
        }

        // Get the player's current position

        // If the bot exists and the player has moved, update the bot's position
        if (this.bots.length > 0 && this.bots[0]) {
            this.botGridPhysics.update(delta);
            if (xOrYPositionChanged && playerPos) {
                // Add the player's position to the path
                this.bots[0].path.push(playerPos);
            }
            this.bots[0].update();
        }

        if (xPositionChanged) {
            // Update the last player direction
            this.lastPlayerDirection = this.playerTileX < this.player.getTilePos().x ? Direction.RIGHT : Direction.LEFT;
        }
        if (yPositionChanged) {
            // Update the last player direction
            this.lastPlayerDirection = this.playerTileY < this.player.getTilePos().y ? Direction.DOWN : Direction.UP;
        }

        let checkForAFight = false;

        // determine if the player is in hostile territory

        if (xOrYPositionChanged) {
            console.log({x: playerPos?.x, y: playerPos?.y});
            this.movedFromSpawn = true;
            this.saveAndLoadScene.db.players.update(
                0,
                {
                    position: new Vector2(
                        this.player.getTilePos()
                    )
                }
            );
        }

        if (
            (xOrYPositionChanged) &&
            !this.exitingCurrentLevel &&
            !this.nonHostileSpace
        ) {

            this.encounter_counter += 1; // Increment encounter counter
            if (this.encounter_counter >= 3) {
                checkForAFight = true;
            }
        }

        // update the player's NEW X Y Coords in the tile map
        this.playerTileX = this.player.getTilePos().x;
        this.playerTileY = this.player.getTilePos().y;

        // check if the player is moving into the town tile
        if (
            this.currentTilemap.getTileAt(
                this.playerTileX,
                this.playerTileY,
                false,
                1
            )?.properties.key === 'town' &&
            !this.exitingCurrentLevel &&
            this.movedFromSpawn
        ) {
            checkForAFight = false;
            this.exitingCurrentLevel = true;
            // enter the town
            this.time.delayedCall(240, () => {
                // switch to town scene using scene restart method
                this.nonHostileSpace = true;
                this.gamePadScene?.scene.stop();
                this.scene.restart({levelData: levels.town});
            });
        }

        // check if the player is leaving the town
        if (
            (
                this.playerTileX === 0 ||
                this.playerTileY === 0 ||
                this.playerTileX === 19 ||
                this.playerTileY === 19
            ) &&
            this.currentMap === 'town' &&
            !this.exitingCurrentLevel
        ) {
            this.nonHostileSpace = false;
            this.exitingCurrentLevel = true;
            // load overworld again
            this.time.delayedCall(240, () => {
                // switch to the town tilemap
                this.scene.restart({levelData: levels.overworld});
            });
        }

        if (checkForAFight && !this.nonHostileSpace) {
            // randomly determine if fight will occur
            if (this.checkForRandomEncounter()) {
                // start combat
                this.scene.switch('Battle');
            }
        }

        // check if the player is facing an npc. if so, show the interact button.
        //  otherwise, hide the interact button
        let readyNPCFound = false;
        for (const npc of this.npcs) {
            if (
                (
                    this.uiScene.interactionState.startsWith('mainselect') ||
                    this.uiScene.interactionState.startsWith('cancel')
                ) && npc.testForInteractionReadyState()) {
                // yes, the player is facing the current npc
                readyNPCFound = true;
                this.readyToInteractObject = npc;
                if (!this.uiScene.interactFrame.visible) {
                    this.uiScene.interactFrame.setVisible(true);
                    this.uiScene.interactButton.showActionButton();
                    // break out of the loop because we found the guy
                    break;
                }
            }
        }
        if (!readyNPCFound) {
            this.readyToInteractObject = undefined;
            // if I'm not facing the guy, hide the interact button
            if (this.uiScene.interactFrame.visible) {
                this.uiScene.interactFrame.setVisible(false);
                this.uiScene.interactButton.hideActionButton();
            }
        }

        // listen for the interact action (space bar)
        if (
            !this.spaceDown &&
            Phaser.Input.Keyboard.JustDown(this.cursors.space)
        ) {
            this.spaceDown = true;

            if (this.weaponMerchant || this.innKeeper || this.armorMerchant || this.itemMerchant || this.botScientist) {
                // space bar pressed on game scene (npc[s] found)
                if (
                    this.uiScene.interactionState === 'mainselect'
                ) {
                    // listening for interactivity on npcs
                    if (this.weaponMerchant) this.weaponMerchant.listenForInteractEvent();
                    if (this.armorMerchant) this.armorMerchant.listenForInteractEvent();
                    if (this.innKeeper) this.innKeeper.listenForInteractEvent();
                    if (this.itemMerchant) this.itemMerchant.listenForInteractEvent();
                    if (this.botScientist) this.botScientist.listenForInteractEvent();
                }
            }
        }

        if (
            Phaser.Input.Keyboard.JustUp(this.cursors.space)
        ) {
            // space bar lifted! (game scene)
            this.spaceDown = false;
        }
    }

    public wake() {
        this.encounter_counter = 0;
        this.musicScene.changeSong('overworld');
        this.uiScene.scene.bringToTop();
        this.gamePadScene?.scene.restart();

        this.input.keyboard!.enabled = true;
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();
    }

    public setupBotGridPhysics() {
        this.bots[0].path.push(this.player.getTilePos());
        this.botGridPhysics = new BotGridPhysics(this.bots[0], this.currentTilemap);
        this.createBotAnimation('redbot_up', 6, 7);
        this.createBotAnimation('redbot_right', 4, 5);
        this.createBotAnimation('redbot_down', 0, 1);
        this.createBotAnimation('redbot_left', 2, 3);
    }

    private createBotAnimation(name: string, startFrame: number, endFrame: number) {
        this.anims.create({
            key: name,
            frames: this.anims.generateFrameNumbers('redbot', {
                start: startFrame,
                end: endFrame
            }),
            frameRate: 5,
            repeat: -1,
            yoyo: true
        });
    }

    private createPlayerAnimation(name: string, startFrame: number, endFrame: number) {
        this.anims.create({
            key: name,
            frames: this.anims.generateFrameNumbers('hero', {
                start: startFrame,
                end: endFrame,
            }),
            frameRate: 5,
            repeat: -1,
            yoyo: true,
        });
    }

    private setupPlayerGridPhysics() {
        this.gridPhysics = new PlayerGridPhysics(this.player, this.currentTilemap);
        this.gridControls = new GridControls(this.input, this.gridPhysics);

        this.createPlayerAnimation(Direction.UP, 6, 7);
        this.createPlayerAnimation(Direction.RIGHT, 4, 5);
        this.createPlayerAnimation(Direction.DOWN, 0, 1);
        this.createPlayerAnimation(Direction.LEFT, 2, 3);

        this.cursors = this.input.keyboard!.createCursorKeys();
    }
}