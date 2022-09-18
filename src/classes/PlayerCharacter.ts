import Unit from './Unit';

export default class PlayerCharacter extends Unit{
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        type: string,
        hp: number,
        damage: number,
        initiative: number
    ) {
        super(
            scene,
            x,
            y,
            texture,
            frame,
            type,
            hp,
            damage,
            initiative
        );

        this.initiative = initiative;

    }



}