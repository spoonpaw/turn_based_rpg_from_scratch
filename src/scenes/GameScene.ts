import Phaser from 'phaser';
import Player from '../classes/Player';
import GridControls from '../classes/GridControls';
import GridPhysics from '../classes/GridPhysics';
import {Direction} from '../types/Direction';
import {levels} from '../levels/Levels';
import Innkeeper from '../classes/npcs/Innkeeper';

export default class GameScene extends Phaser.Scene {
    static readonly TILE_SIZE = 48;
    public gridControls!: GridControls;
    public gridPhysics!: GridPhysics;
    public player!: Player;
    public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    public playerTileX!: number;
    public playerTileY!: number;
    public currentMap!: string;
    public activeDialogScene!: boolean;
    private currentTilemap!: Phaser.Tilemaps.Tilemap;
    private exitingCurrentLevel!: boolean;
    private nonHostileSpace!: boolean;
    public spaceDown!: boolean;

    constructor() {
        super('Game');
    }

    init() {
        this.scene.launch('UI');
    }

    create(data?) {
        this.activeDialogScene = false;

        // if data is empty then the game just started so load the player in the spawn location
        if (Object.keys(data).length === 0) {
            // create the game scene when the player initially spawns.
            // create the map
            this.currentMap = levels.overworld.name;
            this.exitingCurrentLevel = false;
            this.currentTilemap = this.make.tilemap({key: levels.overworld.tilemapKey});
            this.currentTilemap.addTilesetImage(levels.overworld.tilesetName, levels.overworld.tilesetKey);
            for (let i = 0; i < this.currentTilemap.layers.length; i++) {
                const layer = this.currentTilemap
                    .createLayer(i, levels.overworld.tilesetName, 0, 0);
                layer.setDepth(i);
            }

            // load the player sprite
            const playerSprite = this.add.sprite(0, 0, 'hero');
            playerSprite.setDepth(2);
            this.cameras.main.startFollow(playerSprite);
            this.cameras.main.roundPixels = true;
            this.player = new Player(
                playerSprite,
                new Phaser.Math.Vector2(
                    levels.overworld.spawnCoords[0].x,
                    levels.overworld.spawnCoords[0].y
                ),
                this.player?.health || 7,
                7,
                5,
                this.player?.gold || 0,
                this.player?.experience || 0
            );

            this.setupPlayerGridPhysics();

            this.sys.events.removeListener('wake');
            this.sys.events.on('wake', this.wake, this);

            this.playerTileX = this.player.getTilePos().x;
            this.playerTileY = this.player.getTilePos().y;

        }
        else {
            // spawn the character in the correct position based on data passed to the restart method
            // create the map
            this.currentMap = data.levelData.name;

            this.exitingCurrentLevel = false;

            this.currentTilemap = this.make.tilemap({key: data.levelData.tilemapKey});
            this.currentTilemap.addTilesetImage(data.levelData.tilesetName, data.levelData.tilesetKey);
            for (let i = 0; i < this.currentTilemap.layers.length; i++) {
                const layer = this.currentTilemap
                    .createLayer(i, data.levelData.tilesetName, 0, 0);
                layer.setDepth(i);
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
                this.player.health,
                this.player.maxHealth,
                this.player.damage,
                this.player.gold,
                this.player.experience
            );

            this.setupPlayerGridPhysics();

            this.sys.events.removeListener('wake');
            this.sys.events.on('wake', this.wake, this);

            // iterate over the levels npcs and implement their functions
            for (const npc of data.levelData.npcs) {

                // place npc sprites

                if (npc.name === 'innkeeper') {

                    const innKeeperSprite = this.add.sprite(0, 0, 'npc1');
                    innKeeperSprite.setDepth(2);

                    const innKeeper = new Innkeeper(
                        innKeeperSprite,
                        new Phaser.Math.Vector2(
                            npc.x,
                            npc.y
                        )
                    );

                    innKeeper.removeListener();

                    innKeeper.addListener();

                }
            }

            this.playerTileX = this.player.getTilePos().x;
            this.playerTileY = this.player.getTilePos().y;
        }
    }

    setupPlayerGridPhysics() {
        this.gridPhysics = new GridPhysics(this.player, this.currentTilemap);
        this.gridControls = new GridControls(this.input, this.gridPhysics);

        this.createPlayerAnimation(Direction.UP, 6, 7);
        this.createPlayerAnimation(Direction.RIGHT, 4, 5);
        this.createPlayerAnimation(Direction.DOWN, 0, 1);
        this.createPlayerAnimation(Direction.LEFT, 2, 3);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    wake() {
        this.input.keyboard.enabled = true;
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();
    }

    public update(_time: number, delta: number) {
        this.gridControls.update();
        this.gridPhysics.update(delta);

        let checkForAFight = false;

        // determine if the player is in hostile territory
        if (
            (this.playerTileX != this.player.getTilePos().x || this.playerTileY != this.player.getTilePos().y) &&
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
            !this.exitingCurrentLevel
        ) {
            checkForAFight = false;
            this.exitingCurrentLevel = true;
            // enter the town
            this.time.delayedCall(240, () => {
                // switch to town scene using scene restart method
                this.nonHostileSpace = true;
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
                this.time.delayedCall(210, () => {
                    this.scene.switch('Battle');
                });
            }
        }
    }

    checkForRandomEncounter(): boolean {
        const randNum = Phaser.Math.RND.between(0, 4);
        return randNum === 0;
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
}