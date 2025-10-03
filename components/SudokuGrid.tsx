
import React from 'react';
import { Grid, Cell } from '../types';

interface SudokuGridProps {
  grid: Grid;
  initialGrid: Grid;
  solvedGrid: Grid;
  selectedCell: Cell | null;
  onCellClick: (row: number, col: number) => void;
  size: number;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({ grid, initialGrid, solvedGrid, selectedCell, onCellClick, size }) => {
  const boxSizeRow = size === 4 ? 2 : 2;
  const boxSizeCol = size === 4 ? 2 : 3;

  const isRelated = (row: number, col: number, selected: Cell | null): boolean => {
    if (!selected) return false;
    if (row === selected.row || col === selected.col) return true;
    if (Math.floor(row / boxSizeRow) === Math.floor(selected.row / boxSizeRow) && Math.floor(col / boxSizeCol) === Math.floor(selected.col / boxSizeCol)) return true;
    return false;
  };
    
  return (
    <div className={`grid ${size === 4 ? 'grid-cols-4' : 'grid-cols-6'} gap-1 p-2 bg-slate-700 rounded-lg shadow-lg aspect-square w-full max-w-sm md:max-w-md lg:max-w-lg`}>
      {grid.map((row, rowIndex) =>
        row.map((cellValue, colIndex) => {
          const isInitial = initialGrid[rowIndex]?.[colIndex] !== 0;
          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isError = cellValue !== 0 && solvedGrid.length > 0 && cellValue !== solvedGrid[rowIndex][colIndex];
          const isHighlighted = isRelated(rowIndex, colIndex, selectedCell);
          
          const borderRight = (colIndex + 1) % boxSizeCol === 0 && colIndex < size - 1 ? 'border-r-2 border-r-slate-400' : '';
          const borderBottom = (rowIndex + 1) % boxSizeRow === 0 && rowIndex < size - 1 ? 'border-b-2 border-b-slate-400' : '';

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => !isInitial && onCellClick(rowIndex, colIndex)}
              className={`
                flex items-center justify-center font-bold aspect-square
                ${size === 4 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}
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