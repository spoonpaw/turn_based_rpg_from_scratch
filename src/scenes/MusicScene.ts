import UIActionButton from '../classes/UIActionButton';

export default class MusicScene extends Phaser.Scene {

    public battleSong!: Phaser.Sound.BaseSound;
    public titleSong!: Phaser.Sound.BaseSound;
    public gameOverSong!: Phaser.Sound.BaseSound;
    public townSong!: Phaser.Sound.BaseSound;
    public muted = false;
    public musicMuteButton!: UIActionButton;
    public currentTrack!: string;

    public constructor() {
        super('Music');
    }

    public create() {
        this.titleSong = this.sound.add('titlesong', {
            volume: 0.5,
            loop: true
        });

        this.battleSong = this.sound.add('battlesong', {
            volume: 0.5,
            loop: true
        });

        this.gameOverSong = this.sound.add('gameoversong', {
            volume: 0.5,
            loop: true
        });

        this.townSong = this.sound.add('townsong', {
            volume: 0.80,
            loop: true
        });

        this.musicMuteButton = new UIActionButton(
            this,
            890,
            21,
            'musicbutton',
            'musicinactivebutton',
            '',
            () => {
                console.log('music button clicked!');
                if (!this.muted) {
                    this.muted = true;
                    this.musicMuteButton.select();
                    this.muteMusic();
                }
                else {
                    this.muted = false;
                    this.musicMuteButton.deselect();
                    this.unmuteMusic();
                }
            }
        );
    }

    public changeSong(songName: string) {
        this.muteMusic();
        console.log('changing the song!');
        console.log({muted: this.muted});
        this.currentTrack = songName;
        console.log({currentTrack: this.currentTrack});
        if (this.muted) {
            return;
        }
        else if (this.currentTrack === 'title') {
            console.log('playing the title track!');
            console.log({titleSong: this.titleSong});
            this.titleSong.play();
        }
        else if (this.currentTrack === 'battle') {
            this.battleSong.play();
        }
        else if (this.currentTrack === 'gameover') {
            this.gameOverSong.play();
        }
        else if (this.currentTrack === 'town') {
            this.townSong.play();
        }
    }

    public unmuteMusic() {
        console.log('unmuting the music!!');
        if (this.currentTrack === 'title') {
            this.titleSong.play();
        }
        else if (this.currentTrack === 'battle') {
            this.battleSong.play();
        }
        else if (this.currentTrack === 'gameover') {
            this.gameOverSong.play();
        }
        else if (this.currentTrack === 'town') {
            this.townSong.play();
        }
    }

    public muteMusic() {
        console.log('muting music!');
        console.log({currentTrack: this.currentTrack});
        if (this.currentTrack === 'title') {
            this.titleSong.stop();
        }
        else if (this.currentTrack === 'battle') {
            this.battleSong.stop();
        }
        else if (this.currentTrack === 'gameover') {
            this.gameOverSong.stop();
        }
        else if (this.currentTrack === 'town') {
            this.townSong.stop();
        }
    }
}