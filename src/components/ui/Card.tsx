import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'elevated' | 'glass';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'rounded-2xl border transition-colors';

  const variantStyles = {
    surface: 'bg-[#11141D] border-white/[0.07] shadow-xl shadow-black/40',
    elevated: 'bg-[#1A1E2B] border-white/[0.1] shadow-2xl shadow-black/60',
    glass: 'bg-[#11141D]/80 backdrop-blur-md border-white/[0.08]',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variantStyles[variant], className))} {...props}>
      {children}
    </div>
  );
};
