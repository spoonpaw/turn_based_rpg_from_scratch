import Phaser from 'phaser';
import TweenHelper from '../utils/TweenHelper';

export default class TitleScene extends Phaser.Scene {
    public titleText!: Phaser.GameObjects.Text;

    constructor() {
        super('Title');
    }

    create() {

        const phaserImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'pic');
        phaserImage.displayHeight = this.sys.canvas.height;
        phaserImage.displayWidth = this.sys.canvas.width;

        this.cameras.main.once('camerafadeincomplete', (camera) => {
            camera.fadeOut(1500);
        });
        this.cameras.main.fadeIn(1500);

        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
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
            });
            this.titleText.setOrigin(0.5);

            const pressAnyKeyText = this.add.text(this.scale.width / 2, this.scale.height * 0.65, 'Press Any Key', {
                fontSize: '40px',
                color: '#fff',
                fontFamily: 'CustomFont',

            });
            pressAnyKeyText.setOrigin(0.5);
            TweenHelper.flashElement(this, pressAnyKeyText);

            this.cameras.main.once('camerafadeincomplete', (camera) => {
                this.input.keyboard.once('keydown', () => {
                    this.input.keyboard.enabled = false;
                    this.input.enabled = false;
                    camera.fadeOut(1500);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.startScene('Game');
                    });
                });
                this.input.once('pointerdown', () => {
                    this.input.keyboard.enabled = false;
                    this.input.enabled = false;
                    camera.fadeOut(1500);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.startScene('Game');
                    });
                });
            });



        });
    }

    startScene(targetScene) {
        this.scene.start(targetScene);
    }
}