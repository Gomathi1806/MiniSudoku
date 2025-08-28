
import React from 'react';
import { Grid, Cell } from '../types';

interface SudokuGridProps {
  grid: Grid;
  initialGrid: Grid;
  solvedGrid: Grid;
  selectedCell: Cell | null;
  onCellClick: (row: number, col: number) => void;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({ grid, initialGrid, solvedGrid, selectedCell, onCellClick }) => {
  const isRelated = (row: number, col: number, selected: Cell | null): boolean => {
    if (!selected) return false;
    if (row === selected.row || col === selected.col) return true;
    if (Math.floor(row / 2) === Math.floor(selected.row / 2) && Math.floor(col / 2) === Math.floor(selected.col / 2)) return true;
    return false;
  };
    
  return (
    <div className="grid grid-cols-4 gap-1 p-2 bg-slate-700 rounded-lg shadow-lg aspect-square w-full max-w-sm md:max-w-md lg:max-w-lg">
      {grid.map((row, rowIndex) =>
        row.map((cellValue, colIndex) => {
          const isInitial = initialGrid[rowIndex][colIndex] !== 0;
          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isError = cellValue !== 0 && cellValue !== solvedGrid[rowIndex][colIndex];
          const isHighlighted = isRelated(rowIndex, colIndex, selectedCell);
          
          const borderRight = (colIndex + 1) % 2 === 0 && colIndex < 3 ? 'border-r-2 border-r-slate-400' : '';
          const borderBottom = (rowIndex + 1) % 2 === 0 && rowIndex < 3 ? 'border-b-2 border-b-slate-400' : '';

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => !isInitial && onCellClick(rowIndex, colIndex)}
              className={`
                flex items-center justify-center text-2xl md:text-3xl font-bold aspect-square
                ${borderRight} ${borderBottom}
                ${isInitial ? 'bg-slate-600 text-cyan-400' : 'cursor-pointer bg-slate-800 text-slate-100'}
                ${isHighlighted && !isSelected ? 'bg-slate-700/50' : ''}
                ${isSelected ? 'ring-4 ring-amber-400 z-10' : ''}
                ${isError ? '!bg-red-900/50 !text-red-400' : ''}
                transition-all duration-150 rounded-md
              `}
            >
              {cellValue !== 0 ? cellValue : ''}
            </div>
          );
        })
      )}
    </div>
  );
};

export default SudokuGrid;
