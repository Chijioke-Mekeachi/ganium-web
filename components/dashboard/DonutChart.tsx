'use client';

import React from 'react';

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const cx = 96;
  const cy = 96;
  const r = 62;
  const stroke = 16;

  const slices = segments
    .filter((s) => s.value > 0)
    .reduce(
      (acc, s) => {
        const start = acc.angle;
        const delta = (s.value / total) * 360;
        const end = start + delta;
        return { angle: end, slices: [...acc.slices, { ...s, start, end }] };
      },
      { angle: 0, slices: [] as Array<DonutSegment & { start: number; end: number }> }
    ).slices;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 192 192" className="h-44 w-44 shrink-0" role="img" aria-label="Distribution chart">
        <circle cx={cx} cy={cy} r={r} stroke="rgba(34,48,74,0.45)" strokeWidth={stroke} fill="none" />
        {slices.map((s) => (
          <path
            key={s.label}
            d={arcPath(cx, cy, r, s.start, s.end)}
            stroke={s.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
          />
        ))}
        <circle cx={cx} cy={cy} r={r - stroke / 2} fill="rgba(15,23,42,0.55)" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="rgba(152,162,179,0.9)">
          {centerLabel}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="26" fill="rgba(255,255,255,0.95)" fontWeight="700">
          {centerValue}
        </text>
      </svg>

      <div className="min-w-0 flex-1 space-y-2 text-sm">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3">
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
