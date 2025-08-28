import { Grid, Difficulty } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

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

const generatePuzzleOffline = (difficulty: Difficulty): { initial: Grid; solved: Grid } => {
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
  
  const cells: {row: number, col: number}[] = [];
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
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


export const generatePuzzle = async (difficulty: Difficulty): Promise<{ initial: Grid; solved: Grid }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate a 4x4 Sudoku puzzle with ${difficulty} difficulty.
        Provide the initial puzzle grid and the fully solved grid.
        The grid should be a 2D array of numbers, where 0 represents an empty cell in the initial grid.
        The size of the grid must be 4x4.
        The numbers used must be 1, 2, 3, and 4.
        Ensure the puzzle is valid and has a unique solution.`;
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                initial: {
                    type: Type.ARRAY,
                    description: "The initial 4x4 Sudoku grid with some cells empty (represented by 0).",
                    items: {
                        type: Type.ARRAY,
                        items: { type: Type.INTEGER }
                    }
                },
                solved: {
                    type: Type.ARRAY,
                    description: "The complete solved 4x4 Sudoku grid.",
                    items: {
                        type: Type.ARRAY,
                        items: { type: Type.INTEGER }
                    }
                }
            },
            required: ["initial", "solved"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonString = response.text.trim();
        const puzzle = JSON.parse(jsonString);

        if (
            puzzle.initial && Array.isArray(puzzle.initial) && puzzle.initial.length === SIZE &&
            puzzle.solved && Array.isArray(puzzle.solved) && puzzle.solved.length === SIZE
        ) {
            return puzzle;
        } else {
            console.error("AI response format is invalid. Falling back to offline generation.");
            return generatePuzzleOffline(difficulty);
        }

    } catch (error) {
        console.error("Error generating puzzle with AI:", error);
        console.log("Falling back to offline puzzle generation.");
        return generatePuzzleOffline(difficulty);
    }
};
