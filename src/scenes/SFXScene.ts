import UIActionButton from '../classes/UIActionButton';

export default class SFXScene extends Phaser.Scene {
    public attackSound!: Phaser.Sound.BaseSound;
    public criticalAttackSound!: Phaser.Sound.BaseSound;
    public potionSound!: Phaser.Sound.BaseSound;
    public muted = false;
    private sfxMuteButton!: UIActionButton;
    private selectSound!: Phaser.Sound.BaseSound;
    private deselectSound!: Phaser.Sound.BaseSound;

    public constructor() {
        super('SFX');
    }

    public create() {
        this.attackSound = this.sound.add('attack');
        this.criticalAttackSound = this.sound.add('criticalattack');
        this.potionSound = this.sound.add('potion');
        this.selectSound = this.sound.add('select');
        this.deselectSound = this.sound.add('deselect');

        this.sfxMuteButton = new UIActionButton(
            this,
            848,
            21,
            'sfxbutton',
            'sfxinactivebutton',
            '',
            () => {
                console.log('sfx button clicked');
                if (!this.muted) {
                    this.muted = true;
                    this.sfxMuteButton.select();
                    this.muteSFX();
                }
                else {
                    this.muted = false;
                    this.sfxMuteButton.deselect();
                }
            }
        );
    }

    public muteSFX() {
        if (this.attackSound.isPlaying) this.attackSound.stop();
        if (this.criticalAttackSound.isPlaying) this.criticalAttackSound.stop();
        if (this.potionSound.isPlaying) this.potionSound.stop();
        if (this.selectSound.isPlaying) this.selectSound.stop();
        if (this.deselectSound.isPlaying) this.deselectSound.stop();
    }

    public playSound(sound: string) {
        if (!this.muted) {
            switch (sound) {
            case 'potion':
                this.potionSound.play();
                break;
            case 'attack':
                this.attackSound.play();
                break;
            case 'criticalattack':
                this.criticalAttackSound.play();
                break;
            case 'select':
                this.selectSound.play();
                break;
            case 'deselect':
                this.deselectSound.play();
                break;
            }
        }
    }
}