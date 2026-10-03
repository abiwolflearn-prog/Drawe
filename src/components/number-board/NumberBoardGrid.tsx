import React from 'react';
import { IDrawNumber, formatEntryNumber } from '../../types/index.js';
import { useI18n } from '../../i18n/index.js';
import { Lock, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export interface NumberBoardGridProps {
  capacity?: number;
  numbersMap: Map<number, IDrawNumber>;
  selectedNumbers: number[];
  onToggleNumber: (num: number) => void;
}

export const NumberBoardGrid: React.FC<NumberBoardGridProps> = ({
  capacity = 100,
  numbersMap,
  selectedNumbers,
  onToggleNumber,
}) => {
  const { t } = useI18n();

  // Dynamic grid column calculation depending on capacity
  let gridColsClass = 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10'; // Default for ~100
  if (capacity > 500) {
    gridColsClass = 'grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16';
  } else if (capacity > 200) {
    gridColsClass = 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12';
  }

  const entries: number[] = Array.from({ length: capacity }, (_, i) => i + 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
        <span>የቁጥሮች ብዛት (Capacity): {capacity} entries</span>
        <span>የአንድ ቁጥር ቅርጸት (Format): {formatEntryNumber(1, capacity)} ... {formatEntryNumber(capacity, capacity)}</span>
      </div>

      <div className={`grid ${gridColsClass} gap-1.5 sm:gap-2 max-h-[580px] overflow-y-auto p-2 bg-[#0E1118] border border-white/10 rounded-2xl shadow-inner`}>
        {entries.map((num) => {
          const item = numbersMap.get(num);
          const status = item?.status || 'AVAILABLE';
          const isSelected = selectedNumbers.includes(num);
          const formatted = formatEntryNumber(num, capacity);

          // Dynamic cell state styling
          let btnClass = 'bg-[#161B28] hover:bg-blue-600/30 border-white/10 text-slate-200 hover:border-blue-400';

          if (isSelected) {
            btnClass = 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-900/50 font-black scale-105 z-10';
          } else if (status === 'CONFIRMED') {
            btnClass = 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 opacity-80 cursor-not-allowed';
          } else if (status === 'PAYMENT_PENDING') {
            btnClass = 'bg-amber-950/80 border-amber-500/40 text-amber-300 opacity-90 cursor-not-allowed';
          } else if (status === 'WINNER') {
            btnClass = 'bg-gradient-to-tr from-amber-500 to-yellow-400 border-amber-300 text-slate-950 font-black animate-pulse shadow-lg shadow-amber-500/50 scale-105 z-10';
          }

          const isClickable = status === 'AVAILABLE' || isSelected;

          return (
            <button
              key={num}
              type="button"
              disabled={!isClickable}
              onClick={() => onToggleNumber(num)}
              className={`relative h-10 sm:h-12 rounded-xl border flex flex-col items-center justify-center font-mono transition-all duration-150 select-none ${btnClass}`}
              title={`Number #${formatted} - ${status}`}
            >
              <span className="text-xs sm:text-sm font-black tracking-tight">{formatted}</span>

              {/* Status Icons */}
              {status === 'CONFIRMED' && !isSelected && (
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 absolute bottom-1 right-1 opacity-80" />
              )}
              {status === 'PAYMENT_PENDING' && !isSelected && (
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 absolute bottom-1 right-1 animate-spin" />
              )}
              {status === 'WINNER' && (
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-slate-950 absolute top-0.5 right-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
