import Phaser from 'phaser';
import Player from '../classes/Player';
import GridControls from '../classes/GridControls';
import GridPhysics from '../classes/GridPhysics';
import {Direction} from '../types/Direction';

export default class GameScene extends Phaser.Scene {
    static readonly TILE_SIZE = 48;
    private gridControls!: GridControls;
    private gridPhysics!: GridPhysics;
    player!: Player;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    playerTileX!: number;
    playerTileY!: number;

    constructor() {
        super('Game');

    }

    init() {
        this.scene.launch('UI');
    }

    create() {
        // create the map
        const overworldTilemap = this.make.tilemap({key: 'overworld-map'});
        overworldTilemap.addTilesetImage('Basic Tiles', 'tiles');
        for (let i = 0; i < overworldTilemap.layers.length; i++) {
            const layer = overworldTilemap
                .createLayer(i, 'Basic Tiles', 0, 0);
            layer.setDepth(i);
        }

        const playerSprite = this.add.sprite(0, 0, 'player');
        playerSprite.setDepth(2);
        this.cameras.main.startFollow(playerSprite);
        this.cameras.main.roundPixels = true;
        this.player = new Player(playerSprite, new Phaser.Math.Vector2(6, 6), 100, 100, 20);

        this.gridPhysics = new GridPhysics(this.player, overworldTilemap);
        this.gridControls = new GridControls(this.input, this.gridPhysics);

        this.createPlayerAnimation(Direction.UP, 39, 41);
        this.createPlayerAnimation(Direction.RIGHT, 27, 29);
        this.createPlayerAnimation(Direction.DOWN, 3, 5);
        this.createPlayerAnimation(Direction.LEFT, 15, 17);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.sys.events.on('wake', this.wake, this);
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
        if (this.playerTileX != this.player.getTilePos().x) {
            this.playerTileX = this.player.getTilePos().x;

            // randomly determine if fight will occur
            if (this.checkForRandomEncounter()) {

                // start combat
                this.scene.switch('Battle');
            }
        }

        if (this.playerTileY != this.player.getTilePos().y) {
            this.playerTileY = this.player.getTilePos().y;

            // randomly determine if fight will occur
            if (this.checkForRandomEncounter()) {
                // start combat
                this.scene.switch('Battle');
            }
        }
    }

    checkForRandomEncounter(): boolean {
        const randNum = Phaser.Math.RND.between(0, 8);
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
}