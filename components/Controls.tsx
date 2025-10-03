import React from 'react';
import { Difficulty, GameMode } from '../types';

interface ControlsProps {
  difficulty: Difficulty;
  onDifficultyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  gameMode: GameMode;
  onGameModeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onNewGame: () => void;
  onCheck: () => void;
  onHint: () => void;
  onSolve: () => void;
  isSolved: boolean;
  isLoading: boolean;
  isWalletConnected: boolean;
}

const Button: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; disabled?: boolean; title?: string; }> = ({ onClick, children, className = '', disabled=false, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${className} ${disabled ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white focus:ring-cyan-400'}`}
  >
    {children}
  </button>
);

const Controls: React.FC<ControlsProps> = ({ difficulty, onDifficultyChange, gameMode, onGameModeChange, onNewGame, onCheck, onHint, onSolve, isSolved, isLoading, isWalletConnected }) => {
  return (
    <div className="w-full max-w-sm md:max-w-md lg:max-w-lg mt-4 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
                <label htmlFor="gameMode" className="text-sm font-medium text-slate-400">Mode</label>
                <select 
                    id="gameMode" 
                    value={gameMode} 
                    onChange={onGameModeChange}
                    disabled={isLoading}
                    className="bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
                >
                    {Object.entries(GameMode).map(([key, value]) => <option key={value} value={value}>{key}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="difficulty" className="text-sm font-medium text-slate-400">Difficulty</label>
                <select 
                    id="difficulty" 
                    value={difficulty} 
                    onChange={onDifficultyChange}
                    disabled={isLoading}
                    className="bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
                >
                    {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1 justify-end">
                 <Button onClick={onNewGame} disabled={isLoading}>New Game</Button>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
            <Button onClick={onCheck} disabled={isSolved || isLoading}>Check</Button>
            <Button 
                onClick={onHint} 
                disabled={isSolved || isLoading || !isWalletConnected}
                title={!isWalletConnected ? "Connect wallet to get a hint" : ""}
            >
                Hint (0.01 cUSD)
            </Button>
            <Button onClick={onSolve} disabled={isSolved || isLoading} className="bg-amber-600 hover:bg-amber-500 focus:ring-amber-400">Solve</Button>
        </div>
    </div>
  );
};

export default Controls;