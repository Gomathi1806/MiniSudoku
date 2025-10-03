import { Grid, Difficulty, GameMode } from '../types';

interface GameConfig {
  SIZE: number;
  BOX_SIZE_ROW: number;
  BOX_SIZE_COL: number;
  NUMBERS: number[];
  EMPTY_CELLS: {
    [Difficulty.Easy]: number;
    [Difficulty.Medium]: number;
    [Difficulty.Hard]: number;
  };
}

export const gameConfigs: Record<GameMode, GameConfig> = {
  [GameMode.Mini]: {
    SIZE: 4,
    BOX_SIZE_ROW: 2,
    BOX_SIZE_COL: 2,
    NUMBERS: [1, 2, 3, 4],
    EMPTY_CELLS: {
      [Difficulty.Easy]: 6,
      [Difficulty.Medium]: 8,
      [Difficulty.Hard]: 10,
    }
  },
  [GameMode.Classic]: {
    SIZE: 6,
    BOX_SIZE_ROW: 2,
    BOX_SIZE_COL: 3,
    NUMBERS: [1, 2, 3, 4, 5, 6],
    EMPTY_CELLS: {
      [Difficulty.Easy]: 15,
      [Difficulty.Medium]: 20,
      [Difficulty.Hard]: 25,
    }
  }
};

export const isValid = (grid: Grid, row: number, col: number, num: number, config: GameConfig): boolean => {
  // Check row
  for (let i = 0; i < config.SIZE; i++) {
    if (grid[row][i] === num) return false;
  }

  // Check column
  for (let i = 0; i < config.SIZE; i++) {
    if (grid[i][col] === num) return false;
  }

  // Check box
  const boxRowStart = Math.floor(row / config.BOX_SIZE_ROW) * config.BOX_SIZE_ROW;
  const boxColStart = Math.floor(col / config.BOX_SIZE_COL) * config.BOX_SIZE_COL;
  for (let i = 0; i < config.BOX_SIZE_ROW; i++) {
    for (let j = 0; j < config.BOX_SIZE_COL; j++) {
      if (grid[boxRowStart + i][boxColStart + j] === num) return false;
    }
  }

  return true;
};

export const findEmptyCell = (grid: Grid): [number, number] | null => {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[i][j] === 0) return [i, j];
    }
  }
  return null;
};


const shuffle = <T,>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


export const solve = (grid: Grid, config: GameConfig): boolean => {
  const find = findEmptyCell(grid);
  if (!find) {
    return true; // Puzzle is solved
  }
  const [row, col] = find;
  const numbers = shuffle([...config.NUMBERS]);

  for (const num of numbers) {
    if (isValid(grid, row, col, num, config)) {
      grid[row][col] = num;

      if (solve(grid, config)) {
        return true;
      }

      grid[row][col] = 0; // Backtrack
    }
  }

  return false;
};

const generatePuzzleOffline = (difficulty: Difficulty, gameMode: GameMode): { initial: Grid; solved: Grid } => {
  const config = gameConfigs[gameMode];
  const solvedGrid: Grid = Array(config.SIZE).fill(0).map(() => Array(config.SIZE).fill(0));
  solve(solvedGrid, config);

  const initialGrid = JSON.parse(JSON.stringify(solvedGrid));

  const cellsToRemove = config.EMPTY_CELLS[difficulty];
  
  const cells: {row: number, col: number}[] = [];
  for (let i = 0; i < config.SIZE; i++) {
    for (let j = 0; j < config.SIZE; j++) {
      cells.push({row: i, col: j});
    }
  }
  shuffle(cells);

  let removed = 0;
  while(removed < cellsToRemove && cells.length > 0) {
    const cell = cells.pop();
    if(cell) {
        const {row, col} = cell;
        initialGrid[row][col] = 0;
        removed++;
    }
  }

  return { initial: initialGrid, solved: solvedGrid };
};

export const generatePuzzle = (difficulty: Difficulty, gameMode: GameMode): { initial: Grid; solved: Grid } => {
    return generatePuzzleOffline(difficulty, gameMode);
};