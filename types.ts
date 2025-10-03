
export type Grid = number[][];

export type Cell = {
  row: number;
  col: number;
};

export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum GameMode {
    Mini = '4x4',
    Classic = '6x6',
}
