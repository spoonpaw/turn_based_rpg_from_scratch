import eventsCenter from '../utils/EventsCenter';

export default class Message extends Phaser.GameObjects.Container {
    private text: Phaser.GameObjects.Text;
    private hideEvent: Phaser.Time.TimerEvent | undefined;
    private _events: Phaser.Events.EventEmitter;

    constructor(scene: Phaser.Scene, events: Phaser.Events.EventEmitter) {
        super(scene, 0, 0);
        this._events = events;
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
        this.text.setResolution(10);
        this.text.setFontSize(55);
        this.add(this.text);
        this.text.setOrigin(0);
        this.text.setPosition(image.x + 10, image.y + 5);
        eventsCenter.removeListener('Message');
        eventsCenter.on('Message', this.showMessage, this);
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
        eventsCenter.emit('MessageClose');
    }
}