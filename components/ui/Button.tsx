'use client';

import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

const variants: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-[var(--ga-primary)] text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] hover:brightness-110 active:brightness-95',
  secondary:
    'bg-[rgb(var(--ga-card-rgb)/0.75)] text-[var(--ga-text)] border border-[rgb(var(--ga-border-rgb)/0.9)] hover:bg-[rgb(var(--ga-card-rgb)/0.92)]',
  danger: 'bg-[var(--ga-danger)] text-white hover:brightness-110 active:brightness-95',
  ghost: 'bg-transparent text-[var(--ga-text)] hover:bg-[rgb(var(--ga-card-rgb)/0.55)]',
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center justify-center px-4 py-2 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed',
        'rounded-[var(--ga-radius-control)] focus-visible:ga-focus',
        variants[variant],
        className,
      ].join(' ')}
    />
  );
}
