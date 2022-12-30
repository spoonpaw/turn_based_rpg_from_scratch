import UIActionButton from '../classes/UIActionButton';
import eventsCenter from '../utils/EventsCenter';

export default class KeyboardScene extends Phaser.Scene {
    public cursor!: Phaser.GameObjects.Rectangle;
    public capsLock!: boolean;
    public keyboardButtonDictionary!: { [key: string]: Phaser.GameObjects.Text };
    public keyboardInputTextArray!: Phaser.GameObjects.Text[];
    public keysList = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];
    private acceptButton!: UIActionButton;
    private capsLockButton!: Phaser.GameObjects.Text;
    private deleteButton!: Phaser.GameObjects.Text;
    private keyboardFrame!: Phaser.GameObjects.Image;
    private keyboardInputFrame!: Phaser.GameObjects.Image;
    private rejectButton!: UIActionButton;
    private rightSideOptionsFrame!: Phaser.GameObjects.Image;
    private spaceButton!: Phaser.GameObjects.Text;
    private timer = 0;

    public constructor() {
        super('Keyboard');
    }

    public create() {
        this.keyboardInputTextArray = [];
        this.keyboardButtonDictionary = {};
        this.capsLock = false;
        this.keyboardFrame = this.add.image(
            40, 380, 'sidedialogframe'
        )
            .setOrigin(0, 0);

        this.keyboardInputFrame = this.add.image(
            40, 273, 'keyboardInputFrame'
        )
            .setOrigin(0, 0);

        this.createKeyboardKeys();

        // create the cursor rectangle
        this.cursor = this.add.rectangle(
            // position it at the location of the next letter
            65,
            328,
            // set its width and height to match the size of a letter
            37,
            50,
            // set its color to white
            0xbcbcbc
        )
            .setVisible(true);

        this.createKeyboardInputText();

        this.rightSideOptionsFrame = this.add.image(
            670,
            380,
            'sideoptionsframe'
        )
            .setOrigin(0, 0);

        this.acceptButton = new UIActionButton(
            this,
            710,
            415,
            'checkbutton',
            'checkbutton',
            'Accept',
            () => {
                eventsCenter.emit(
                    'keyboardaccept',
                    [
                        this.getFullStringFromInput()
                    ]
                );
                this.scene.stop();
            }
        );

        this.rejectButton = new UIActionButton(
            this,
            710,
            465,
            'crossbutton',
            'crossbutton',
            'Reject',
            () => {

                eventsCenter.emit(
                    'keyboardreject'
                );
                this.scene.stop();
            }
        );

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
                // check if string is already too long
                if (
                    this.getFullStringFromInput().length === 14
                ) {
                    // cut the last letter off the string
                    const stringMinusLastLetter = this.getFullStringFromInput().slice(0, -1);
                    // set the input to the modified with the pressed character appended
                    this.setInputFromString(
                        stringMinusLastLetter + ' '
                    );
                }
                // string might be 14 characters long or might not end with an underscore
                //  but not both
                else {
                    // set the input text to...
                    this.setInputFromString(
                        // the input text without trailing underscores plus the pressed character
                        this.getFullStringFromInput() + ' '
                    );
                    if (this.getFullStringFromInput().length < 14) {
                        this.cursor.setX(this.cursor.x + 43);
                    }
                }
            });

        this.deleteButton = this.add.text(
            580,
            480,
            'del',
            {
                fontSize: '70px',
                color: '#fff',
                fontFamily: 'CustomFont'
            }
        )
            .setInteractive()
            .on('pointerdown', () => {
                const originalString = this.getFullStringFromInput();
                if (originalString.length === 0) {
                    return;
                }
                const stringMinusLastLetter = originalString.slice(0, -1);
                this.setInputFromString(stringMinusLastLetter);
                if (stringMinusLastLetter.length === 13) {
                    return;
                }
                this.cursor.setX(this.cursor.x - 43);

            });

        this.capsLockButton = this.add.text(
            545,
            530,
            'caps',
            {
                fontSize: '70px',
                color: '#fff',
                fontFamily: 'CustomFont'
            }
        )
            .setInteractive()
            .on('pointerdown', () => {
                this.capsLock = !this.capsLock;
                for (const keyboardButton of Object.values(this.keyboardButtonDictionary)) {
                    if (this.capsLock) {
                        keyboardButton.setText(keyboardButton.text.toUpperCase());

                    }
                    else {
                        keyboardButton.setText(keyboardButton.text.toLowerCase());
                    }
                }
            });
    }

    public update(time: number, delta: number) {
        this.timer += delta;
        while(this.timer > 1000) {
            this.timer -= 1000;

            if (!this.cursor.visible) {
                this.cursor.setVisible(true);
            }

            else {
                this.cursor.setVisible(false);
            }
        }
    }

    private createKeyboardInputText() {

        for (let i = 0; i < 14; i++) {
            this.keyboardInputTextArray.push(
                this.add.text(
                    65 + (i * 43),
                    328,
                    '',
                    {
                        fontSize: '70px',
                        color: '#fff',
                        fontFamily: 'CustomFont',
                    })
                    .setOrigin(0.5, 0.5)
            );
        }
    }

    private createKeyboardKeys() {
        for (const [rowIndex, row] of this.keysList.entries()) {
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
                        let adjustedChar = char;
                        if (this.capsLock) {
                            adjustedChar = char.toUpperCase();
                        }

                        // check that the string length is 14 and doesn't end with an underscore
                        if (
                            this.getFullStringFromInput().length === 14
                        ) {
                            // cut the last letter off the string
                            const stringMinusLastLetter = this.getFullStringFromInput().slice(0, -1);
                            // set the input to the modified with the pressed character appended
                            this.setInputFromString(
                                stringMinusLastLetter + adjustedChar
                            );
                        }
                        // string might be 14 characters long or might not end with an underscore
                        //  but not both
                        else {
                            // set the input text to...
                            this.setInputFromString(
                                // the input text without trailing underscores plus the pressed character
                                this.getFullStringFromInput() + adjustedChar
                            );
                            if (this.getFullStringFromInput().length < 14) {
                                this.cursor.setX(this.cursor.x + 43);
                            }
                        }
                    });
            }
        }
    }

    private getFullStringFromInput() {
        let string = '';
        for (const inputCharacter of this.keyboardInputTextArray) {
            if (inputCharacter.text !== '') {
                string += inputCharacter.text;
            }
        }
        return string;
    }

    private setInputFromString(string: string) {
        // setting input from string
        for (let i = 0; i < this.keyboardInputTextArray.length; i++) {
            this.keyboardInputTextArray[i].setText(string[i] ?? '');
        }
    }
}