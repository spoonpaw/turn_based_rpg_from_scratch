import Item from '../classes/Item';

export interface Equipment {
    body: Item | undefined;
    head: Item | undefined;
    offhand: Item | undefined;
    weapon: Item | undefined;
    [key: string]: Item | undefined;
}