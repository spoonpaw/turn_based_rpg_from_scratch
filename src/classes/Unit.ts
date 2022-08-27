import Phaser from 'phaser';
import MenuItem from './MenuItem';

export default class Unit extends Phaser.GameObjects.Sprite{
    private maxHp: number;
    private damage: number;
    private hp: number;
    public living: boolean;
    private menuItem!: MenuItem | undefined;
    
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        type: string,
        hp: number,
        damage: number
    ) {
        super(scene, x, y, texture, frame);
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage
        this.living = true;
        this.menuItem = undefined;
    }

    setMenuItem(item: MenuItem) {
        this.menuItem = item;
    }

    attack(target: Unit) {
        if (target.living) {
            target.takeDamage(this.damage);
            this.scene.events.emit(
                'Message',
                `${this.type} attacks ${target.type} for ${this.damage} damage.`
            );
        }
    }

    takeDamage(damage: number) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.menuItem?.unitKilled();
            this.living = false;
            this.visible = false;
            this.menuItem = undefined;
        }
    }
}