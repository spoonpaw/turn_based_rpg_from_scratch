import {Direction} from '../types/Direction';
import GridPhysics from './GridPhysics';

export default class GridControls {
    constructor(
        public input: Phaser.Input.InputPlugin,
        public gridPhysics: GridPhysics
    ) {
    }

    public update() {
        const cursors = this.input.keyboard!.createCursorKeys();
        if (cursors.left.isDown || this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
            this.gridPhysics.movePlayer(Direction.LEFT);
        }
        else if (cursors.right.isDown || this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
            this.gridPhysics.movePlayer(Direction.RIGHT);
        }
        else if (cursors.up.isDown || this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) {
            this.gridPhysics.movePlayer(Direction.UP);
        }
        else if (cursors.down.isDown || this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown) {
            this.gridPhysics.movePlayer(Direction.DOWN);
        }
    }
}