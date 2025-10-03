import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SudokuGrid from './components/SudokuGrid';
import Controls from './components/Controls';
import NumberPad from './components/NumberPad';
import { generatePuzzle, findEmptyCell, gameConfigs } from './services/sudoku';
import { Grid, Cell, Difficulty, GameMode } from './types';
import { useCelo } from './useCelo';

const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.Mini);
  const [initialGrid, setInitialGrid] = useState<Grid>([]);
  const [solvedGrid, setSolvedGrid] = useState<Grid>([]);
  const [currentGrid, setCurrentGrid] = useState<Grid>([]);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);

  const { connectWallet, sendCUSDForHint, address, isConnected, error: celoError } = useCelo();

  const config = useMemo(() => gameConfigs[gameMode], [gameMode]);
  const size = useMemo(() => config.SIZE, [config]);

  const newGame = useCallback(async () => {
    setIsLoading(true);
    setMessage('');
    setSelectedCell(null);
    setIsSolved(false);
    try {
      const { initial, solved } = await generatePuzzle(difficulty, gameMode);
      setInitialGrid(initial);
      setSolvedGrid(solved);
      setCurrentGrid(JSON.parse(JSON.stringify(initial)));
    } catch (error) {
        console.error("Failed to start a new game:", error);
        setMessage("Oops! Could not generate a new puzzle. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, [difficulty, gameMode]);

  useEffect(() => {
    newGame();
  }, [newGame]);
  
  useEffect(() => {
    if (celoError) {
        setMessage(celoError);
        const timer = setTimeout(() => {
            setMessage(prev => prev === celoError ? '' : prev);
        }, 3000); 
        return () => clearTimeout(timer);
    }
  }, [celoError]);

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
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
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
  
  const handleGameModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGameMode(e.target.value as GameMode);
  };

  const handleCheck = () => {
    if (isSolved) return;
    let errors = 0;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (currentGrid[i][j] !== 0 && currentGrid[i][j] !== solvedGrid[i][j]) {
          errors++;
        }
      }
    }
    setMessage(errors > 0 ? `Found ${errors} incorrect number(s).` : 'Looking good so far!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleHint = async () => {
    if (isSolved || isHintLoading || isLoading) return;

    const emptyCell = findEmptyCell(currentGrid);
    if (!emptyCell) {
      setMessage("No empty cells left for a hint!");
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    
    setIsHintLoading(true);
    setMessage('Processing payment for hint...');
    const paymentSuccessful = await sendCUSDForHint();
    
    if (paymentSuccessful) {
        setMessage('Payment successful! Revealing hint.');
        const [row, col] = emptyCell;
        const correctValue = solvedGrid[row][col];
        setSelectedCell({ row, col });
        handleNumberInput(correctValue);
        setTimeout(() => setMessage(''), 2000);
    }
    
    setIsHintLoading(false);
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
            <header className="text-center mb-4 w-full">
              <div className="flex justify-between items-center mb-2">
                <div className="w-24"></div> {/* Spacer */}
                <h1 className="text-4xl font-bold text-cyan-400">Farcaster Sudoku</h1>
                <div className="text-right w-24">
                    {isConnected && address ? (
                        <div className="bg-slate-700 text-sm text-green-400 font-mono px-3 py-1.5 rounded-md" title={address}>
                            {truncateAddress(address)}
                        </div>
                    ) : (
                        <button 
                            onClick={connectWallet}
                            className="px-3 py-1.5 rounded-md font-semibold text-sm transition-all duration-200 bg-green-600 hover:bg-green-500 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-400"
                        >
                            Connect
                        </button>
                    )}
                </div>
              </div>
              <p className="text-slate-400">A {gameMode} logic puzzle powered by Goms.</p>
            </header>
            
            <div className="relative">
                 {(isLoading || isHintLoading) && (
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
                    size={size}
                />
            </div>
            
            <p className={`text-center mt-3 h-6 transition-opacity duration-300 ${message ? 'opacity-100' : 'opacity-0'}`}>
                {isSolved ? <span className="text-green-400 font-semibold">{message}</span> : <span>{message}</span>}
            </p>

            <NumberPad 
                onNumberClick={handleNumberInput} 
                onEraseClick={handleErase}
                isCellSelected={selectedCell !== null && !isSolved}
                size={size}
            />
            <Controls 
                difficulty={difficulty} 
                onDifficultyChange={handleDifficultyChange}
                gameMode={gameMode}
                onGameModeChange={handleGameModeChange}
                onNewGame={newGame} 
                onCheck={handleCheck} 
                onHint={handleHint} 
                onSolve={handleSolve}
                isSolved={isSolved}
                isLoading={isLoading || isHintLoading}
                isWalletConnected={isConnected}
            />
        </div>
    </main>
  );
};

export default App;