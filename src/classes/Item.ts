export default class Item {
    constructor(
        public key: string,
        public activeKey: string,
        public name: string,
        public type: string,
        public cost: number,
        public sellPrice: number,
        public description: string,
        public hpChange?: number,
        public classes?: string,
        public minimumLevel?: number,
        public stats?: {
            strength: number,
            agility: number,
            vitality: number,
            intellect: number,
            luck: number,
            defense: number
        }
    ) {
    }
}