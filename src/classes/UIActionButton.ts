import SFXScene from '../scenes/SFXScene';

export default class UIActionButton extends Phaser.GameObjects.Container {
    public button!: Phaser.GameObjects.Image;
    public buttonText!: Phaser.GameObjects.Text;
    private sfxScene: SFXScene;
    public invisibleButton!: Phaser.GameObjects.Rectangle;

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
            // this.buttonText.on('pointerdown', () => {
            //     this.targetCallback();
            // });
            this.invisibleButton = this.scene.add.rectangle(
                this.buttonText.x,
                this.buttonText.y,
                this.buttonText.width,
                this.buttonText.height - 5,
                0xFF0000,
                0
            )
                .setOrigin(0, 0)
                .setInteractive()
                .on('pointerdown', () => {
                    console.log('button pressed');
                    console.log(`button key: ${this.key}`);
                    console.log(`button text: ${this.buttonText?.text}`);
                    this.targetCallback();
                });
        }

        this.add(this.button);

        this.button.on('pointerdown', () => {
            console.log('button pressed');
            console.log(`button key: ${this.key}`);
            console.log(`button text: ${this.buttonText?.text}`);
            this.targetCallback();
        });
    }

    public showActionButton() {
        this.button.setVisible(true);
        this.buttonText.setVisible(true);
        this.invisibleButton.setVisible(true);
    }

    public hideActionButton() {
        this.button.setVisible(false);
        this.buttonText.setVisible(false);
        this.invisibleButton.setVisible(false);
    }

    public destroyUIActionButton() {
        this.button.destroy();
        this.buttonText.destroy();
        this.invisibleButton.destroy();
    }
}