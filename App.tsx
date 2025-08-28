
import React, { useState, useEffect, useCallback } from 'react';
import SudokuGrid from './components/SudokuGrid';
import Controls from './components/Controls';
import NumberPad from './components/NumberPad';
import { generatePuzzle, solve, findEmptyCell } from './services/sudoku';
import { Grid, Cell, Difficulty } from './types';

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [initialGrid, setInitialGrid] = useState<Grid>([]);
  const [solvedGrid, setSolvedGrid] = useState<Grid>([]);
  const [currentGrid, setCurrentGrid] = useState<Grid>([]);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const newGame = useCallback(() => {
    const { initial, solved } = generatePuzzle(difficulty);
    setInitialGrid(initial);
    setSolvedGrid(solved);
    setCurrentGrid(JSON.parse(JSON.stringify(initial)));
    setSelectedCell(null);
    setIsSolved(false);
    setMessage('');
  }, [difficulty]);

  useEffect(() => {
    newGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const newGrid = JSON.parse(JSON.stringify(currentGrid));
    newGrid[row][col] = num;
    setCurrentGrid(newGrid);
    checkIfSolved(newGrid);
  };
  
  const handleEraseClick = () => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
     if (initialGrid[row][col] === 0) {
        const newGrid = JSON.parse(JSON.stringify(currentGrid));
        newGrid[row][col] = 0;
        setCurrentGrid(newGrid);
        setIsSolved(false);
        setMessage('');
    }
  };

  const checkIfSolved = (grid: Grid) => {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0 || grid[i][j] !== solvedGrid[i][j]) {
                setIsSolved(false);
                return;
            }
        }
    }
    setIsSolved(true);
    setMessage('Congratulations! You solved it!');
  };

  const handleCheck = () => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] !== 0 && currentGrid[i][j] !== solvedGrid[i][j]) {
          setMessage('Something is not correct. Keep trying!');
          return;
        }
      }
    }
    checkIfSolved(currentGrid);
    if (!isSolved && findEmptyCell(currentGrid)) {
        setMessage('So far so good! Keep going.');
    }
  };
  
  const handleHint = () => {
      const emptyCell = findEmptyCell(currentGrid);
      if (emptyCell) {
          const [row, col] = emptyCell;
          const newGrid = JSON.parse(JSON.stringify(currentGrid));
          newGrid[row][col] = solvedGrid[row][col];
          setCurrentGrid(newGrid);
          setSelectedCell({row, col});
          checkIfSolved(newGrid);
      } else {
          setMessage("No empty cells left to give a hint!");
      }
  };

  const handleSolve = () => {
    setCurrentGrid(JSON.parse(JSON.stringify(solvedGrid)));
    setIsSolved(true);
    setMessage('Puzzle solved!');
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value as Difficulty);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-amber-500/30">
        <header className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider">Mini Sudoku</h1>
            <p className="text-slate-400 mt-1">A 4x4 logic puzzle</p>
        </header>
        
        <main className="flex flex-col items-center">
            {isSolved && message && (
                <div className="mb-4 p-3 bg-green-500/20 text-green-300 border border-green-500 rounded-md text-center font-semibold">
                    {message}
                </div>
            )}
            {!isSolved && message && (
                 <div className="mb-4 p-3 bg-yellow-500/20 text-yellow-300 border border-yellow-500 rounded-md text-center font-semibold">
                    {message}
                </div>
            )}
            
            <SudokuGrid 
                grid={currentGrid} 
                initialGrid={initialGrid}
                solvedGrid={solvedGrid}
                selectedCell={selectedCell} 
                onCellClick={handleCellClick} 
            />
            <NumberPad onNumberClick={handleNumberInput} onEraseClick={handleEraseClick} isCellSelected={!!selectedCell}/>
            <Controls
                difficulty={difficulty}
                onDifficultyChange={handleDifficultyChange}
                onNewGame={newGame}
                onCheck={handleCheck}
                onHint={handleHint}
                onSolve={handleSolve}
                isSolved={isSolved}
            />
        </main>
        
        <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>Built by a world-class senior frontend React engineer.</p>
        </footer>
    </div>
  );
};

export default App;
