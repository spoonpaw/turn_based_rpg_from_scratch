import Phaser from 'phaser';
import Player from '../classes/Player';
import GridControls from '../classes/GridControls';
import GridPhysics from '../classes/GridPhysics';
import {Direction} from '../types/Direction';
import eventsCenter from '../utils/EventsCenter';
import NPC from '../classes/NPC';

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
    private innKeeper!: NPC;
    private leavingTown!: boolean;

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

        // check if the player is leaving the town

        if ((this.playerTileX === 0  || this.playerTileY === 0 || this.playerTileX === 19  || this.playerTileY === 19) && this.inTown && !this.leavingTown) {
            this.leavingTown = true;
            // load overworld again
            this.time.delayedCall(240, () => {
                // switch to the town tilemap
                this.loadOverworld();
                this.inTown = false;
                this.enteringTown = false;
                this.leavingTown = false;
            });
        }

        // check if the player is moving into the town tile
        if (this.overworldTilemap.getTileAt(this.playerTileX, this.playerTileY, false, 1)?.properties.key === 'town' && !this.enteringTown) {
            checkForAFight = false;
            this.enteringTown = true;
            // enter the town
            this.time.delayedCall(240, () => {
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
        this.currentMap = 'town';

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
        this.player = new Player(playerSprite, new Phaser.Math.Vector2(1, 1), this.player.health, this.player.maxHealth, this.player.damage, this.player.gold, this.player.experience);

        this.gridPhysics = new GridPhysics(this.player, this.overworldTilemap);
        this.gridControls = new GridControls(this.input, this.gridPhysics);

        this.createPlayerAnimation(Direction.UP, 39, 41);
        this.createPlayerAnimation(Direction.RIGHT, 27, 29);
        this.createPlayerAnimation(Direction.DOWN, 3, 5);
        this.createPlayerAnimation(Direction.LEFT, 15, 17);

        const innKeeperSprite = this.add.sprite(0, 0, 'player');
        innKeeperSprite.setDepth(2);

        this.innKeeper = new NPC(innKeeperSprite, new Phaser.Math.Vector2(6, 2));
        // implement healing when talking to innkeeper
        this.input.keyboard.removeListener('keydown');
        this.input.keyboard.on('keydown', (event) => {
            if (this.currentMap !== 'town') {
                return;
            }
            if (event.code === 'Space') {
                // check if in town and looking at innkeeper

                if ((this.player.getTilePos().x === 5 && this.player.getTilePos().y === 2 && this.gridPhysics.facingDirection === 'right') ||
                    (this.player.getTilePos().x === 6 && this.player.getTilePos().y === 3 && this.gridPhysics.facingDirection === 'up')) {
                    // todo: give the player the option to heal or not. tell them how much it costs to heal. implement dialogue...
                    if (this.player.gold >= 3) {
                        this.player.gold -= 3;
                        this.player.health = this.player.maxHealth;

                        eventsCenter.emit('updateHP', this.player.health);
                        eventsCenter.emit('updateGold', this.player.gold);
                    }
                }
            }
        });

        this.playerTileX = this.player.getTilePos().x;
        this.playerTileY = this.player.getTilePos().y;
    }

    loadOverworld() {
        this.currentMap = 'overworld';

        const allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.Sprite);
        allSprites.forEach(x => x.destroy());

        const allTilemaps = this.children.list.filter(x => x instanceof Phaser.Tilemaps.TilemapLayer);
        allTilemaps.forEach(x => x.destroy());

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
        this.player = new Player(playerSprite, new Phaser.Math.Vector2(4, 16), this.player.health, this.player.maxHealth, this.player.damage, this.player.gold, this.player.experience);

        this.gridPhysics = new GridPhysics(this.player, this.overworldTilemap);
        this.gridControls = new GridControls(this.input, this.gridPhysics);

        this.createPlayerAnimation(Direction.UP, 39, 41);
        this.createPlayerAnimation(Direction.RIGHT, 27, 29);
        this.createPlayerAnimation(Direction.DOWN, 3, 5);
        this.createPlayerAnimation(Direction.LEFT, 15, 17);


        this.playerTileX = this.player.getTilePos().x;
        this.playerTileY = this.player.getTilePos().y;

    }
}