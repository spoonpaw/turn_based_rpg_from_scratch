import eventsCenter from '../utils/EventsCenter';
import MusicScene from './MusicScene';
import SFXScene from './SFXScene';
import TitleStoryScene from './TitleStoryScene';
import Camera = Phaser.Cameras.Scene2D.Camera;

export default class TitleScene extends Phaser.Scene {
    public titleText!: Phaser.GameObjects.Text;
    private musicScene!: MusicScene;
    private sfxScene!: SFXScene;
    private titleStoryScene!: TitleStoryScene;

    public constructor() {
        super('Title');
    }

    public create() {

        this.musicScene = <MusicScene>this.scene.get('Music');
        this.sfxScene = <SFXScene>this.scene.get('SFX');
        this.musicScene.scene.bringToTop();
        this.sfxScene.scene.bringToTop();

        const phaserImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'pic');
        phaserImage.displayHeight = this.sys.canvas.height;
        phaserImage.displayWidth = this.sys.canvas.width;

        this.cameras.main.once('camerafadeincomplete', (camera: Camera) => {
            camera.fadeOut(1500);
        });
        this.cameras.main.fadeIn(1500);

        this.cameras.main.once('camerafadeoutcomplete', (camera: Camera) => {
            phaserImage.destroy();

            const titleImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'title');
            titleImage.displayHeight = this.sys.canvas.height;
            titleImage.displayWidth = this.sys.canvas.width;

            camera.fadeIn(1500);
            this.scene.launch('TitleStory');
            this.titleStoryScene = <TitleStoryScene>this.scene.get('TitleStory');

            const clickToStartText = this.add.text(this.scale.width / 2, this.scale.height * 0.65, 'Click To Start', {
                fontSize: '40px',
                color: '#fff',
                fontFamily: 'CustomFont',
            })
                .setStroke('#000000', 2);

            clickToStartText.setOrigin(0.5);
            this.scene.scene.tweens.add({
                targets: clickToStartText,
                duration: 1500,
                repeat: -1,
                loop: true,
                alpha: 0,
                yoyo: true
            });

            this.cameras.main.once('camerafadeincomplete', (camera: Camera) => {
                this.input.once('pointerdown', () => {
                    this.handleInput(camera);
                });
            });
        });
    }

    public handleInput(camera: Camera) {
        // sets the overworld music
        this.musicScene.changeSong('title');

        this.titleStoryScene.slideUpTitle = true;

        this.input.keyboard!.enabled = false;
        this.input.enabled = false;
        camera.fadeOut(1500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            eventsCenter.emit('gamestart');
            this.scene.stop();
        });

    }

    public init() {
        this.scene.launch('Music');
        this.scene.launch('SFX');
    }
}