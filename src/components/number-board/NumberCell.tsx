import React from 'react';
import { NumberState } from '../../types/index.js';
import { Check, Lock, Hourglass, Star } from 'lucide-react';

export interface NumberCellProps {
  number: number; // 1 to 80
  state: NumberState;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const NumberCell: React.FC<NumberCellProps> = ({
  number,
  state,
  isSelected = false,
  onClick,
  disabled = false,
}) => {
  const formattedNum = number < 10 ? `0${number}` : `${number}`;

  // Determine effective state
  const currentState: NumberState = isSelected ? 'SELECTED' : state;

  const getStyles = (st: NumberState) => {
    switch (st) {
      case 'SELECTED':
        return 'bg-rose-600 text-white border-rose-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_16px_rgba(225,29,72,0.6)] scale-[1.03] z-10';
      case 'PAYMENT_PENDING':
        return 'bg-amber-900/80 text-amber-300 border-amber-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_10px_rgba(217,119,6,0.3)] cursor-not-allowed opacity-90';
      case 'CONFIRMED':
        return 'bg-slate-900/90 text-slate-500 border-slate-800 shadow-inner cursor-not-allowed opacity-60';
      case 'WINNER':
        return 'bg-emerald-600 text-white border-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_24px_rgba(16,185,129,0.8)] animate-pulse z-20';
      case 'RESERVED':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse';
      case 'DISABLED':
        return 'bg-slate-900/40 text-slate-700 border-slate-800/40 cursor-not-allowed opacity-40';
      case 'AVAILABLE':
      default:
        return 'bg-[#181C28] hover:bg-[#222738] text-slate-200 border-white/[0.08] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_4px_rgba(0,0,0,0.4)] active:scale-95';
    }
  };

  const isInteractive = currentState === 'AVAILABLE' || currentState === 'SELECTED';

  return (
    <button
      type="button"
      onClick={isInteractive && !disabled ? onClick : undefined}
      disabled={!isInteractive || disabled}
      aria-label={`Number ${formattedNum}, State: ${currentState}`}
      aria-pressed={isSelected}
      className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-xl border text-sm sm:text-base font-bold transition-all duration-150 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${getStyles(
        currentState
      )}`}
    >
      <span className="font-mono tabular-nums tracking-tight">{formattedNum}</span>

      {/* Non-color visual accessibility icons */}
      {currentState === 'SELECTED' && (
        <span className="absolute bottom-1 right-1 text-white opacity-90">
          <Check className="w-3 h-3 stroke-[3]" />
        </span>
      )}
      {currentState === 'CONFIRMED' && (
        <span className="absolute bottom-1 right-1 text-slate-600">
          <Lock className="w-2.5 h-2.5" />
        </span>
      )}
      {currentState === 'PAYMENT_PENDING' && (
        <span className="absolute bottom-1 right-1 text-amber-400">
          <Hourglass className="w-2.5 h-2.5 animate-spin" />
        </span>
      )}
      {currentState === 'WINNER' && (
        <span className="absolute top-1 right-1 text-amber-300">
          <Star className="w-3 h-3 fill-amber-300" />
        </span>
      )}
    </button>
  );
};
