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

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.gameScene.cursors.space)) {
            this.gameScene.spaceDown = true;
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

                this.gameScene.scene.run('YesNoDialog', {text: 'Innkeeper:\nGood day! It costs three gold to rest hither. Dost thou wish to stay?'});
                eventsCenter.removeListener('confirm');
                eventsCenter.on('confirm', () => {
                    if (this.gameScene.player.gold < 3) {
                        this.gameScene.scene.run('Dialog', {text: 'Innkeeper:\nYou haven\'t enough coin.'});
                    }
                    else {
                        this.gameScene.scene.run('Dialog', {text: 'Innkeeper:\nThank thee! Thou appeareth well rested.'});
                        this.gameScene.player.gold -= 3;
                        this.gameScene.player.stats.currentHP = this.gameScene.player.stats.maxHP;

                        eventsCenter.emit('updateHP', this.gameScene.player.stats.currentHP);
                        eventsCenter.emit('updateGold', this.gameScene.player.gold);
                    }
                });
            }
        }

        if (Phaser.Input.Keyboard.JustUp(this.gameScene.cursors.space)) {
            this.gameScene.spaceDown = false;
        }
    }
}