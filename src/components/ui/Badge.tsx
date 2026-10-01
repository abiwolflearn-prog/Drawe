import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  variant?: 'available' | 'selected' | 'pending' | 'confirmed' | 'winner' | 'disabled' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className,
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider select-none';

  const variantStyles = {
    available: 'bg-slate-800 text-slate-300 border border-slate-700',
    selected: 'bg-rose-950/80 text-rose-400 border border-rose-600/40 shadow-[0_0_10px_rgba(225,29,72,0.3)]',
    pending: 'bg-amber-950/80 text-amber-400 border border-amber-600/40 shadow-[0_0_10px_rgba(217,119,6,0.3)]',
    confirmed: 'bg-slate-900 text-slate-400 border border-slate-800',
    winner: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    disabled: 'bg-slate-900/50 text-slate-600 border border-slate-800/50',
    neutral: 'bg-blue-950/80 text-blue-400 border border-blue-600/40',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variantStyles[variant], className))}>
      {children}
    </span>
  );
};
