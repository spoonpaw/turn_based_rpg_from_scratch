import Phaser from 'phaser';

import eventsCenter from '../utils/EventsCenter';

export default class TitleStoryScene extends Phaser.Scene{
    public titleText!: Phaser.GameObjects.Text;
    private floralFrame!: Phaser.GameObjects.Image;
    private storyText!: Phaser.GameObjects.Text;
    public slideUpTitle = false;
    private showTitleMenuScene = false;
    private titleTextYFinalDestination = 100;
    private pressKeyToSkip!: Phaser.GameObjects.Text;
    constructor() {
        super('TitleStory');
    }

    create() {
        // create title text
        this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Afterlife', {
            fontSize: '128px',
            color: '#fff',
            fontFamily: 'CustomFont'
        })
            .setStroke('#000000', 6);

        this.titleText.setOrigin(0.5);

        this.cameras.main.fadeIn(1500);

        this.storyText = this.add.text(
            this.scale.width / 2,
            this.scale.height * 1.10,
            'Caelor was once a realm of wonder and prosperity, where magic and technology blended seamlessly to create a utopia for all. But long ago, the Charged Aether, the very source of Caelor\'s power, gained sentience and turned against its users. The Fall of Caelor had begun, as an army of mutants and monstrous war machines, created and controlled by the sentient aether, overran the land. The once peaceful inhabitants were left to witness the destruction of their homes, and the loss of loved ones. Only a few settlements remained, protected by the still functioning biodomes, but the threat of invasion and the never-ending aetherstorm loomed ever present, as the fate of Caelor hung in the balance. The darkness spread and consumed all that remained.\n\n\n\n\n\nBut amidst the despair and destruction, a glimmer of hope emerged. The ancient Nirradan Prophecy spoke of a hero who could enter the Soul Realm, where powerful entities reign, to defeat the darkness and restore Caelor to its former glory. The prophecy also spoke of a powerful artifact known as the Weave of Dreams, which holds the power to change fate. The hero who found it would be able to change the course of the war between the Demonic Machines and the Ancient Guardians in the Soul Realm and defeat the malevolent force of the Charged Aether and its minions. The fate of Caelor and the souls of its inhabitants rests in the hands of the hero; should they fail, the realm will fall to darkness forever.',
            {
                font: '50px CustomFont',
                color: '#ffffff',
                metrics: {
                    ascent: 41,
                    descent: 10,
                    fontSize: 51
                },
                wordWrap: {
                    width: 720,
                    useAdvancedWrap: true
                }

            });
        this.storyText.setOrigin(0.5, 0);
        this.storyText.setResolution(3);
        this.storyText.setVisible(false);

        this.floralFrame = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2 + 50,
            'floralFrame'
        )
            .setScale(1.6);
        this.floralFrame.setVisible(false);

        this.pressKeyToSkip = this.add.text(
            this.scale.width - 200,
            this.scale.height - 20,
            'Press Any Key To Skip...',
            {
                fontSize: '40px',
                color: '#fff',
                fontFamily: 'CustomFont',
            })
            .setStroke('#000000', 2);

        this.pressKeyToSkip.setOrigin(0.5);
        this.pressKeyToSkip.setVisible(false);

        const graphics = this.make.graphics({});

        graphics.fillRect(
            95, 165, 720, 480
        );

        const mask = new Phaser.Display.Masks.GeometryMask(this, graphics);
        this.storyText.setMask(mask);

        eventsCenter.once('gamestart', ()=> {
            // fade in the floral frame

            this.floralFrame.setAlpha(0);
            this.floralFrame.setVisible(true);
            this.tweens.add({
                targets: this.floralFrame,
                alpha: 1,
                duration: 1000,
                ease: 'Power1'
            });
            this.storyText.setVisible(true);

            this.pressKeyToSkip.setVisible(true);
            this.scene.scene.tweens.add({
                targets: this.pressKeyToSkip,
                duration: 1500,
                repeat: -1,
                loop: true,
                alpha: 0,
                yoyo: true
            });

            // if the player presses a button or clicks the scene,
            //  set the storytext y to -this.storyText.height + 165 and
            //  launch the 'TitleMenu' scene
            this.input.once('pointerdown', () => {
                this.input.keyboard!.removeListener('keydown');
                this.input.removeListener('pointerdown');
                // Set the storytext y to -this.storyText.height + 165
                this.storyText.y = -this.storyText.height + 165;
                this.storyText.setVisible(false);
                // Launch the 'TitleMenu' scene
                this.showTitleMenuScene = true;
                this.pressKeyToSkip.setVisible(false);
                this.scene.launch('TitleMenu');
            });
            // Add event listener for any key press
            this.input.keyboard!.once('keydown', (event: KeyboardEvent) => {
                // Check if the key press event is a repeat or not
                if (!event.repeat) {
                    this.input.keyboard!.removeListener('keydown');
                    this.input.removeListener('pointerdown');
                    // Launch the 'TitleMenu' scene
                    this.showTitleMenuScene = true;
                    this.pressKeyToSkip.setVisible(false);
                    // Set the storytext y to -this.storyText.height + 165
                    this.storyText.y = -this.storyText.height + 165;
                    this.storyText.setVisible(false);
                    // Launch the 'TitleMenu' scene
                    this.scene.launch('TitleMenu');
                }
            });
        });
    }

    update() {
        if (this.slideUpTitle) {
            this.slideUpTitle = false;
            // Create a tween to move the story text up
            this.tweens.add({
                targets: this.storyText,
                y: -this.storyText.height + 165,
                duration: 60000, // Adjust this value to change the duration of the tween
                ease: 'Linear'
            });

            // You could also use a tween to move the title text
            this.tweens.add({
                targets: this.titleText,
                y: this.titleTextYFinalDestination,
                duration: 2500,
                ease: 'Linear'
            });
        }
        if (this.storyText.y <= -this.storyText.height + 165 && !this.showTitleMenuScene) {
            this.input.keyboard!.removeListener('keydown');
            this.input.removeListener('pointerdown');
            this.showTitleMenuScene = true;
            this.pressKeyToSkip.setVisible(false);
            this.scene.launch('TitleMenu');
        }
    }
}