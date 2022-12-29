export default class UiButton extends Phaser.GameObjects.Container {
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
        // create our Ui Button
        this.createButton();
        // add this container to our Phaser Scene
        this.scene.add.existing(this);
    }

    public createButton() {
        // create play game button
        this.button = this.scene.add.image(0, 0, this.key);
        // make button interactive
        this.button.setInteractive();
        // scale the button
        this.button.setScale(2);

        // create the button text
        this.buttonText = this.scene.add.text(0, 0, this.text, {
            fontSize: '50px',
            color: '#fff',
            fontFamily: 'CustomFont'
        });
        this.buttonText.setResolution(3);
        // center the button text inside the Ui button
        Phaser.Display.Align.In.Center(this.buttonText, this.button);

        // add the two game objects to our container
        this.add(this.button);
        this.add(this.buttonText);

        // listen for events
        this.button.on('pointerdown', () => {
            this.targetCallback();
        });

        this.button.on('pointerover', () => {
            this.button.setTexture(this.hoverKey);
        });

        this.button.on('pointerout', () => {
            this.button.setTexture(this.key);
        });
    }
}