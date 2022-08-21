import Phaser from 'phaser';
import Player from '../classes/Player';

export default class GameScene extends Phaser.Scene {
    static readonly TILE_SIZE = 48;

    constructor() {
        super('Game');

    }

    create() {
        // const player = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'female_player');
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
        const player = new Player(playerSprite, new Phaser.Math.Vector2(6, 6));
    }
}