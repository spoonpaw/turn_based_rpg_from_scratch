export default class MusicScene extends Phaser.Scene {

    public titleSong!: Phaser.Sound.BaseSound;
    public battleSong!: Phaser.Sound.BaseSound;

    constructor() {
        super('Music');
    }

    create() {
        console.log('starting the music scene');

        this.titleSong = this.sound.add('titlesong', {
            loop: true
        });

        this.battleSong = this.sound.add('battlesong', {
            loop: true
        });

        // eventsCenter.on('playMusic', (songKey: string) => {
        //     console.log(songKey);
            
        //     this.song = this.sound.add('titlesong', {
        //         loop: true
        //     });
        //     this.song.play();
        // });
    }
}