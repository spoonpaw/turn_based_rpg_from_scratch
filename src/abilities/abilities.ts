export const abilities: IAbility[] = [
    {
        name: 'Guard',
        description: 'Protects ally or self from single target attacks. Reduces damage from all single target attacks when used on self.',
        type: 'passive',
        targets: ['self', 'ally'],
        turnDuration: 1
    },

    // more abilities go here
];

export interface IAbility {
    name: string;
    description: string;
    type: string;
    targets: string|string[];
    turnDuration?: number;
}