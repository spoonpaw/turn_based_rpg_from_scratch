import {Direction} from '../types/Direction';
import GameScene from './GameScene';

export default class GamePadScene extends Phaser.Scene {
    private joyStick: any;
    private text!: Phaser.GameObjects.Text;
    private gameScene!: GameScene;

    constructor() {
        super('GamePad');
    }


    create() {
        this.scene.sendToBack();
        this.gameScene = <GameScene>this.scene.get('Game');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.joyStick = this.plugins.get('rexVirtualJoyStick').add(this, {
            x: 110,
            y: 510,
            radius: 100,
            base: this.add.circle(0, 0, 60, 0x888888, 0.6),
            thumb: this.add.circle(0, 0, 25, 0xcccccc, 0.8),
            dir: '4dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
            forceMin: 16,
            enable: true
        });
        // .on('update', this.dumpJoyStickState, this);

        this.text = this.add.text(0, 0, '');
        this.text.setVisible(false);
        this.dumpJoyStickState();

        this.input.removeListener('pointerdown');
        this.input.on('pointerdown', (pointer: PointerEvent) => {
            // pointer down on the gamepad scene!
            // ??
            // eventsCenter.emit('space');
            if (this.gameScene.weaponMerchant || this.gameScene.innKeeper) {
                // pointer down on the gamepad scene (npc[s] found)
                if (this.gameScene.uiScene.interactionState === 'cancelmouse') {
                    this.gameScene.uiScene.interactionState = 'mainselect';
                    return;
                }
                if (
                    this.gameScene.uiScene.interactionState.startsWith('mainselect') // ||
                    // this.uiScene.interactionState === 'cancelmouse' // ||
                    // this.uiScene.interactionState === 'cancel'
                ) {
                    // listening for interactivity on npcs
                    if (this.gameScene.weaponMerchant) this.gameScene.weaponMerchant.listenForInteractEvent();
                    if (this.gameScene.innKeeper) this.gameScene.innKeeper.listenForInteractEvent();
                }
            }
            this.joyStick.setPosition(pointer.x, pointer.y);
        }, this);

    }

    dumpJoyStickState() {
        const cursorKeys = this.joyStick.createCursorKeys();
        // let s = 'Key down: ';
        for (const name in cursorKeys) {
            if (cursorKeys[name].isDown) {
                // s += name + ' ';

                // make the character move in the pressed direction
                if (name === 'up') {
                    this.gameScene.gridControls.gridPhysics.movePlayer(Direction.UP);
                }
                else if (name === 'right') {
                    this.gameScene.gridControls.gridPhysics.movePlayer(Direction.RIGHT);
                }
                else if (name === 'down') {
                    this.gameScene.gridControls.gridPhysics.movePlayer(Direction.DOWN);
                }
                else if (name === 'left') {
                    this.gameScene.gridControls.gridPhysics.movePlayer(Direction.LEFT);
                }

            }
        }
        // s += '\n';
        // s += ('Force: ' + Math.floor(this.joyStick.force * 100) / 100 + '\n');
        // s += ('Angle: ' + Math.floor(this.joyStick.angle * 100) / 100 + '\n');
        // this.text.setText(s);
    }

    public update() {
        this.dumpJoyStickState();

    }
}