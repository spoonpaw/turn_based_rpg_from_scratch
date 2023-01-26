import {Direction} from '../types/Direction';
import Bot from './Bot';
import GridPhysics from './GridPhysics';
import Player from './Player';

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

export default class PlayerGridPhysics extends GridPhysics{
    public facingDirection = Direction.NONE;
    protected lastMovementIntent = Direction.NONE;
    public movementDirection: Direction = Direction.NONE;
    protected movementDirectionVectors: {
        [key in Direction]?: Vector2;
    } = {
            [Direction.UP]: Vector2.UP,
            [Direction.DOWN]: Vector2.DOWN,
            [Direction.LEFT]: Vector2.LEFT,
            [Direction.RIGHT]: Vector2.RIGHT,
        };
    public tileSizePixelsWalked = 0;

    public constructor(
        playerOrNPC: Player | Bot,
        tileMap: Phaser.Tilemaps.Tilemap
    ) {
        super(playerOrNPC, tileMap);
    }

}