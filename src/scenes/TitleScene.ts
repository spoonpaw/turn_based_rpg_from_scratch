import Phaser from 'phaser';
import UiButton from '../classes/UiButton';

export default class TitleScene extends Phaser.Scene {
    public titleText!: Phaser.GameObjects.Text;
    public startGameButton!: UiButton;

    constructor() {
        super('Title');
    }

    create() {

        const phaserImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'pic');
        phaserImage.displayHeight = this.sys.canvas.height;
        phaserImage.displayWidth = this.sys.canvas.width;

        this.cameras.main.once('camerafadeincomplete', (camera) => {
            camera.fadeOut(3000);
        });
        this.cameras.main.fadeIn(3000);
        //this.add.image(400, 3000, 'pic2');

        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            phaserImage.destroy();

            const titleImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'title');
            titleImage.displayHeight = this.sys.canvas.height;
            titleImage.displayWidth = this.sys.canvas.width;

            camera.fadeIn(3000);

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
                this.input.keyboard.on('keydown', () => {
                    this.input.enabled = false;
                    camera.fadeOut(3000);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.startScene('Game');
                    });
                });
                this.input.on('pointerdown', () => {
                    this.input.enabled = false;
                    camera.fadeOut(3000);
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

class TweenHelper {
    static flashElement(scene, element, repeat = true, easing = 'Linear', overallDuration = 1500, visiblePauseDuration = 500) {
        if (scene && element) {
            const flashDuration = overallDuration - visiblePauseDuration / 2;

            scene.tweens.timeline({
                tweens: [
                    {
                        targets: element,
                        duration: 0,
                        alpha: 0,
                        ease: easing
                    },
                    {
                        targets: element,
                        duration: flashDuration,
                        alpha: 1,
                        ease: easing
                    },
                    {
                        targets: element,
                        duration: visiblePauseDuration,
                        alpha: 1,
                        ease: easing
                    },
                    {
                        targets: element,
                        duration: flashDuration,
                        alpha: 0,
                        ease: easing,
                        onComplete: () => {
                            if (repeat === true) {
                                this.flashElement(scene, element);
                            }
                        }
                    }
                ]
            });
        }
    }
}