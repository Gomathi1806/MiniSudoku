
import React from 'react';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onEraseClick: () => void;
  isCellSelected: boolean;
  size: number;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, onEraseClick, isCellSelected, size }) => {
  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  return (
    <div className={`w-full max-w-sm md:max-w-md lg:max-w-lg mt-4 grid ${size === 4 ? 'grid-cols-5' : 'grid-cols-4'} gap-2`}>
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          disabled={!isCellSelected}
          className="flex items-center justify-center text-2xl font-bold aspect-square bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed rounded-md transition-colors duration-150 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {num}
        </button>
      ))}
      <button
          key="erase"
          onClick={onEraseClick}
          disabled={!isCellSelected}
          className="flex items-center justify-center text-xl font-bold aspect-square bg-red-800 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed rounded-md transition-colors duration-150 text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 002.828 0L21 9.828a2 2 0 000-2.828L14.828 1.586a2 2 0 00-2.828 0L3 12z" />
          </svg>
        </button>
    </div>
  );
};

export default NumberPad;