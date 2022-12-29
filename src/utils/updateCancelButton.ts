// create a new utility file with a function to update the cancel button and its components
import UIActionButton from '../classes/UIActionButton';

export function updateCancelButton(
    cancelButton: UIActionButton,
    cancelFrame: Phaser.GameObjects.Image,
    x: number,
    y: number,
    text: string,
    show: boolean
) {
    cancelFrame.setX(x);
    cancelFrame.setY(y);

    cancelButton.setX(x + 32);
    cancelButton.setY(y + 35);
    cancelButton.buttonText.setX(x + 52);
    cancelButton.buttonText.setY(y + 10);
    cancelButton.buttonText.setText(text);
    cancelButton.setVisible(true);
    cancelButton.buttonText.setVisible(true);

    // use the show parameter to control the visibility of the cancel frame and its components
    cancelFrame.setVisible(show);

}