export default class Unit extends Phaser.GameObjects.Sprite{
    private maxHp: number;
    damage: number;
    public hp: number;
    public living: boolean;
    private damageTween!: Phaser.Tweens.Tween;
    public initiative: number;
    
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        type: string,
        hp: number,
        damage: number,
        initiative: number
    ) {
        super(scene, x, y, texture, frame);
        this.scene = scene;
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage
        this.living = true;
        this.initiative = initiative;
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
            this.living = false;
            this.visible = false;
        }
        else {
            this.damageTween = this.scene.tweens.add({
                targets: this,
                duration: 100,
                repeat: 3,
                alpha: 0,
                yoyo: true
            });
        }
    }
}