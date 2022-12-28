import UIActionButton from '../classes/UIActionButton';

export default class MusicScene extends Phaser.Scene {

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
        this.muteMusic();
        this.currentTrack = songName;
        if (this.muted) {
            return;
        }
        else if (this.currentTrack === 'overworld') {
            // playing the overworld track!
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

    public unmuteMusic() {
        // unmuting the music!!
        if (this.currentTrack === 'overworld') {
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

    public muteMusic() {
        // muting music!
        if (this.currentTrack === 'overworld') {
            this.overworldSong.stop();
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