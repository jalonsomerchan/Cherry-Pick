export const difficultyOptions = [
  { id: 'easy', badLimit: 7, speed: 0.84, spawn: 1180 },
  { id: 'medium', badLimit: 5, speed: 1, spawn: 980 },
  { id: 'hard', badLimit: 3, speed: 1.2, spawn: 820 },
];

export const cherrySpriteSheet = {
  rows: 4,
  columns: 4,
};

export const cherrySprites = [
  { id: 'healthy-pair', kind: 'good', column: 0, row: 0 },
  { id: 'leaf-single', kind: 'good', column: 1, row: 0 },
  { id: 'burgundy-pair', kind: 'good', column: 2, row: 0 },
  { id: 'golden', kind: 'good', column: 3, row: 0 },
  { id: 'heart-twin', kind: 'good', column: 0, row: 1 },
  { id: 'cluster-three', kind: 'good', column: 1, row: 1 },
  { id: 'washed-pair', kind: 'good', column: 2, row: 1 },
  { id: 'perfect-large', kind: 'good', column: 3, row: 1 },
  { id: 'rotten', kind: 'bad', column: 0, row: 2 },
  { id: 'worm', kind: 'bad', column: 1, row: 2 },
  { id: 'cracked', kind: 'bad', column: 2, row: 2 },
  { id: 'moldy', kind: 'bad', column: 3, row: 2 },
  { id: 'bitten', kind: 'bad', column: 0, row: 3 },
  { id: 'shriveled', kind: 'bad', column: 1, row: 3 },
  { id: 'crushed', kind: 'bad', column: 2, row: 3 },
  { id: 'infected', kind: 'bad', column: 3, row: 3 },
];
