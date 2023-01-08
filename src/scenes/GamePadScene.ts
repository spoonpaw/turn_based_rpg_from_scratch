import {Direction} from '../types/Direction';
import GameScene from './GameScene';
import MusicScene from './MusicScene';
import SFXScene from './SFXScene';

export default class GamePadScene extends Phaser.Scene {
    private joyStick: any;
    private text!: Phaser.GameObjects.Text;
    private gameScene!: GameScene;
    private musicScene!: MusicScene;
    private sfxScene!: SFXScene;

    constructor() {
        super('GamePad');
    }

    create() {
        this.gameScene = <GameScene>this.scene.get('Game');
        this.musicScene = <MusicScene>this.scene.get('Music');
        this.sfxScene = <SFXScene>this.scene.get('SFX');
        this.scene.bringToTop();
        this.musicScene.scene.bringToTop();
        this.sfxScene.scene.bringToTop();

        const plugin = this.plugins.get('rexVirtualJoyStick');
        this.joyStick = (plugin as any).add(this, {
            x: 110,
            y: 510,
            radius: 100,
            base: this.add.circle(0, 0, 60, 0x888888, 0.8),
            thumb: this.add.circle(0, 0, 25, 0xcccccc, 0.9),
            dir: '4dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
            forceMin: 16,
            enable: true
        });

        this.text = this.add.text(0, 0, '');
        this.text.setVisible(false);
        this.dumpJoyStickState();

    }

    dumpJoyStickState() {
        const cursorKeys = this.joyStick.createCursorKeys();
        for (const name in cursorKeys) {
            if (cursorKeys[name].isDown) {

                // make the character move in the pressed direction
                if (name === 'up') {
                    this.gameScene.gridControls.gridPhysics.moveActor(Direction.UP);
                }
                else if (name === 'right') {
                    this.gameScene.gridControls.gridPhysics.moveActor(Direction.RIGHT);
                }
                else if (name === 'down') {
                    this.gameScene.gridControls.gridPhysics.moveActor(Direction.DOWN);
                }
                else if (name === 'left') {
                    this.gameScene.gridControls.gridPhysics.moveActor(Direction.LEFT);
                }

            }
        }
    }

    public update() {
        this.dumpJoyStickState();

    }
}