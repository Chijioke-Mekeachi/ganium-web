import React from 'react';

export function KpiCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="ga-kpi px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide ga-muted">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-[var(--ga-text)] ga-mono">{value}</div>
          {hint ? <div className="mt-1 text-sm ga-muted">{hint}</div> : null}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.45)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

