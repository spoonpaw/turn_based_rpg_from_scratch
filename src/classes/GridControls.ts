import {Direction} from '../types/Direction';
import PlayerGridPhysics from './PlayerGridPhysics';

export default class GridControls {
    constructor(
        public input: Phaser.Input.InputPlugin,
        public gridPhysics: PlayerGridPhysics
    ) {
    }

    public update() {
        const cursors = this.input.keyboard!.createCursorKeys();
        if (cursors.left.isDown || this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
            this.gridPhysics.move(Direction.LEFT);
        }
        else if (cursors.right.isDown || this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
            this.gridPhysics.move(Direction.RIGHT);
        }
        else if (cursors.up.isDown || this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) {
            this.gridPhysics.move(Direction.UP);
        }
        else if (cursors.down.isDown || this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown) {
            this.gridPhysics.move(Direction.DOWN);
        }
    }
}