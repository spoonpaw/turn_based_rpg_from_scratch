import eventsCenter from '../utils/EventsCenter';
import KeyboardScene from './KeyboardScene';
import MusicScene from './MusicScene';
import SaveAndLoadScene from './SaveAndLoadScene';
import SFXScene from './SFXScene';

export default class PlayerNameSelectScene extends Phaser.Scene {
    private characterDetailDisplay!: Phaser.GameObjects.Image;
    private keyBoardScene!: KeyboardScene;
    private commandFrame!: Phaser.GameObjects.Image;
    private backgroundRectangle!: Phaser.GameObjects.Rectangle;
    private musicScene!: MusicScene;
    private sfxScene!: SFXScene;
    private saveAndLoadScene!: SaveAndLoadScene;
    constructor() {
        super('PlayerNameSelect');
    }

    public create() {

        // Create a rectangle game object and set its width, height, and color
        this.backgroundRectangle = this.add.rectangle(
            0,
            0,
            this.scale.width,
            this.scale.height,
            0xbcbcbc
        )
            .setOrigin(0, 0);


        this.commandFrame = this.add.image(
            40, 610, 'keyboardInputFrame'
        )
            .setOrigin(0, 0);

        this.scene.launch('Keyboard', {purpose: 'playernameselect'});
        this.keyBoardScene = <KeyboardScene>this.scene.get('Keyboard');
        this.saveAndLoadScene = <SaveAndLoadScene>this.scene.get('SaveAndLoad');
        this.musicScene = <MusicScene>this.scene.get('Music');
        this.sfxScene = <SFXScene>this.scene.get('SFX');
        this.keyBoardScene.scene.bringToTop();
        this.musicScene.scene.bringToTop();
        this.sfxScene.scene.bringToTop();

        this.characterDetailDisplay = this.add.image(
            335,
            175,
            'hero',
            0,
        )
            .setScale(3);

        this.add.text(
            65,
            625,
            'What is thy name?',
            {
                fontSize: '70px',
                color: '#fff',
                fontFamily: 'CustomFont'
            }
        );

        eventsCenter.on(
            'keyboardaccept',
            (string: string | string[] | undefined) => {
                eventsCenter.removeListener('keyboardreject');
                eventsCenter.removeListener('keyboardaccept');
                string = String(string);
                this.saveAndLoadScene.upsertPlayer(string);
                this.scene.start(
                    'Game',
                    {
                        nameData: string
                    }
                );
            }
        );
    }
}