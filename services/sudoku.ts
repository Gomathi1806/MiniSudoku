
import { Grid, Difficulty } from '../types';

const SIZE = 4;
const BOX_SIZE = 2;

export const isValid = (grid: Grid, row: number, col: number, num: number): boolean => {
  // Check row
  for (let i = 0; i < SIZE; i++) {
    if (grid[row][i] === num) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < SIZE; i++) {
    if (grid[i][col] === num) {
      return false;
    }
  }

  // Check 2x2 box
  const boxRowStart = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxColStart = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (grid[boxRowStart + i][boxColStart + j] === num) {
        return false;
      }
    }
  }

  return true;
};

export const findEmptyCell = (grid: Grid): [number, number] | null => {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (grid[i][j] === 0) {
        return [i, j];
      }
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


export const solve = (grid: Grid): boolean => {
  const find = findEmptyCell(grid);
  if (!find) {
    return true; // Puzzle is solved
  }
  const [row, col] = find;
  const numbers = shuffle([1, 2, 3, 4]);

  for (const num of numbers) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;

      if (solve(grid)) {
        return true;
      }

      grid[row][col] = 0; // Backtrack
    }
  }

  return false;
};


export const generatePuzzle = (difficulty: Difficulty): { initial: Grid; solved: Grid } => {
  const solvedGrid: Grid = Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
  solve(solvedGrid);

  const initialGrid = JSON.parse(JSON.stringify(solvedGrid));

  let cellsToRemove = 0;
  switch (difficulty) {
    case Difficulty.Easy:
      cellsToRemove = 6;
      break;
    case Difficulty.Medium:
      cellsToRemove = 8;
      break;
    case Difficulty.Hard:
      cellsToRemove = 10;
      break;
  }
  
  const cells = [];
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      cells.push({row: i, col: j});
    }
  }
  shuffle(cells);

  for (let i = 0; i < cellsToRemove; i++) {
    const {row, col} = cells[i];
    if (initialGrid[row][col] !== 0) {
        initialGrid[row][col] = 0;
    }
  }

  return { initial: initialGrid, solved: solvedGrid };
};
