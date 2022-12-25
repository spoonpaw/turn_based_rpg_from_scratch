export default class KeyboardScene extends Phaser.Scene {
    private keyboardFrame!: Phaser.GameObjects.Image;
    public keyboardString!: string;
    public keyboardButtonDictionary: { [key: string]: Phaser.GameObjects.Text } = {};
    public capsLock!: boolean;
    private capsLockButton!: Phaser.GameObjects.Text;
    private spaceButton!: Phaser.GameObjects.Text;

    public constructor() {
        super('Keyboard');
    }

    public create() {
        this.capsLock = false;
        this.keyboardFrame = this.add.image(
            40, 380, 'sidedialogframe'
        )
            .setOrigin(0, 0);
        this.createKeyboardKeys();

        this.spaceButton = this.add.text(
            250,
            530,
            'space',
            {
                fontSize: '70px',
                color: '#fff',
                fontFamily: 'CustomFont'
            }
        )
            .setInteractive()
            .on('pointerdown', () => {
                console.log('space key pressed');
            });

        this.capsLockButton = this.add.text(
            545,
            530,
            'caps',
            {
                fontSize: '70px',
                color: '#fff',
                fontFamily: 'CustomFont'
            })
            .setInteractive()
            .on('pointerdown', () => {
                console.log('caps lock clicked!');
                this.capsLock = !this.capsLock;
                for (const keyboardButton of Object.values(this.keyboardButtonDictionary)) {
                    keyboardButton.off('pointerdown');
                    if (this.capsLock){
                        keyboardButton.setText(keyboardButton.text.toUpperCase());
                        keyboardButton.on('pointerdown', () => {
                            console.log(`${keyboardButton.text} clicked`);
                        });
                    }
                    else {
                        keyboardButton.setText(keyboardButton.text.toLowerCase());
                        keyboardButton.on('pointerdown', () => {
                            console.log(`${keyboardButton.text} clicked`);
                        });
                    }
                }
            });
    }

    private createKeyboardKeys() {
        const keysList = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm']
        ];

        for (const [rowIndex, row] of keysList.entries()) {
            for (const [colIndex, char] of row.entries()) {
                this.keyboardButtonDictionary[char] = this.add.text(
                    45 + (60 * colIndex) + (16 * rowIndex),
                    376 + (55 * rowIndex),
                    char,
                    {
                        fontSize: '70px',
                        color: '#fff',
                        fontFamily: 'CustomFont'
                    })
                    .setInteractive()
                    .on('pointerdown', () => {
                        console.log(`${char} clicked`);
                    });
            }
        }
    }
}