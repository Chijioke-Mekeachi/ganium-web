'use client';

import React from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className = '', ...props }: Props) {
  return (
    <label className="block">
      {label ? <div className="mb-2 text-sm font-medium text-[var(--ga-text)]">{label}</div> : null}
      <textarea
        {...props}
        className={[
          'w-full border px-4 py-3 outline-none transition min-h-[140px]',
          'rounded-[var(--ga-radius-control)] bg-[rgb(var(--ga-card-rgb)/0.55)] text-[var(--ga-text)] placeholder:text-[var(--ga-placeholder)]',
          error
            ? 'border-[rgb(239_83_80/0.55)] focus-visible:shadow-[0_0_0_4px_rgba(239,83,80,0.18)]'
            : 'border-[rgb(var(--ga-border-rgb)/0.9)] focus-visible:ga-focus',
          className,
        ].join(' ')}
      />
      {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
    </label>
  );
}
