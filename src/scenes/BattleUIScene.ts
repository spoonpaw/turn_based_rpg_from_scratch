import Phaser from 'phaser';
import HeroesMenu from '../classes/HeroesMenu';
import ActionsMenu from '../classes/ActionsMenu';
import EnemiesMenu from '../classes/EnemiesMenu';
import BattleScene from './BattleScene';
import Message from '../classes/Message';

export default class BattleUIScene extends Phaser.Scene{
    private menus!: Phaser.GameObjects.Container;
    private heroesMenu!: HeroesMenu;
    private actionsMenu!: ActionsMenu;
    private enemiesMenu!: EnemiesMenu;
    private currentMenu: (ActionsMenu | HeroesMenu | EnemiesMenu) | undefined;
    private battleScene!: BattleScene;
    private message!: Message;
    constructor() {
        super('BattleUI');
    }

    create() {
        this.add.image(2, 477, 'prefab1')
            .setOrigin(0, 0);

        this.add.image(227, 477, 'prefab1')
            .setOrigin(0, 0);

        this.add.image(453, 477, 'prefab2')
            .setOrigin(0, 0);

        // basic container to hold all menus
        this.menus = this.add.container();

        this.heroesMenu = new HeroesMenu(475, 500, this);
        this.actionsMenu = new ActionsMenu(250, 500, this);
        this.enemiesMenu = new EnemiesMenu(20, 500, this);

        // the currently selected menu
        this.currentMenu = this.actionsMenu;

        // add menus to the container
        this.menus.add(this.heroesMenu);
        this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);

        this.battleScene = <BattleScene>this.scene.get('Battle');

        // listen for keyboard events
        this.input.keyboard.on('keydown', this.onKeyInput, this);

        // when its player cunit turn to move
        this.battleScene.events.on('PlayerSelect', this.onPlayerSelect, this);

        // when the action on the menu is selected
        // for now we have only one action, so we don't send an action id
        this.events.on('SelectedAction', this.onSelectedAction, this);

        // an enemy is selected
        this.events.on('Enemy', this.onEnemy, this);

        // when the scene receives wake event
        this.sys.events.on('wake', this.createMenu, this);

        // the message describing the current action
        this.message = new Message(this, this.battleScene.events);
        this.add.existing(this.message);

        this.createMenu();
    }

    onEnemy(index: number) {
        this.heroesMenu.deselect();
        this.actionsMenu.deselect();
        this.enemiesMenu.deselect();
        this.currentMenu = undefined;
        this.battleScene.receivePlayerSelection('attack', index);
    }

    onPlayerSelect(id: number) {
        this.heroesMenu.select(id);
        this.actionsMenu.select(0);
        this.currentMenu = this.actionsMenu;
    }
    onSelectedAction() {
        this.currentMenu = this.enemiesMenu;
        this.enemiesMenu.select(0);
    }

    remapHeroes() {
        const heroes = this.battleScene.heroes;
        this.heroesMenu.remap(heroes);
    }

    remapEnemies() {
        const enemies = this.battleScene.enemies;
        this.enemiesMenu.remap(enemies);
    }
    onKeyInput(event: KeyboardEvent) {
        if (this.currentMenu && this.currentMenu.selected) {
            if (event.code === 'ArrowUp') {
                this.currentMenu.moveSelectionUp();
            }
            else if (event.code === 'ArrowDown') {
                this.currentMenu.moveSelectionDown();
            }
            // eslint-disable-next-line no-empty
            else if (event.code === 'Shift') {

            }
            else if (event.code === 'Space') {
                this.currentMenu.confirm();
            }
        }
    }

    createMenu() {
        // map hero menu items to heroes
        this.remapHeroes();
        // map enemies menu items to enemies
        this.remapEnemies();
        // first move
        this.battleScene.nextTurn();
    }
}