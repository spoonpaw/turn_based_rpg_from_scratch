import Phaser from 'phaser';
import Player from '../classes/Player';
import GridControls from '../classes/GridControls';
import GridPhysics from '../classes/GridPhysics';
import {Direction} from '../types/Direction';
import eventsCenter from '../utils/EventsCenter';

export default class GameScene extends Phaser.Scene {
    static readonly TILE_SIZE = 48;
    private gridControls!: GridControls;
    private gridPhysics!: GridPhysics;
    public player!: Player;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    public playerTileX!: number;
    public playerTileY!: number;
    private overworldTilemap!: Phaser.Tilemaps.Tilemap;
    private enteringTown!: boolean;
    private currentMap!: string;
    private inTown!: boolean;

    constructor() {
        super('Game');
    }

    init() {
        this.scene.launch('UI');
    }

    create() {
        // create the map
        this.currentMap = 'overworld';
        this.enteringTown = false;
        this.overworldTilemap = this.make.tilemap({key: 'overworld-map'});
        this.overworldTilemap.addTilesetImage('Basic Tiles', 'tiles');
        for (let i = 0; i < this.overworldTilemap.layers.length; i++) {
            const layer = this.overworldTilemap
                .createLayer(i, 'Basic Tiles', 0, 0);
            layer.setDepth(i);
        }

        const playerSprite = this.add.sprite(0, 0, 'player');
        playerSprite.setDepth(2);
        this.cameras.main.startFollow(playerSprite);
        this.cameras.main.roundPixels = true;
        this.player = new Player(playerSprite, new Phaser.Math.Vector2(4, 16), 7, 7, 5, 0, 0);

        this.gridPhysics = new GridPhysics(this.player, this.overworldTilemap);
        this.gridControls = new GridControls(this.input, this.gridPhysics);

        this.createPlayerAnimation(Direction.UP, 39, 41);
        this.createPlayerAnimation(Direction.RIGHT, 27, 29);
        this.createPlayerAnimation(Direction.DOWN, 3, 5);
        this.createPlayerAnimation(Direction.LEFT, 15, 17);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.sys.events.on('wake', this.wake, this);

        this.playerTileX = this.player.getTilePos().x;
        this.playerTileY = this.player.getTilePos().y;

        // console.log('here are all the current children (end of create method):');
        // console.log(this.children.list);
    }

    wake() {
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();
    }

    public update(_time: number, delta: number) {
        this.gridControls.update();
        this.gridPhysics.update(delta);

        let checkForAFight = false;

        if ((this.playerTileX != this.player.getTilePos().x || this.playerTileY != this.player.getTilePos().y) && !this.enteringTown) {
            checkForAFight = true;
        }

        this.playerTileX = this.player.getTilePos().x;
        this.playerTileY = this.player.getTilePos().y;

        // check if the player is moving into the town tile
        if (this.overworldTilemap.getTileAt(this.playerTileX, this.playerTileY, false, 1)?.properties.key === 'town' && !this.enteringTown) {
            checkForAFight = false;
            this.enteringTown = true;
            // enter the town
            this.time.delayedCall(240, () => {
                this.currentMap = 'town';
                // switch to the town tilemap
                this.loadTown();
                this.inTown = true;

            });
        }

        if (checkForAFight && !this.inTown) {
            // randomly determine if fight will occur
            if (this.checkForRandomEncounter()) {
                // start combat
                this.time.delayedCall(240, () => {
                    this.scene.switch('Battle');
                });
            }
        }
    }

    checkForRandomEncounter(): boolean {
        const randNum = Phaser.Math.RND.between(0, 16);
        return randNum === 0;
    }

    private createPlayerAnimation(
        name: string,
        startFrame: number,
        endFrame: number
    ) {
        this.anims.create({
            key: name,
            frames: this.anims.generateFrameNumbers('player', {
                start: startFrame,
                end: endFrame,
            }),
            frameRate: 10,
            repeat: -1,
            yoyo: true,
        });
    }

    resetGameScene() {

        const health = this.player.health;
        const maxHealth = this.player.maxHealth;
        const damage = this.player.damage;
        const gold = this.player.gold;
        const experience = this.player.experience;

        const allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.Sprite);
        allSprites.forEach(x => x.destroy());

        const allTilemaps = this.children.list.filter(x => x instanceof Phaser.Tilemaps.TilemapLayer);
        allTilemaps.forEach(x => x.destroy());

        this.create();
        this.player.health = health;
        this.player.maxHealth = maxHealth;
        this.player.damage = damage;
        this.player.gold = gold;
        this.player.experience = experience;

        eventsCenter.emit('updateHP', this.player.health);
        eventsCenter.emit('updateGold', this.player.gold);
        eventsCenter.emit('updateXP', this.player.experience);
    }

    loadTown() {

        const allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.Sprite);
        allSprites.forEach(x => x.destroy());

        const allTilemaps = this.children.list.filter(x => x instanceof Phaser.Tilemaps.TilemapLayer);
        allTilemaps.forEach(x => x.destroy());

        this.overworldTilemap = this.make.tilemap({key: 'town-map'});
        this.overworldTilemap.addTilesetImage('Basic Tiles', 'tiles');
        for (let i = 0; i < this.overworldTilemap.layers.length; i++) {
            const layer = this.overworldTilemap
                .createLayer(i, 'Basic Tiles', 0, 0);
            layer.setDepth(i);
        }

        const playerSprite = this.add.sprite(0, 0, 'player');
        playerSprite.setDepth(2);
        this.cameras.main.startFollow(playerSprite);
        this.cameras.main.roundPixels = true;
        this.player = new Player(playerSprite, new Phaser.Math.Vector2(0, 0), this.player.health, this.player.maxHealth, this.player.damage, this.player.gold, this.player.experience);

        this.gridPhysics = new GridPhysics(this.player, this.overworldTilemap);
        this.gridControls = new GridControls(this.input, this.gridPhysics);

        this.createPlayerAnimation(Direction.UP, 39, 41);
        this.createPlayerAnimation(Direction.RIGHT, 27, 29);
        this.createPlayerAnimation(Direction.DOWN, 3, 5);
        this.createPlayerAnimation(Direction.LEFT, 15, 17);


        this.playerTileX = this.player.getTilePos().x;
        this.playerTileY = this.player.getTilePos().y;

        this.wake();

    }
}