import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950/40 border border-blue-400/20',
    glow: 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.45)] border border-blue-400/30',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-white/10',
    outline: 'bg-transparent border border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-800/50',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/40',
  };

  return (
    <button
      className={twMerge(
        clsx(baseStyles, sizeStyles[size], variantStyles[variant], fullWidth && 'w-full', className)
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
