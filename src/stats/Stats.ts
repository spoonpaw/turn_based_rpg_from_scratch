export default class Stats {
    constructor(
        public strength: number,
        public agility: number,
        public vitality: number,
        public intellect: number,
        public luck: number,
        public currentHP: number,
        public maxHP: number,
        public currentResource: number,
        public maxResource: number,
        public attack: number,
        public defense: number
    ) {
    }
}