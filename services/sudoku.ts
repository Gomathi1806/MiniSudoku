
import { Grid, Difficulty, GameMode } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

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

interface PuzzleResponse {
    initial: Grid;
    solved: Grid;
    message?: string;
}

export const generatePuzzle = async (difficulty: Difficulty, gameMode: GameMode): Promise<PuzzleResponse> => {
    let apiKey: string | undefined;

    // Safely access process.env only if it exists.
    // This prevents crashes in browser environments or CI pipelines where 'process' is not defined.
    if (typeof process !== 'undefined' && process.env) {
        apiKey = process.env.API_KEY;
    }
    
    // SECURITY CHECK: Do not expose API key on the client.
    // In a real app, this check should happen on a server proxy.
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
        console.warn("API key not found or is a placeholder. Using offline puzzle generator. See .env.example for instructions.");
        return { 
            ...generatePuzzleOffline(difficulty, gameMode),
            message: "Using offline mode. Add a Gemini API key for AI puzzles."
        };
    }

    try {
        const config = gameConfigs[gameMode];
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Generate a ${config.SIZE}x${config.SIZE} Sudoku puzzle with ${difficulty} difficulty.
        The sub-grids (boxes) are ${config.BOX_SIZE_ROW}x${config.BOX_SIZE_COL}.
        Provide the initial puzzle grid and the fully solved grid.
        The grid should be a 2D array of numbers, where 0 represents an empty cell in the initial grid.
        The size of the grid must be ${config.SIZE}x${config.SIZE}.
        The numbers used must be from 1 to ${config.SIZE}.
        Ensure the puzzle is valid and has a unique solution.`;
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                initial: {
                    type: Type.ARRAY,
                    description: `The initial ${config.SIZE}x${config.SIZE} Sudoku grid with some cells empty (represented by 0).`,
                    items: {
                        type: Type.ARRAY,
                        items: { type: Type.INTEGER }
                    }
                },
                solved: {
                    type: Type.ARRAY,
                    description: `The complete solved ${config.SIZE}x${config.SIZE} Sudoku grid.`,
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
            puzzle.initial && Array.isArray(puzzle.initial) && puzzle.initial.length === config.SIZE &&
            puzzle.solved && Array.isArray(puzzle.solved) && puzzle.solved.length === config.SIZE
        ) {
            return puzzle;
        } else {
            console.error("AI response format is invalid. Falling back to offline generation.");
            return { 
                ...generatePuzzleOffline(difficulty, gameMode),
                message: "AI response was invalid. Using offline mode."
            };
        }

    } catch (error) {
        console.error("Error generating puzzle with AI:", error);
        console.log("Falling back to offline puzzle generation.");
        return { 
            ...generatePuzzleOffline(difficulty, gameMode),
            message: "AI puzzle generation failed. Using offline mode."
        };
    }
};
