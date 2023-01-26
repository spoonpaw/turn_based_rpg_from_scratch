import UIActionButton from '../classes/UIActionButton';

export default class MusicScene extends Phaser.Scene {

    public titleSong!: Phaser.Sound.BaseSound;
    public battleSong!: Phaser.Sound.BaseSound;
    public overworldSong!: Phaser.Sound.BaseSound;
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
            volume: 0.1,
            loop: true
        });

        this.overworldSong = this.sound.add('overworldsong', {
            volume: 0.5,
            loop: true
        });

        this.battleSong = this.sound.add('battlesong', {
            volume: 0.30,
            loop: true
        });

        this.gameOverSong = this.sound.add('gameoversong', {
            volume: 0.45,
            loop: true
        });

        this.townSong = this.sound.add('townsong', {
            volume: 0.60,
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
                // music button clicked!
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
        this.currentTrack = songName;
        this.stopAllSongs();
        if (!this.muted) {
            this.playCurrentSong();
        }
    }

    public unmuteMusic() {
        // unmuting the music!!
        if (!this.muted) {
            this.playCurrentSong();
        }
    }

    public muteMusic() {
        // muting music!
        this.stopAllSongs();
    }

    private stopAllSongs() {
        this.titleSong.stop();
        this.overworldSong.stop();
        this.battleSong.stop();
        this.gameOverSong.stop();
        this.townSong.stop();
    }

    private playCurrentSong() {
        if (this.currentTrack === 'title') {
            this.titleSong.play();
        }
        else if (this.currentTrack === 'overworld') {
            this.overworldSong.play();
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
}