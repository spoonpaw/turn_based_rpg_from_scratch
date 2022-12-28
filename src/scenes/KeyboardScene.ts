import UIActionButton from '../classes/UIActionButton';
import eventsCenter from '../utils/EventsCenter';

export default class KeyboardScene extends Phaser.Scene {
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
                console.log('keyboard accept button pressed');
                eventsCenter.emit(
                    'keyboardaccept',
                    [
                        this.getFullStringFromInput().split('_')[0]
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
                console.log('keyboard reject button pressed');

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
                console.log('space key pressed');
                if (
                    this.getFullStringFromInput().length === 14 &&
                    !this.getFullStringFromInput().endsWith('_')
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
                        this.getFullStringFromInput().split('_')[0] + ' '
                    );
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
                console.log('delete button clicked!');
                const originalString = this.getFullStringFromInput().split('_')[0];
                const stringMinusLastLetter = originalString.slice(0, -1);
                this.setInputFromString(stringMinusLastLetter);


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
                console.log('caps lock clicked!');
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
        while (this.timer > 1000) {
            this.timer -= 1000;

            // check if the last character of the string was an underscore
            if (this.getFullStringFromInput().endsWith('_')) {
                // set the input text to... (set it to the actual string first)
                this.setInputFromString(
                    // everything before the underscore
                    this.getFullStringFromInput().split('_')[0]
                );
            }
            else {
                if (this.getFullStringFromInput().length < 14) {
                    this.setInputFromString(
                        this.getFullStringFromInput() + '_'
                    );
                }

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
        this.keyboardInputTextArray[0].setText('_');
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
                        console.log(`${char} clicked`);
                        let adjustedChar = char;
                        if (this.capsLock) {
                            adjustedChar = char.toUpperCase();
                        }

                        // check that the string length is 14 and doesn't end with an underscore
                        if (
                            this.getFullStringFromInput().length === 14 &&
                            !this.getFullStringFromInput().endsWith('_')
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
                                this.getFullStringFromInput().split('_')[0] + adjustedChar
                            );
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