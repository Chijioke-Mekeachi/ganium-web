import React from 'react';

export type StackedSegment = {
  label: string;
  value: number;
  color: string;
};

export function StackedBar({
  segments,
  ariaLabel,
}: {
  segments: StackedSegment[];
  ariaLabel: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div aria-label={ariaLabel}>
      <div className="overflow-hidden rounded-full ga-hairline bg-[rgb(var(--ga-card-rgb)/0.35)]">
        <div className="flex h-3 w-full">
          {segments.map((s) => {
            const widthPct = (s.value / total) * 100;
            return (
              <div
                key={s.label}
                title={`${s.label}: ${s.value}`}
                style={{ width: `${widthPct}%`, background: s.color }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              <span className="truncate text-[var(--ga-text)]">{s.label}</span>
            </div>
            <div className="ga-mono text-[var(--ga-text)]">
              {s.value} <span className="ga-muted">({Math.round((s.value / total) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

