import UIActionButton from '../classes/UIActionButton';
import MusicScene from './MusicScene';
import SaveAndLoadScene from './SaveAndLoadScene';
import SFXScene from './SFXScene';

export default class TitleMenuScene extends Phaser.Scene{
    // private backgroundRectangle!: Phaser.GameObjects.Rectangle;
    private musicScene!: MusicScene;
    private sfxScene!: SFXScene;
    // private newGameOrLoadFrame!: Phaser.GameObjects.Image;
    private newGameButton!: UIActionButton;
    private loadGameButton!: UIActionButton;
    private saveAndLoadScene!: SaveAndLoadScene;
    private saveFile1Button!: UIActionButton;
    private saveFile2Button!: UIActionButton;
    private saveFile3Button!: UIActionButton;
    private saveFileButtons: UIActionButton[] = [];
    private cancelButton!: UIActionButton;
    constructor() {
        super('TitleMenu');
    }

    public create() {

        this.saveAndLoadScene = <SaveAndLoadScene>this.scene.get('SaveAndLoad');
        this.musicScene = <MusicScene>this.scene.get('Music');
        this.sfxScene = <SFXScene>this.scene.get('SFX');
        this.musicScene.scene.bringToTop();
        this.sfxScene.scene.bringToTop();

        this.saveFile1Button = new UIActionButton(
            this,
            this.scale.width / 2 - 90,
            this.scale.height / 2 - 170,
            'checkbutton',
            'checkbutton',
            'File 1',
            () => {
                console.log('save file 1 clicked');

                this.scene.stop('TitleStory');
                this.saveAndLoadScene.getPlayerByIndex(0).then(player => {
                    this.scene.start(
                        'Game',
                        {
                            nameData: player.name
                        }
                    );
                });

            }
        );

        this.saveFile1Button.setVisible(false);
        this.saveFile1Button.buttonText.setVisible(false);
        this.saveFileButtons.push(this.saveFile1Button);

        this.saveFile2Button = new UIActionButton(
            this,
            this.scale.width / 2 - 90,
            this.scale.height / 2 - 110,
            'checkbutton',
            'checkbutton',
            'File 2',
            () => {
                console.log('save file 2 clicked');
            }
        );

        this.saveFile2Button.setVisible(false);
        this.saveFile2Button.buttonText.setVisible(false);
        this.saveFileButtons.push(this.saveFile2Button);

        this.saveFile3Button = new UIActionButton(
            this,
            this.scale.width / 2 - 90,
            this.scale.height / 2 - 50,
            'checkbutton',
            'checkbutton',
            'File 3',
            () => {
                console.log('save file 2 clicked');
            }
        );

        this.saveFile3Button.setVisible(false);
        this.saveFile3Button.buttonText.setVisible(false);
        this.saveFileButtons.push(this.saveFile3Button);

        this.cancelButton = new UIActionButton(
            this,
            this.scale.width / 2 - 90,
            this.scale.height / 2 + 130,
            'crossbutton',
            'crossbutton',
            'Cancel',
            () => {
                console.log('cancelbutton clicked');
                for (const saveFileButton of this.saveFileButtons) {
                    saveFileButton.setVisible(false);
                    saveFileButton.buttonText.setVisible(false);
                }
                this.newGameButton.setVisible(true);
                this.newGameButton.buttonText.setVisible(true);
                this.loadGameButton.setVisible(true);
                this.loadGameButton.buttonText.setVisible(true);
                this.cancelButton.setVisible(false);
                this.cancelButton.buttonText.setVisible(false);
            }
        );
        this.cancelButton.setVisible(false);
        this.cancelButton.buttonText.setVisible(false);

        this.newGameButton = new UIActionButton(
            this,
            this.scale.width / 2 - 90,
            this.scale.height / 2 - 50,
            'checkbutton',
            'checkbutton',
            'New Game',
            () => {
                console.log('new game button clicked!');
                this.scene.stop('TitleStory');
                this.scene.start('PlayerNameSelect');
            }
        );

        this.loadGameButton = new UIActionButton(
            this,
            this.scale.width / 2 - 90,
            this.scale.height / 2 + 10,
            'checkbutton',
            'checkbutton',
            'Load Game',
            () => {
                console.log('load game button clicked');
                this.newGameButton.setVisible(false);
                this.newGameButton.buttonText.setVisible(false);
                this.loadGameButton.setVisible(false);
                this.loadGameButton.buttonText.setVisible(false);
                this.saveAndLoadScene.getPlayers().then(players => {
                    for (const [index, player] of players!.entries()) {
                        console.log(player.name);
                        this.saveFileButtons[index].buttonText.setText(player.name);
                        this.shrinkTextByPixel(this.saveFileButtons[index].buttonText, 430);
                        this.saveFileButtons[index].setVisible(true);
                        this.saveFileButtons[index].buttonText.setVisible(true);
                    }
                    this.cancelButton.setVisible(true);
                    this.cancelButton.buttonText.setVisible(true);
                });
            }
        );
        this.loadGameButton.setVisible(false);
        this.loadGameButton.buttonText.setVisible(false);

        this.saveAndLoadScene.getPlayers().then(players => {
            console.log(players && players.length > 0);
            console.log('checking for saved players from title menu scene!');
            if (players && players.length > 0) {
                this.loadGameButton.setVisible(true);
                this.loadGameButton.buttonText.setVisible(true);
            }
        });
    }

    private shrinkTextByPixel(phasertext: Phaser.GameObjects.Text, maxpixel: number): Phaser.GameObjects.Text {
        let fontSize = phasertext.height;
        while (phasertext.width > maxpixel) {
            fontSize--;
            phasertext.setStyle({fontSize: fontSize + 'px'});
        }
        return phasertext;
    }
}