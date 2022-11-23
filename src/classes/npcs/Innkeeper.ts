import GameScene from '../../scenes/GameScene';
import UIScene from '../../scenes/UIScene';
import eventsCenter from '../../utils/EventsCenter';
import NPC from './NPC';

export default class Innkeeper extends NPC {
    private gameScene: GameScene;
    private uiScene: UIScene;

    constructor(
        public sprite: Phaser.GameObjects.Sprite,
        protected tilePos: Phaser.Math.Vector2
    ) {
        super(sprite, tilePos);
        this.gameScene = <GameScene>this.sprite.scene;
        this.uiScene = <UIScene>this.gameScene.scene.get('UI');
    }

    listenForInteractEvent() {
        if (Phaser.Input.Keyboard.JustDown(this.gameScene.cursors.space)) {
            console.log('innkeeper heard player press the space bar somewhere!');
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
                console.log('innkeeper just got talked to');
                // TODO: fix the fact that the innkeeper dialog doesn't get
                //  closed when the space bar is pressed

                // TODO: maybe just disable the movement keys but not the space bar
                this.gameScene.input.keyboard.enabled = false;
                this.gameScene.activeDialogScene = true;
                if (this.gameScene.gridPhysics.facingDirection === 'right') this.sprite.setFrame(1);
                if (this.gameScene.gridPhysics.facingDirection === 'up') this.sprite.setFrame(0);

                this.uiScene.leftSideDialogFrame.setVisible(true);
                this.uiScene.leftSideDialogText.setText('Innkeeper:\nGood day! It costs three gold to rest hither. Dost thou wish to stay?');
                this.uiScene.leftSideDialogText.setVisible(true);
                this.uiScene.rightSideDialogOptionsFrame.setVisible(true);
                this.uiScene.yesButton.setVisible(true);
                this.uiScene.yesButton.buttonText.setVisible(true);
                this.uiScene.noButton.setVisible(true);
                this.uiScene.noButton.buttonText.setVisible(true);

                // this.uiScene.input.keyboard.resetKeys();
                // if (Phaser.Input.Keyboard.JustDown(this.uiScene.cursors.space)) {
                // this.uiScene.input.keyboard.on('keydown', (event: KeyboardEvent) => {
                //     if (event.code === 'Space') {
                eventsCenter.removeListener('space');
                eventsCenter.on('space', () => {
                    eventsCenter.removeListener('space');
                    eventsCenter.removeListener('no');
                    console.log('close the talk scene');

                    this.uiScene.leftSideDialogFrame.setVisible(false);
                    this.uiScene.leftSideDialogText.setText('');
                    this.uiScene.leftSideDialogText.setVisible(false);
                    this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
                    this.uiScene.yesButton.setVisible(false);
                    this.uiScene.yesButton.buttonText.setVisible(false);
                    this.uiScene.noButton.setVisible(false);
                    this.uiScene.noButton.buttonText.setVisible(false);

                    this.gameScene.input.keyboard.enabled = true;
                    // this.gameScene.input.keyboard.resetKeys();
                });

                eventsCenter.removeListener('no');
                eventsCenter.on('no', () => {
                    eventsCenter.removeListener('space');
                    eventsCenter.removeListener('no');
                    console.log('close the talk scene');

                    this.uiScene.leftSideDialogFrame.setVisible(false);
                    this.uiScene.leftSideDialogText.setText('');
                    this.uiScene.leftSideDialogText.setVisible(false);
                    this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
                    this.uiScene.yesButton.setVisible(false);
                    this.uiScene.yesButton.buttonText.setVisible(false);
                    this.uiScene.noButton.setVisible(false);
                    this.uiScene.noButton.buttonText.setVisible(false);

                    this.gameScene.input.keyboard.enabled = true;
                    this.gameScene.input.keyboard.resetKeys();
                });

                eventsCenter.removeListener('yes');
                eventsCenter.on('yes', () => {
                    // eventsCenter.removeListener('space');
                    eventsCenter.removeListener('no');
                    eventsCenter.removeListener('yes');
                    this.uiScene.rightSideDialogOptionsFrame.setVisible(false);
                    this.uiScene.yesButton.setVisible(false);
                    this.uiScene.yesButton.buttonText.setVisible(false);
                    this.uiScene.noButton.setVisible(false);
                    this.uiScene.noButton.buttonText.setVisible(false);
                    // this.gameScene.input.keyboard.resetKeys();

                    // TODO: if the player doesn't have enough gold, tell him so
                    //  otherwise heal him!

                    if (this.gameScene.player.gold < 3) {
                        this.uiScene.leftSideDialogText.setText('Innkeeper:\nYou haven\'t enough coin.');
                    }
                    else {
                        console.log('heal the player, take his gold, show the final dialog');
                        this.uiScene.leftSideDialogText.setText('Innkeeper:\nThank thee! Thou appeareth well rested.');
                        this.gameScene.player.gold -= 3;
                        this.gameScene.player.stats.currentHP = this.gameScene.player.stats.maxHP;
                        this.uiScene.updateHP(this.gameScene.player.stats.maxHP);
                        this.uiScene.updateGold(this.gameScene.player.gold);
                    }
                });
            }
        }
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