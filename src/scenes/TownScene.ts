import Phaser from 'phaser';
import Player from '../classes/Player';
import GridControls from '../classes/GridControls';
import GridPhysics from '../classes/GridPhysics';
import {Direction} from '../types/Direction';

export default class TownScene extends Phaser.Scene {
    static readonly TILE_SIZE = 48;
    private gridControls!: GridControls;
    private gridPhysics!: GridPhysics;
    public player!: Player;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    public playerTileX!: number;
    public playerTileY!: number;
    private townTilemap!: Phaser.Tilemaps.Tilemap;
    private enteringTown!: boolean;

    constructor() {
        super('Town');

    }

    init() {
        this.scene.launch('UI');
    }

    create() {
        // create the map
        this.townTilemap = this.make.tilemap({key: 'town-map'});
        this.townTilemap.addTilesetImage('Basic Tiles', 'tiles');
        for (let i = 0; i < this.townTilemap.layers.length; i++) {
            const layer = this.townTilemap
                .createLayer(i, 'Basic Tiles', 0, 0);
            layer.setDepth(i);
        }

        const playerSprite = this.add.sprite(0, 0, 'player');
        playerSprite.setDepth(2);
        this.cameras.main.startFollow(playerSprite);
        this.cameras.main.roundPixels = true;
        this.player = new Player(playerSprite, new Phaser.Math.Vector2(6, 6), 20, 20, 50, 0, 0);

        this.gridPhysics = new GridPhysics(this.player, this.townTilemap);
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

        // TODO: check if the player is moving into the town tile
        // if (this.townTilemap.getTileAt(this.playerTileX, this.playerTileY, false, 1).properties.key === 'town' && !this.enteringTown) {
        //     console.log('player is in the town!!!!');
        //     this.enteringTown = true;
        //     // enter the town
        //     this.time.delayedCall(240, () => {
        //         this.scene.switch('Town');
        //     });
        // }
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
}