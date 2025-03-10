export type FieldElement = {
    x: number;
    y: number;
    type: "Wall" | "SoftWall" | "Bomb";
};
export type Player = {
    hash: string;
    username: string;
    color: string;
    x: number;
    y: number;
};
export type Playground = {
    fields: FieldElement[][]; // from server
    players: Player[];
    log: string[];
};
/*
[
  [null, { x: 1, y: 0, type: 'Wall' }, null...],
  [null, { x: 1, y: 0, type: 'Wall' }, null...],
]
*/
