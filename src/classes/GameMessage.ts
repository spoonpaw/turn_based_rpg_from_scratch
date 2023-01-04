import GameScene from '../scenes/GameScene';
import eventsCenter from '../utils/EventsCenter';

export default class GameMessage extends Phaser.GameObjects.Container {
    public text: Phaser.GameObjects.Text;
    private hideEvent: Phaser.Time.TimerEvent | undefined;
    private gameScene: GameScene;

    public constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        this.gameScene = <GameScene>this.scene.scene.get('Game');

        const image = this.scene.add.image(
            120,
            430,
            'messageMenuFrame'
        )
            .setOrigin(0, 0);
        this.add(image);

        this.text = new Phaser.GameObjects.Text(
            this.scene,
            475,
            465,
            '',
            {
                color: '#ffffff',
                fontFamily: 'CustomFont',
                metrics: {
                    ascent: 41,
                    descent: 10,
                    fontSize: 51
                },
                wordWrap: {
                    width: 665,
                    useAdvancedWrap: true
                }
            }
        );
        this.text.setLineSpacing(-20);
        this.text.setResolution(3);
        this.text.setFontSize(48);
        this.add(this.text);
        this.text.setOrigin(0);
        this.text.setPosition(image.x + 10, image.y + 5);
        eventsCenter.removeListener('GameMessage');
        eventsCenter.on('GameMessage', this.showMessage, this);
        this.setVisible(false);
    }

    private hideMessage() {
        this.hideEvent = undefined;
        this.setVisible(false);
        if (this.gameScene.operatingSystem === 'mobile') {
            this.gameScene.gamePadScene?.scene.restart();

        }
    }

    private showMessage(text: string | string[]) {
        if (this.gameScene.operatingSystem === 'mobile') {
            this.gameScene.gamePadScene?.scene.stop();

        }
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