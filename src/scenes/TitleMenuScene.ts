import UIActionButton from '../classes/UIActionButton';
import MusicScene from './MusicScene';
import SaveAndLoadScene from './SaveAndLoadScene';
import SFXScene from './SFXScene';

export default class TitleMenuScene extends Phaser.Scene{
    private musicScene!: MusicScene;
    private sfxScene!: SFXScene;
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
                this.scene.stop('TitleStory');
                this.saveAndLoadScene.getPlayerByIndex(0).then(() => {
                    this.scene.start(
                        'Game',
                        {
                            saveIndex: 0,
                            loadFromSave: true
                        }
                    );
                });

            }
        );

        this.saveFile1Button.hideActionButton();
        this.saveFileButtons.push(this.saveFile1Button);

        this.saveFile2Button = new UIActionButton(
            this,
            this.scale.width / 2 - 90,
            this.scale.height / 2 - 110,
            'checkbutton',
            'checkbutton',
            'File 2',
            () => {
                return;
            }
        );

        this.saveFile2Button.hideActionButton();
        this.saveFileButtons.push(this.saveFile2Button);

        this.saveFile3Button = new UIActionButton(
            this,
            this.scale.width / 2 - 90,
            this.scale.height / 2 - 50,
            'checkbutton',
            'checkbutton',
            'File 3',
            () => {
                return;
            }
        );

        this.saveFile3Button.hideActionButton();
        this.saveFileButtons.push(this.saveFile3Button);

        this.cancelButton = new UIActionButton(
            this,
            this.scale.width / 2 - 90,
            this.scale.height / 2 + 130,
            'crossbutton',
            'crossbutton',
            'Cancel',
            () => {
                for (const saveFileButton of this.saveFileButtons) {
                    saveFileButton.hideActionButton();
                }
                this.newGameButton.showActionButton();
                this.loadGameButton.showActionButton();
                this.cancelButton.hideActionButton();
            }
        );
        this.cancelButton.hideActionButton();

        this.newGameButton = new UIActionButton(
            this,
            this.scale.width / 2 - 90,
            this.scale.height / 2 - 50,
            'checkbutton',
            'checkbutton',
            'New Game',
            () => {
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
                this.newGameButton.hideActionButton();
                this.loadGameButton.hideActionButton();
                this.saveAndLoadScene.getPlayers().then(players => {
                    for (const [index, player] of players!.entries()) {
                        this.saveFileButtons[index].changeButtonText(player.name);
                        this.shrinkTextByPixel(this.saveFileButtons[index].buttonText, 430);
                        this.saveFileButtons[index].showActionButton();
                    }
                    this.cancelButton.showActionButton();
                });
            }
        );
        this.loadGameButton.hideActionButton();

        this.saveAndLoadScene.getPlayers().then(players => {
            if (players && players.length > 0) {
                this.loadGameButton.showActionButton();
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