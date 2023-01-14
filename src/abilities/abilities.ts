export const abilities: IAbility[] = [
    {
        name: 'Guard',
        description: 'Protects ally or self from single target attacks. Reduces damage from all single target attacks when used on self.',
        type: 'passive',
        targets: ['self', 'ally'],
        turnDuration: 1,
        key: 'shieldbutton',
        activeKey: 'shieldbuttonactive',
        element: 'physical',
        power: 0,
        accuracy: 100,
        resourceCost: 0,
        useTemplate: '${abilityUser} steps forward to defend ${abilityTarget}.',
        useSelfTemplate: '${abilityUser} takes a defensive stance',
        targetTemplate: '',
        dodgeTemplate: '',
        targetCriticalHitTemplate: ''
    },
    {
        name: 'Spiky Seeds',
        description: 'Attack all enemies with a burst of spiky seeds, dealing physical damage to all enemies.',
        type: 'active',
        targets: 'enemies',
        turnDuration: 1,
        key: 'bagbutton',
        activeKey: 'bagbutton',
        element: 'physical',
        power: 3,
        accuracy: 90,
        resourceCost: 50,
        useTemplate: '${abilityUser} shoots out a burst of spiky seeds at its enemies!',
        useSelfTemplate: '',
        targetTemplate: '${abilityTarget} is hit by the spiky seeds and takes ${damage} damage!',
        dodgeTemplate: '${abilityTarget} manages to dodge the spiky seeds and avoids taking any damage!',
        targetCriticalHitTemplate: ''

    },
    {
        name: 'Power Strike',
        description: 'A fierce attack that deals extra damage to a single target.',
        type: 'active',
        targets: 'enemy',
        turnDuration: 1,
        key: 'powerstrikebutton',
        activeKey: 'powerstrikebuttonactive',
        element: 'physical',
        power: 2,
        accuracy: 100,
        resourceCost: 40,
        useTemplate: '',
        useSelfTemplate: '',
        targetTemplate: '${abilityUser} lashes out with a Power Strike against ${abilityTarget} dealing ${damage} damage!',
        targetCriticalHitTemplate: '${abilityUser} lands a critical Power Strike on ${abilityTarget}, dealing ${damage} damage!',
        dodgeTemplate: '${abilityUser} uses Power Strike against ${abilityTarget}, but ${abilityTarget} manages to dodge and avoid taking any damage!',
    }
];

export interface IAbility {
    name: string;
    description: string;
    type: string;
    targets: string|string[];
    turnDuration?: number;
    key: string;
    activeKey: string;
    element: string;
    power: number;
    accuracy: number;
    resourceCost: number;
    useTemplate: string;
    targetTemplate: string;
    dodgeTemplate: string;
    useSelfTemplate: string;
    targetCriticalHitTemplate: string;
}