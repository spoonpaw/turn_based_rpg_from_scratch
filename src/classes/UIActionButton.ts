import SFXScene from '../scenes/SFXScene';

export default class UIActionButton extends Phaser.GameObjects.Container {
    public button!: Phaser.GameObjects.Image;
    public buttonText!: Phaser.GameObjects.Text;
    private sfxScene: SFXScene;

    constructor(
        public scene: Phaser.Scene,
        public x: number,
        public y: number,
        public key: string,
        public hoverKey: string,
        public text: string,
        public targetCallback: () => void
    ) {
        super(scene, x, y);

        this.sfxScene = <SFXScene>this.scene.scene.get('SFX');

        this.createButton();

        this.scene.add.existing(this);

    }

    public deselect() {
        this.button.setTexture(this.key);
    }

    public select() {
        this.button.setTexture(this.hoverKey);
    }

    private createButton() {
        this.button = this.scene.add.image(0, 0, this.key);

        this.button.setInteractive();

        this.button.setScale(2);

        if (this.text) {
            this.buttonText = this.scene.add.text(
                this.x + 20,
                this.y - 25,
                this.text,
                {
                    fontSize: '50px',
                    color: '#fff',
                    fontFamily: 'CustomFont'
                }
            );
            this.buttonText.setResolution(3);
            this.buttonText.setInteractive();
            this.buttonText.on('pointerdown', () => {
                this.targetCallback();
            });
        }

        this.add(this.button);

        this.button.on('pointerdown', () => {
            this.targetCallback();
        });
    }
}