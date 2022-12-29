import eventsCenter from '../utils/EventsCenter';

export default class Message extends Phaser.GameObjects.Container {
    public text: Phaser.GameObjects.Text;
    private hideEvent: Phaser.Time.TimerEvent | undefined;

    public constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        const image = this.scene.add.image(236, 430, 'messageMenuFrame')
            .setOrigin(0, 0);
        this.add(image);

        this.text = new Phaser.GameObjects.Text(
            this.scene, 475, 465, '', {
                color: '#ffffff',
                fontFamily: 'CustomFont',
                wordWrap: {
                    width: 665,
                    useAdvancedWrap: true
                }
            }
        );
        this.text.setLineSpacing(-10);
        this.text.setResolution(3);
        this.text.setFontSize(55);
        this.add(this.text);
        this.text.setOrigin(0);
        this.text.setPosition(image.x + 10, image.y + 5);
        eventsCenter.removeListener('Message');
        eventsCenter.on('Message', this.showMessage, this);
        this.setVisible(false);
    }

    public hideMessage() {
        this.hideEvent = undefined;
        this.setVisible(false);
        eventsCenter.emit('MessageClose');
    }

    public showMessage(text: string | string[]) {
        this.text.setText(text);
        this.setVisible(true);
        if (this.hideEvent) {
            this.hideEvent.remove(false);
        }
        this.hideEvent = this.scene.time.addEvent({
            delay: 2000,
            callback: this.hideMessage,
            callbackScope: this
        });
    }
}