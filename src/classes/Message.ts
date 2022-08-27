import Phaser from 'phaser';

export default class Message extends Phaser.GameObjects.Container {
    private text: Phaser.GameObjects.Text;
    private hideEvent: Phaser.Time.TimerEvent | undefined;

    constructor(scene: Phaser.Scene, events: Phaser.Events.EventEmitter) {
        super(scene, 100, 425);
        const graphics = this.scene.add.graphics();
        this.add(graphics);
        graphics.lineStyle(2, 0xffffff, 0.8);
        graphics.fillStyle(0x031f4c, 0.3);
        graphics.strokeRect(-90, -15, 750, 50);
        graphics.fillRect(-90, -15, 750, 50);
        this.text = new Phaser.GameObjects.Text(
            scene,
            285,
            10,
            '',
            {
                color: '#ffffff',
                align: 'center',
                fontFamily: 'CustomFont',
                wordWrap: {
                    width: 750,
                    useAdvancedWrap: true
                }
            }
        );
        this.text.setFontSize(50);
        this.add(this.text);
        this.text.setOrigin(0.5);
        events.on('Message', this.showMessage, this);
        this.visible = false;
    }

    showMessage(text: string | string[]) {
        this.text.setText(text);
        this.visible = true;
        if (this.hideEvent) {
            this.hideEvent.remove(false);
        }
        this.hideEvent = this.scene.time.addEvent({
            delay: 2000,
            callback: this.hideMessage,
            callbackScope: this
        });
    }

    hideMessage() {
        this.hideEvent = undefined;
        this.visible = false;
    }
}