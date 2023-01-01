import GameScene from '../scenes/GameScene';
import UIScene from '../scenes/UIScene';
import Stats from '../stats/Stats';
import {Direction} from '../types/Direction';
import {Equipment} from '../types/Equipment';
// import { getCombinedStat } from '../utils/getCombinedStat';
import GameActor from './GameActor';
import Item from './Item';
import {PlayerJob} from './Jobs/PlayerJob';

export default class Player extends GameActor{
    public LEVELING_RATE = 0.3;
    // public stats: Stats;
    private uiScene!: UIScene;
    constructor(
        name: string,
        sprite: Phaser.GameObjects.Sprite,
        public tilePos: Phaser.Math.Vector2,
        public gold: number,
        experience: number,
        species: string,
        // public type: string,
        public type: PlayerJob,
        public inventory: Item[],
        public equipment: Equipment,
        stats?: Stats
    ) {
        super(
            name,
            sprite,
            species,
            experience
        );
        console.log({playerType: this.type});
        this.uiScene = <UIScene>this.sprite.scene.scene.get('UI');

        const offsetX = GameScene.TILE_SIZE / 2;
        const offsetY = GameScene.TILE_SIZE;

        this.sprite.setOrigin(0.5, 1);
        this.sprite.setPosition(
            tilePos.x * GameScene.TILE_SIZE + offsetX,
            tilePos.y * GameScene.TILE_SIZE + offsetY
        );
        this.sprite.setFrame(1);
        this.stats = stats ?? this.createStats(this.type);

        this.sprite.setInteractive();

        this.sprite.on(
            'pointerdown',
            () => {
                // sprite clicked
                return;
            }
        );
    }

    public getPosition(): Phaser.Math.Vector2 {
        return this.sprite.getBottomCenter();
    }

    public getTilePos(): Phaser.Math.Vector2 {
        return this.tilePos.clone();
    }

    public setPosition(position: Phaser.Math.Vector2): void {
        this.sprite.setPosition(position.x, position.y);
    }

    public setTilePos(tilePosition: Phaser.Math.Vector2): void {
        this.tilePos = tilePosition.clone();
    }

    public startAnimation(direction: Direction | string) {
        this.sprite.anims.play(direction);
    }

    get level() {
        return Math.max(1, Math.ceil(this.LEVELING_RATE * Math.sqrt(this.experience)));
    }

}