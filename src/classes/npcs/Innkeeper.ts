import NPC from './NPC';
import GameScene from '../../scenes/GameScene';
import eventsCenter from '../../utils/EventsCenter';

export default class Innkeeper extends NPC {
    private gameScene: GameScene;

    constructor(
        public sprite: Phaser.GameObjects.Sprite,
        protected tilePos: Phaser.Math.Vector2
    ) {
        super(sprite, tilePos);
        this.gameScene = <GameScene>this.sprite.scene;
    }

    removeListener() {
        this.gameScene.input.keyboard.removeListener('keydown');
    }

    addListener() {
        this.gameScene.input.keyboard.on('keydown', (event) => {
            if (this.gameScene.currentMap !== 'town') {
                return;
            }
            if (event.code === 'Space') {
                // check if in town and looking at innkeeper
                if (this.gameScene.activeDialogScene) {
                    return;
                }

                if (
                    (
                        this.gameScene.player.getTilePos().x === 5 &&
                        this.gameScene.player.getTilePos().y === 2 &&
                        this.gameScene.gridPhysics.facingDirection === 'right'
                    ) ||
                    (
                        this.gameScene.player.getTilePos().x === 6 &&
                        this.gameScene.player.getTilePos().y === 3 &&
                        this.gameScene.gridPhysics.facingDirection === 'up'
                    )
                ) {
                    this.gameScene.activeDialogScene = true;

                    if (this.gameScene.gridPhysics.facingDirection === 'right') this.sprite.setFrame(1);
                    if (this.gameScene.gridPhysics.facingDirection === 'up') this.sprite.setFrame(0);

                    // give the player the option to heal or not. tell them how much it costs to heal.
                    //  & show follow-up dialogue
                    this.gameScene.scene.run('YesNoDialog', {text: 'Innkeeper:\nGood day! It costs three gold to rest hither. Dost thou wish to stay?'});
                    eventsCenter.removeListener('confirm');
                    eventsCenter.on('confirm', () => {
                        if (this.gameScene.player.gold < 3) {
                            this.gameScene.scene.run('Dialog', {text: 'Innkeeper:\nYou haven\'t enough coin.'});
                        }
                        else {
                            this.gameScene.scene.run('Dialog', {text: 'Innkeeper:\nThank thee! Thou appeareth well rested.'});
                            this.gameScene.player.gold -= 3;
                            this.gameScene.player.health = this.gameScene.player.maxHealth;

                            eventsCenter.emit('updateHP', this.gameScene.player.health);
                            eventsCenter.emit('updateGold', this.gameScene.player.gold);
                        }
                    });
                }
            }
        });
    }
}