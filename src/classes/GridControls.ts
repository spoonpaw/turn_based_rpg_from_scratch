import {Direction} from '../types/Direction';
import GridPhysics from './GridPhysics';

export default class GridControls {
    constructor(
        public input: Phaser.Input.InputPlugin,
        public gridPhysics: GridPhysics
    ) {}

    update() {
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            this.gridPhysics.movePlayer(Direction.LEFT);
        }
        else if (cursors.right.isDown) {
            this.gridPhysics.movePlayer(Direction.RIGHT);
        }
        else if (cursors.up.isDown) {
            this.gridPhysics.movePlayer(Direction.UP);
        }
        else if (cursors.down.isDown) {
            this.gridPhysics.movePlayer(Direction.DOWN);
        }
    }
}