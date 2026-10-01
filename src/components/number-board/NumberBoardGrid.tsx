import React from 'react';
import { NumberCell } from './NumberCell.js';
import { IDrawNumber, NumberState } from '../../types/index.js';

export interface NumberBoardGridProps {
  numbersMap: Map<number, IDrawNumber>;
  selectedNumbers: number[];
  onToggleNumber: (num: number) => void;
  disabled?: boolean;
}

export const NumberBoardGrid: React.FC<NumberBoardGridProps> = ({
  numbersMap,
  selectedNumbers,
  onToggleNumber,
  disabled = false,
}) => {
  // Generate array 1..80 programmatically
  const numbersArray = Array.from({ length: 80 }, (_, i) => i + 1);

  return (
    <div className="w-full">
      {/* Grid: 8 columns on mobile, 10 columns on sm/md/lg desktop */}
      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 sm:gap-2.5 p-2 sm:p-4 bg-[#0E1118] border border-white/10 rounded-2xl shadow-inner">
        {numbersArray.map((num) => {
          const item = numbersMap.get(num);
          const state: NumberState = item ? item.status : 'AVAILABLE';
          const isSelected = selectedNumbers.includes(num);

          return (
            <NumberCell
              key={num}
              number={num}
              state={state}
              isSelected={isSelected}
              onClick={() => onToggleNumber(num)}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
};
