export default class MusicScene extends Phaser.Scene {

    public battleSong!: Phaser.Sound.BaseSound;
    public titleSong!: Phaser.Sound.BaseSound;

    constructor() {
        super('Music');
    }

    create() {
        this.titleSong = this.sound.add('titlesong', {
            loop: true
        });

        this.battleSong = this.sound.add('battlesong', {
            loop: true
        });
    }
}