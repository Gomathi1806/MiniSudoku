import React, { useState, useEffect, useCallback } from 'react';
import SudokuGrid from './components/SudokuGrid';
import Controls from './components/Controls';
import NumberPad from './components/NumberPad';
import { generatePuzzle, findEmptyCell } from './services/sudoku';
import { Grid, Cell, Difficulty } from './types';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [initialGrid, setInitialGrid] = useState<Grid>([]);
  const [solvedGrid, setSolvedGrid] = useState<Grid>([]);
  const [currentGrid, setCurrentGrid] = useState<Grid>([]);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const newGame = useCallback(async () => {
    setIsLoading(true);
    setMessage('');
    setSelectedCell(null);
    setIsSolved(false);
    try {
      const { initial, solved } = await generatePuzzle(difficulty);
      setInitialGrid(initial);
      setSolvedGrid(solved);
      setCurrentGrid(JSON.parse(JSON.stringify(initial)));
    } catch (error) {
        console.error("Failed to start a new game:", error);
        setMessage("Oops! Could not generate a new puzzle. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    newGame();
  }, [newGame]);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isSolved) return;
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== 0) return;

    const newGrid = JSON.parse(JSON.stringify(currentGrid));
    newGrid[row][col] = num;
    setCurrentGrid(newGrid);

    let isFullyFilled = true;
    let hasError = false;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (newGrid[i][j] === 0) {
          isFullyFilled = false;
        }
        if (newGrid[i][j] !== 0 && newGrid[i][j] !== solvedGrid[i][j]) {
          hasError = true;
        }
      }
    }

    if (isFullyFilled && !hasError) {
      setIsSolved(true);
      setMessage('Congratulations! Puzzle solved!');
      setSelectedCell(null);
    } else {
      setMessage('');
    }
  };
  
  const handleErase = () => {
    if (!selectedCell || isSolved) return;
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== 0) return;

    const newGrid = JSON.parse(JSON.stringify(currentGrid));
    newGrid[row][col] = 0;
    setCurrentGrid(newGrid);
    setIsSolved(false);
    setMessage('');
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value as Difficulty);
  };
  
  const handleCheck = () => {
    if (isSolved) return;
    let errors = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] !== 0 && currentGrid[i][j] !== solvedGrid[i][j]) {
          errors++;
        }
      }
    }
    setMessage(errors > 0 ? `Found ${errors} incorrect number(s).` : 'Looking good so far!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleHint = () => {
    if (isSolved) return;
    const emptyCell = findEmptyCell(currentGrid);
    if (emptyCell) {
      const [row, col] = emptyCell;
      const correctValue = solvedGrid[row][col];
      setSelectedCell({ row, col });
      
      const newGrid = JSON.parse(JSON.stringify(currentGrid));
      newGrid[row][col] = correctValue;
      setCurrentGrid(newGrid);

      // Re-run the solved check after applying the hint
      handleNumberInput(correctValue);
    } else {
      setMessage("No empty cells left for a hint!");
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleSolve = () => {
    setCurrentGrid(solvedGrid);
    setIsSolved(true);
    setMessage('Puzzle Solved!');
    setSelectedCell(null);
  };

  if (isLoading && initialGrid.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-400">Generating a new puzzle with Goms...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto">
            <header className="text-center mb-4">
                <h1 className="text-4xl font-bold text-cyan-400">Farcaster Mini Sudoku</h1>
                <p className="text-slate-400">A 4x4 logic puzzle powered by Goms.</p>
            </header>
            
            <div className="relative">
                 {isLoading && (
                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-20 rounded-lg">
                        <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                 )}
                <SudokuGrid 
                    grid={currentGrid} 
                    initialGrid={initialGrid}
                    solvedGrid={solvedGrid}
                    selectedCell={selectedCell} 
                    onCellClick={handleCellClick} 
                />
            </div>
            
            <p className={`text-center mt-3 h-6 transition-opacity duration-300 ${message ? 'opacity-100' : 'opacity-0'}`}>
                {isSolved ? <span className="text-green-400 font-semibold">{message}</span> : <span>{message}</span>}
            </p>

            <NumberPad 
                onNumberClick={handleNumberInput} 
                onEraseClick={handleErase}
                isCellSelected={selectedCell !== null && !isSolved}
            />
            <Controls 
                difficulty={difficulty} 
                onDifficultyChange={handleDifficultyChange}
                onNewGame={newGame} 
                onCheck={handleCheck} 
                onHint={handleHint} 
                onSolve={handleSolve}
                isSolved={isSolved}
                isLoading={isLoading}
            />
        </div>
    </main>
  );
};

export default App;