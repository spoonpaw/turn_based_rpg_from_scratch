export default class UIActionButton extends Phaser.GameObjects.Container {
    public button!: Phaser.GameObjects.Image;
    public buttonText!: Phaser.GameObjects.Text;

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

        this.createButton();

        this.scene.add.existing(this);
    }

    private createButton() {
        this.button = this.scene.add.image(0, 0, this.key);

        this.button.setInteractive();

        this.button.setScale(2);

        if (this.text) {
            this.buttonText = this.scene.add.text(this.x+20, this.y-25, this.text,{ fontSize: '50px', color: '#fff', fontFamily: 'CustomFont'} );
            this.buttonText.setResolution(10);
        }

        this.add(this.button);

        this.button.on('pointerdown', () => {
            this.targetCallback();
        });
    }

    select() {
        this.button.setTexture(this.hoverKey);
    }

    deselect() {
        this.button.setTexture(this.key);
    }
}