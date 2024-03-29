import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    private gameConfig: any;
    public constructor() {
        super('Boot');
    }

    private getPlayerMaxExperience() {
        let i = 1;
        let level = this.getPlayerLevelFromExperience(i);

        while (level < this.gameConfig.MAX_UNIT_LEVEL) {
            i++;
            level = this.getPlayerLevelFromExperience(i);
        }
        return i;
    }

    private getBotMaxExperience() {
        let i = 1;
        let level = this.getBotLevelFromExperience(i);

        while (level < this.gameConfig.MAX_UNIT_LEVEL) {
            i++;
            level = this.getPlayerLevelFromExperience(i);
        }
        return i;
    }

    public getPlayerLevelFromExperience(experienceAmount: number) {
        let level = this.gameConfig.PLAYER_LEVELING_RATE * Math.sqrt(experienceAmount);
        level = Math.ceil(level);
        level = Math.max(1, level);
        level = Math.min(this.gameConfig.MAX_UNIT_LEVEL, level);
        return level;
    }

    public getBotLevelFromExperience(experienceAmount: number) {
        return Math.min(
            this.gameConfig.MAX_UNIT_LEVEL,
            Math.max(
                1,
                Math.ceil(
                    this.gameConfig.BOT_LEVELING_RATE * Math.sqrt(
                        experienceAmount
                    )
                )
            )
        );
    }

    public init() {

        this.gameConfig = this.game.config;

        this.gameConfig.MAX_UNIT_LEVEL = 5;
        this.gameConfig.PLAYER_LEVELING_RATE = 0.3;
        this.gameConfig.BOT_LEVELING_RATE = 0.4;

        this.gameConfig.PLAYER_MAX_EXPERIENCE = this.getPlayerMaxExperience();
        this.gameConfig.BOT_MAX_EXPERIENCE = this.getBotMaxExperience();
        this.scene.launch('SaveAndLoad');
    }

    public create() {
        this.scene.start('Title');
    }

    public preload() {

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBox = this.add.graphics();
        const progressBar = this.add.graphics();
        progressBox.fillStyle(0x222222, 1);
        progressBox.fillRect((width / 2) - 160, 270, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: 'Loading...',
            style: {
                font: '50px CustomFont',
                color: '#ffffff'
            },
        });
        loadingText.setOrigin(0.5, 0.5);
        loadingText.setResolution(3);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 + 35,
            text: '0%',
            style: {
                font: '33px CustomFont',
                color: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        percentText.setResolution(3);

        this.load.on('progress', function (value: number) {
            percentText.setText(parseInt(String(value * 100)) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xDB4161, 1);
            progressBar.fillRect((width / 2) - 150, 280, 300 * value, 30);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // load images
        this.loadImages();

        // load sprite sheets
        this.loadSpriteSheets();

        // load tile maps
        this.loadTileMap();

        // load audio files
        this.loadAudio();
    }

    private loadAudio() {
        // load music mp3s
        this.load.audio('titlesong', 'assets/sounds/songs/zeroLeaf.mp3');
        this.load.audio('battlesong', 'assets/sounds/songs/dontBeAshamed.mp3');
        this.load.audio('overworldsong', 'assets/sounds/songs/ennui.mp3');
        this.load.audio('gameoversong', 'assets/sounds/songs/theGreatGreen.mp3');
        this.load.audio('townsong', 'assets/sounds/songs/loveAndSolitude.mp3');

        // load sfx mp3s
        this.load.audio('attack', 'assets/sounds/fx/attack.mp3');
        this.load.audio('criticalattack', 'assets/sounds/fx/criticalAttack.mp3');
        this.load.audio('potion', 'assets/sounds/fx/potion.mp3');
        this.load.audio('select', 'assets/sounds/fx/select.mp3');
        this.load.audio('deselect', 'assets/sounds/fx/deselect.mp3');
        this.load.audio('runaway', 'assets/sounds/fx/runAway.mp3');
        this.load.audio('dodge', 'assets/sounds/fx/dodge.mp3');
    }

    private loadImages() {
        // load images
        this.load.image('button', 'assets/images/ui/button.png');
        this.load.image('button2', 'assets/images/ui/button2.png');
        this.load.image('buttonhover', 'assets/images/ui/buttonHover.png');
        this.load.image('button2hover', 'assets/images/ui/button2Hover.png');

        this.load.image('armorbutton', 'assets/images/ui/armorButton.png');
        this.load.image('armorbuttonactive', 'assets/images/ui/armorButtonActive.png');
        this.load.image('attackbutton', 'assets/images/ui/attackButton3.png');
        this.load.image('attackbuttonactive', 'assets/images/ui/attackButtonActive3.png');
        this.load.image('bagbutton', 'assets/images/ui/bagButton.png');
        this.load.image('bagbuttonactive', 'assets/images/ui/bagButtonActive.png');
        this.load.image('bookbutton', 'assets/images/ui/bookButton.png');
        this.load.image('bookbuttonactive', 'assets/images/ui/bookButtonActive.png');
        this.load.image('cancelbutton', 'assets/images/ui/cancelButton.png');
        this.load.image('checkbutton', 'assets/images/ui/checkButton.png');
        this.load.image('coinbutton', 'assets/images/ui/coinButton2.png');
        this.load.image('coinbuttonactive', 'assets/images/ui/coinButtonActive2.png');
        this.load.image('crossbutton', 'assets/images/ui/crossButton.png');
        this.load.image('facebutton', 'assets/images/ui/faceButton.png');
        this.load.image('facebuttonactive', 'assets/images/ui/faceButtonActive.png');
        this.load.image('musicbutton', 'assets/images/ui/musicButton.png');
        this.load.image('musicinactivebutton', 'assets/images/ui/musicInactiveButton.png');
        this.load.image('pagebutton', 'assets/images/ui/pageButton.png');
        this.load.image('pagebuttonactive', 'assets/images/ui/pageButtonActive.png');
        this.load.image('runbutton', 'assets/images/ui/runButton.png');
        this.load.image('runbuttonactive', 'assets/images/ui/runButtonActive.png');
        this.load.image('sfxbutton', 'assets/images/ui/sfxButton.png');
        this.load.image('sfxinactivebutton', 'assets/images/ui/sfxInactiveButton.png');
        this.load.image('staffbutton', 'assets/images/ui/staffButton.png');
        this.load.image('staffbuttonactive', 'assets/images/ui/staffButtonActive.png');
        this.load.image('shieldbutton', 'assets/images/ui/shieldButton.png');
        this.load.image('shieldbuttonactive', 'assets/images/ui/shieldButtonActive.png');
        this.load.image('powerstrikebutton', 'assets/images/ui/powerStrikeButton.png');
        this.load.image('powerstrikebuttonactive', 'assets/images/ui/powerStrikeButtonActive.png');
        this.load.image('shieldbutton1', 'assets/images/ui/shieldButton1.png');
        this.load.image('shieldbuttonactive1', 'assets/images/ui/shieldButtonActive1.png');
        this.load.image('monoclebutton', 'assets/images/ui/monocleButton.png');
        this.load.image('monoclebuttonactive', 'assets/images/ui/monocleButtonActive.png');
        this.load.image('armbandbutton', 'assets/images/ui/armbandButton.png');
        this.load.image('armbandbuttonactive', 'assets/images/ui/armbandButtonActive.png');

        this.load.image('chromaticsword', 'assets/images/ui/chromaticSword.png');
        this.load.image('chromaticswordactive', 'assets/images/ui/chromaticSwordActive.png');
        this.load.image('scrapcloak', 'assets/images/ui/scrapCloak.png');
        this.load.image('scrapcloakactive', 'assets/images/ui/scrapCloakActive.png');
        this.load.image('synthjutetunic', 'assets/images/ui/synthjuteTunic.png');
        this.load.image('synthjutetunicactive', 'assets/images/ui/synthjuteTunicActive.png');

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

        this.load.image('gameActionMenuCharacterButton', 'assets/images/ui/characterButton.png');
        this.load.image('gameActionMenuCharacterButtonActive', 'assets/images/ui/characterButtonActive.png');
        this.load.image('gameActionMenuRedBotButton', 'assets/images/ui/redBotButton.png');
        this.load.image('gameActionMenuRedBotButtonActive', 'assets/images/ui/redBotButtonActive.png');

        this.load.image('sidedialogframe', 'assets/images/ui/leftSideDialogFrame.png');
        this.load.image('sideoptionsframe', 'assets/images/ui/rightSideDialogOptionsFrame.png');
        this.load.image('gameActionMenuFrame', 'assets/images/ui/gameActionMenuFrame.png');
        this.load.image('actionMenuFrame', 'assets/images/ui/actionMenuFrame.png');
        this.load.image('goldFrame', 'assets/images/ui/goldFrame.png');
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
        this.load.image('characterDetailDisplayFrame', 'assets/images/ui/characterDetailDisplayFrame.png');
        this.load.image('keyboardInputFrame', 'assets/images/ui/keyboardInputFrame.png');
        this.load.image('newGameOrLoadFrame', 'assets/images/ui/newGameOrLoadFrame.png');
        this.load.image('floralFrame', 'assets/images/ui/floralFrame2.png');

        this.load.image('pic', 'assets/images/baal-loader.png');
        this.load.image('pic2', 'assets/images/atari-fujilogo.png');
        this.load.image('title', 'assets/images/afterlife-title-screen4.png');
        this.load.image('gameover', 'assets/images/game_over_screen.png');

        this.load.image('tiles', 'assets/images/basictiles4.png');
        this.load.image('heart', 'assets/images/heart2.png');

        this.load.image('dragonblue', 'assets/images/dragonblue.png');
        this.load.image('dragonorange', 'assets/images/dragonorange.png');
        this.load.image('cyberfly', 'assets/images/cyberFly3.png');
        this.load.image('deadlyflower', 'assets/images/deadlyFlower.png');
        this.load.image('sentientrock', 'assets/images/sentientRock.png');
        this.load.image('seedspiker', 'assets/images/seedSpiker.png');

        this.load.image('sword', 'assets/images/icons/sword.png');
        this.load.image('coin', 'assets/images/icons/coin.png');
        this.load.image('mana', 'assets/images/icons/mana2.png');

        this.load.image('overworldbackground', 'assets/images/overworldCombatBackground2.png');
    }

    private loadSpriteSheets() {
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
        this.load.spritesheet('redbot', 'assets/images/characters/redBot.png', {
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

        this.load.spritesheet('npc3', 'assets/images/characters/npc3.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet('npc4', 'assets/images/characters/npc4.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.spritesheet('npc5', 'assets/images/characters/npc5.png', {
            frameWidth: 48,
            frameHeight: 48
        });
    }

    private loadTileMap() {
        // load tile maps
        this.load.tilemapTiledJSON('overworld-map', 'assets/tilemaps/afterlife.json');
        this.load.tilemapTiledJSON('town-map', 'assets/tilemaps/town4.json');
    }
}