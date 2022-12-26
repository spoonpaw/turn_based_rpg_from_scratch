import Bot from '../classes/Bot';
import GridControls from '../classes/GridControls';
import GridPhysics from '../classes/GridPhysics';
import Item from '../classes/Item';
import BotScientist from '../classes/npcs/BotScientist';
import Innkeeper from '../classes/npcs/Innkeeper';
import Merchant from '../classes/npcs/Merchant';
import Player from '../classes/Player';
import {items} from '../items/items';
import {ILevelData, levels} from '../levels/Levels';
import {Direction} from '../types/Direction';
import {Equipment} from '../types/Equipment';
import GamePadScene from './GamePadScene';
import MusicScene from './MusicScene';
import UIScene from './UIScene';

export default class GameScene extends Phaser.Scene {
    static readonly TILE_SIZE = 48;
    public armorMerchant!: Merchant;
    public botScientist!: BotScientist;
    public bots: Bot[] = [];
    public currentMap!: string;
    public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    public gamePadScene?: GamePadScene;
    public gridControls!: GridControls;
    public gridPhysics!: GridPhysics;
    public innKeeper!: Innkeeper;
    public itemMerchant!: Merchant;
    public musicScene!: MusicScene;
    public npcs: (Innkeeper | Merchant | BotScientist)[] = [];
    public operatingSystem!: string;
    public player!: Player;
    public playerTileX!: number;
    public playerTileY!: number;
    public readyToInteractObject: Innkeeper | Merchant | BotScientist | undefined;
    public spaceDown!: boolean;
    public uiScene!: UIScene;
    public weaponMerchant!: Merchant;
    private currentTilemap!: Phaser.Tilemaps.Tilemap;
    private exitingCurrentLevel!: boolean;
    private movedFromSpawn!: boolean;
    private nonHostileSpace!: boolean;

    public constructor() {
        super('Game');
    }

    checkForRandomEncounter(): boolean {
        const randNum = Phaser.Math.RND.between(0, 4);
        return randNum === 0;
    }

    public create(data?: { levelData?: ILevelData }) {
        this.input.keyboard!.enabled = true;

        this.gamePadScene?.scene.restart();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (this.operatingSystem === 'mobile') {
            // launching the game pad scene
            this.scene.launch('GamePad');
            this.gamePadScene = <GamePadScene>this.scene.get('GamePad');
        }

        // this.activeDialogScene = false;

        // if data is empty then the game just started so load the player in the spawn location
        if (data && Object.keys(data).length === 0) {

            // create the game scene when the level 1 player initially spawns.
            // create the map
            this.scene.launch('UI');
            this.uiScene = <UIScene>this.scene.get('UI');
            this.uiScene.scene.bringToTop();
            this.musicScene = <MusicScene>this.scene.get('Music');
            this.musicScene.scene.bringToTop();

            if (this.musicScene.gameOverSong.isPlaying) {
                this.musicScene.changeSong('overworld');
            }

            this.nonHostileSpace = true;
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
            this.cameras.main.roundPixels = true;

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
                playerSprite,
                new Phaser.Math.Vector2(
                    // levels.town.spawnCoords[0].x,
                    // levels.town.spawnCoords[0].y
                    12,
                    14
                ),
                this.player?.gold ?? 500,
                this.player?.experience ?? 0,
                'Soldier',
                aBunchOfPotions,
                emptyEquipment
            );

            this.setupPlayerGridPhysics();

            this.sys.events.removeListener('wake');
            this.sys.events.on('wake', this.wake, this);

            this.npcs = [];

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
        else if (data?.levelData) {

            this.uiScene.scene.bringToTop();

            this.npcs = [];

            this.uiScene.musicScene.changeSong(data.levelData.music);

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
            this.cameras.main.roundPixels = true;
            this.player = new Player(
                playerSprite,
                new Phaser.Math.Vector2(
                    data.levelData.spawnCoords[0].x,
                    data.levelData.spawnCoords[0].y
                ),
                this.player.gold,
                this.player.experience,
                'Soldier',
                this.player.inventory,
                this.player.equipment,
                this.player.stats
            );

            this.setupPlayerGridPhysics();

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
        this.scene.scene.load.scenePlugin('rexgesturesplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexgesturesplugin.min.js', 'rexGestures', 'rexGestures');
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
        this.gridControls.update();
        this.gridPhysics.update(delta);

        // Check if the player's position has changed
        const xPositionChanged = this.playerTileX != this.player.getTilePos().x;
        const yPositionChanged = this.playerTileY != this.player.getTilePos().y;
        // Get the player's current position
        const playerPos = this.player.getPosition();

        // If the bot exists and the player has moved, update the bot's position
        if (this.bots.length > 0 && this.bots[0]) {
            if (xPositionChanged || yPositionChanged) {
                console.log({
                    botX: this.bots[0].getTilePos().x,
                    botY: this.bots[0].getTilePos().y
                });

                // Update the bot's position to be the player's previous position
                // this.bots[0].setPosition(new Phaser.Math.Vector2(playerPos));
                const duration = 245; // 1 second
                // Create a tween that moves the bot's sprite to the new position
                this.tweens.add({
                    targets: this.bots[0].sprite,
                    x: playerPos.x,
                    y: playerPos.y,
                    duration: duration,
                    ease: Phaser.Math.Easing.Linear
                });
            }
            // Update the bot
            this.bots[0].update(delta);
        }


        let checkForAFight = false;

        // determine if the player is in hostile territory

        if (xPositionChanged || yPositionChanged) {
            console.log({playerPos});
            console.log({
                playerTilePosX: this.player.getTilePos().x,
                playerTilePosY: this.player.getTilePos().y
            });
            this.movedFromSpawn = true;

        }

        if (
            (xPositionChanged || yPositionChanged) &&
            !this.exitingCurrentLevel &&
            !this.nonHostileSpace
        ) {
            checkForAFight = true;
        }

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
                // this.time.delayedCall(210, () => {
                //     this.scene.switch('Battle');
                // });
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
                    this.uiScene.interactButton.setVisible(true);
                    this.uiScene.interactButton.buttonText.setVisible(true);
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
                this.uiScene.interactButton.setVisible(false);
                this.uiScene.interactButton.buttonText.setVisible(false);
            }
        }

        // listen for the interact action (space bar)
        if (
            !this.spaceDown &&
            Phaser.Input.Keyboard.JustDown(this.cursors.space)
        ) {
            this.spaceDown = true;
            // if (this.uiScene.interactionState !== 'mainselect') {
            //     this.uiScene.selectCancel();
            // }

            if (this.weaponMerchant || this.innKeeper || this.armorMerchant || this.itemMerchant || this.botScientist) {
                // space bar pressed on game scene (npc[s] found)
                if (
                    this.uiScene.interactionState === 'mainselect' // ||
                    // this.uiScene.interactionState === 'cancelmouse' // ||
                    // this.uiScene.interactionState === 'cancel'
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
            Phaser.Input.Keyboard.JustUp(this.cursors.space) // &&
            //     this.uiScene.interactionState === 'cancel'
        ) {
            // space bar lifted! (game scene)
            this.spaceDown = false;
        }
    }

    public wake() {
        this.uiScene.musicScene.changeSong('overworld');
        this.uiScene.scene.bringToTop();
        this.gamePadScene?.scene.restart();

        this.input.keyboard!.enabled = true;
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();
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
        this.gridPhysics = new GridPhysics(this.player, this.currentTilemap);
        this.gridControls = new GridControls(this.input, this.gridPhysics);

        this.createPlayerAnimation(Direction.UP, 6, 7);
        this.createPlayerAnimation(Direction.RIGHT, 4, 5);
        this.createPlayerAnimation(Direction.DOWN, 0, 1);
        this.createPlayerAnimation(Direction.LEFT, 2, 3);

        this.cursors = this.input.keyboard!.createCursorKeys();
    }
}