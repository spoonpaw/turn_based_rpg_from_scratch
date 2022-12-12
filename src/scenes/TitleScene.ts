import TweenHelper from '../utils/TweenHelper';
import MusicScene from './MusicScene';
import Camera = Phaser.Cameras.Scene2D.Camera;

export default class TitleScene extends Phaser.Scene {
    public titleText!: Phaser.GameObjects.Text;
    private musicScene!: MusicScene;

    constructor() {
        super('Title');
    }

    create() {

        this.musicScene = <MusicScene>this.scene.get('Music');

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

            // create title text
            this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Afterlife', {
                fontSize: '128px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
                .setStroke('#000000', 2);

            this.titleText.setOrigin(0.5);

            const clickToStartText = this.add.text(this.scale.width / 2, this.scale.height * 0.65, 'Click To Start', {
                fontSize: '40px',
                color: '#fff',
                fontFamily: 'CustomFont',
            })
                .setStroke('#000000', 2);

            clickToStartText.setOrigin(0.5);
            TweenHelper.flashElement(this, clickToStartText);

            this.cameras.main.once('camerafadeincomplete', (camera: Camera) => {
                this.input.once('pointerdown', () => {
                    this.handleInput(camera);
                });
            });
        });
    }

    handleInput(camera: Camera) {
        // sets the title music

        this.musicScene.titleSong.play();

        this.input.keyboard.enabled = false;
        this.input.enabled = false;
        camera.fadeOut(1500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.startScene('Game');
        });

    }

    init() {
        this.scene.launch('Music');
    }

    startScene(targetScene: string) {
        this.scene.start(targetScene);
    }
}