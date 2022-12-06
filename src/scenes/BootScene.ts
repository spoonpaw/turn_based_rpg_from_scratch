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

        // load tile maps
        this.loadTileMap();

        // load audio files
        this.loadAudio();
    }

    create() {
        this.scene.start('Title');
    }

    loadImages() {
        // load images
        this.load.image('button', 'assets/images/ui/button.png');
        this.load.image('button2', 'assets/images/ui/button2.png');
        this.load.image('buttonhover', 'assets/images/ui/buttonHover.png');
        this.load.image('button2hover', 'assets/images/ui/button2Hover.png');

        this.load.image('bagbutton', 'assets/images/ui/bagButton.png');
        this.load.image('bagbuttonactive', 'assets/images/ui/bagButtonActive.png');
        this.load.image('attackbutton', 'assets/images/ui/attackButton.png');
        this.load.image('attackbuttonactive', 'assets/images/ui/attackButtonActive.png');
        this.load.image('bookbutton', 'assets/images/ui/bookButton.png');
        this.load.image('bookbuttonactive', 'assets/images/ui/bookButtonActive.png');
        this.load.image('runbutton', 'assets/images/ui/runButton.png');
        this.load.image('runbuttonactive', 'assets/images/ui/runButtonActive.png');
        this.load.image('cancelbutton', 'assets/images/ui/cancelButton.png');
        this.load.image('pagebutton', 'assets/images/ui/pageButton.png');
        this.load.image('pagebuttonactive', 'assets/images/ui/pageButtonActive.png');
        this.load.image('checkbutton', 'assets/images/ui/checkButton.png');
        this.load.image('crossbutton', 'assets/images/ui/crossButton.png');
        this.load.image('facebutton', 'assets/images/ui/faceButton.png');
        this.load.image('facebuttonactive', 'assets/images/ui/faceButtonActive.png');

        this.load.image('healthpotion', 'assets/images/ui/healthPotion.png');
        this.load.image('healthpotionactive', 'assets/images/ui/healthPotionActive.png');

        this.load.image('badge1', 'assets/images/ui/badge1.png');
        this.load.image('badge2', 'assets/images/ui/badge2.png');
        this.load.image('badge3', 'assets/images/ui/badge3.png');
        this.load.image('badge4', 'assets/images/ui/badge4.png');
        this.load.image('badge5', 'assets/images/ui/badge5.png');
        this.load.image('badge6', 'assets/images/ui/badge6.png');
        this.load.image('badge7', 'assets/images/ui/badge7.png');
        this.load.image('badge8', 'assets/images/ui/badge8.png');
        this.load.image('badge9', 'assets/images/ui/badge9.png');
        this.load.image('badge0', 'assets/images/ui/badge0.png');
        this.load.image('badgeminus', 'assets/images/ui/badgeMinus.png');
        this.load.image('badgeequals', 'assets/images/ui/badgeEquals.png');

        this.load.image('prefab1', 'assets/images/ui/prefab1.png');
        this.load.image('prefab2', 'assets/images/ui/prefab2.png');
        this.load.image('prefab3', 'assets/images/ui/prefab3.png');
        this.load.image('prefab4', 'assets/images/ui/prefab4.png');
        this.load.image('prefab5', 'assets/images/ui/prefab5.png');

        this.load.image('leftsidedialogframe', 'assets/images/ui/leftSideDialogFrame.png');
        this.load.image('rightsidedialogoptionsframe', 'assets/images/ui/rightSideDialogOptionsFrame.png');

        this.load.image('gameActionMenuFrame', 'assets/images/ui/gameActionMenuFrame.png');

        this.load.image('gameActionMenuCharacterButton', 'assets/images/ui/characterButton.png');
        this.load.image('gameActionMenuCharacterButtonActive', 'assets/images/ui/characterButtonActive.png');

        this.load.image('actionMenuFrame', 'assets/images/ui/actionMenuFrame.png');
        this.load.image('heroMenuFrame', 'assets/images/ui/heroMenuFrame.png');
        this.load.image('messageMenuFrame', 'assets/images/ui/messageMenuFrame.png');
        this.load.image('commandMenuFrame', 'assets/images/ui/commandMenuFrame.png');
        this.load.image('hotkeyMenuFrame', 'assets/images/ui/hotkeyMenuFrame.png');
        this.load.image('confirmMenuFrame', 'assets/images/ui/confirmMenuFrame.png');
        this.load.image('cancelMenuFrame', 'assets/images/ui/cancelMenuFrame.png');
        this.load.image('inventoryAndAbilityMenuFrame', 'assets/images/ui/inventoryAndAbilityMenuFrame.png');
        this.load.image('subInventoryAndAbilityMenuFrame', 'assets/images/ui/subInventoryAndAbilityMenuFrame.png');
        this.load.image('inventoryAndAbilityDetailFrame', 'assets/images/ui/inventoryAndAbilityDetailFrame.png');
        this.load.image('confirmSelectedAbilityOrItemFrame', 'assets/images/ui/confirmSelectedAbilityOrItemFrame.png');
        this.load.image('confirmSelectedAbilityOrItemFrameB', 'assets/images/ui/confirmSelectedAbilityOrItemFrameB.png');

        this.load.image('pic', 'assets/images/baal-loader.png');
        this.load.image('pic2', 'assets/images/atari-fujilogo.png');
        this.load.image('title', 'assets/images/afterlife-title-screen4.png');

        this.load.image('tiles', 'assets/images/basictiles2.png');
        this.load.image('heart', 'assets/images/heart.png');

        this.load.image('dragonblue', 'assets/images/dragonblue.png');
        this.load.image('dragonorange', 'assets/images/dragonorange.png');
        this.load.image('cyberfly', 'assets/images/cyberFly3.png');
        this.load.image('deadlyflower', 'assets/images/deadlyFlower.png');
        this.load.image('sentientrock', 'assets/images/sentientRock.png');
        this.load.image('seedspiker', 'assets/images/seedSpiker.png');

        this.load.image('sword', 'assets/images/icons/sword.png');
        this.load.image('coin', 'assets/images/icons/coin.png');
        this.load.image('mana', 'assets/images/icons/mana.png');

        this.load.image('overworldbackground', 'assets/images/overworldCombatBackground2.png');
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
        this.load.spritesheet('hero', 'assets/images/characters/newHeroSpritesheet.png', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('npc1', 'assets/images/characters/npc1.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet('npc2', 'assets/images/characters/npc2.png', {
            frameWidth: 48,
            frameHeight: 48
        });
    }

    loadTileMap() {
        // load tile maps
        this.load.tilemapTiledJSON('overworld-map', 'assets/tilemaps/afterlife.json');
        this.load.tilemapTiledJSON('town-map', 'assets/tilemaps/town3.json');
    }

    loadAudio() {
        // load mp3s
        this.load.audio('battlesong', 'assets/sounds/songs/embattledPredistortion.mp3');
        this.load.audio('titlesong', 'assets/sounds/songs/ennui.mp3');
    }
}