import Unit from './Unit';
import eventsCenter from '../utils/EventsCenter';
import BattleScene from '../scenes/BattleScene';

export default class Enemy extends Unit {

    constructor(scene: BattleScene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame: string | number |  undefined, type: string, hp: number, damage: number, initiative: number) {
        super(scene, x, y, texture, frame, type, hp, damage, initiative);
        this.setScale(6);
        this.setInteractive();

        this.on('pointerdown', () => {
            // check if the battle scene is ready for player interaction at all

            if (scene.interactionState !== 'attack') {
                return;
            }

            eventsCenter.emit('actionSelect', {
                action: 'attack', target: this
            });
        });
    }
}