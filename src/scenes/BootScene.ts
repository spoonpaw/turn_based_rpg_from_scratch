import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {

    constructor() {
        super('Boot');
    }


    preload() {
        // load images
        this.loadImages();

        // load sprite sheets
        this.loadSpriteSheets();

        //load tile maps
        this.loadTileMap();
    }

    create() {
        this.scene.start('Title');
    }

    loadImages() {
        // load images
        this.load.image('button1', 'assets/images/ui/blue_button01.png');
        this.load.image('button2', 'assets/images/ui/blue_button02.png');

        this.load.image('prefab1', 'assets/images/ui/prefab1.png');
        this.load.image('prefab2', 'assets/images/ui/prefab2.png');

        this.load.image('pic', 'assets/images/baal-loader.png');
        this.load.image('pic2', 'assets/images/atari-fujilogo.png');
        this.load.image('title', 'assets/images/afterlife-title-screen.png');

        this.load.image('tiles', 'assets/images/basictiles.png');
        this.load.image('heart', 'assets/images/heart.png');

        this.load.image('dragonblue', 'assets/images/dragonblue.png');
        this.load.image('dragonorange', 'assets/images/dragonorange.png');
    }

    loadSpriteSheets() {
        // load sprite sheets
        this.load.spritesheet('female_player', 'assets/images/characters/female_sprite.png', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('player', 'assets/images/characters/characters_big.png', {
            frameWidth: 48,
            frameHeight: 48
        });
    }

    loadTileMap() {
        // load tile maps
        this.load.tilemapTiledJSON('overworld-map', 'assets/tilemaps/afterlife.json');
    }
}