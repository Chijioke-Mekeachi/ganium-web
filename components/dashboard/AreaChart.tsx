'use client';

import React from 'react';

type Datum = { label: string; value: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function AreaChart({
  data,
  height = 180,
  stroke = 'rgba(110,231,255,0.95)',
  fill = 'rgba(110,231,255,0.14)',
}: {
  data: Datum[];
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  const w = 640;
  const h = height;
  const padX = 22;
  const padY = 18;

  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);

  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const stepX = data.length <= 1 ? innerW : innerW / (data.length - 1);

  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const t = (d.value - min) / (max - min || 1);
    const y = padY + (1 - clamp(t, 0, 1)) * innerH;
    return { x, y, value: d.value, label: d.label };
  });

  const linePath =
    points.length === 0
      ? ''
      : `M ${points[0]!.x} ${points[0]!.y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');

  const areaPath =
    points.length === 0
      ? ''
      : `${linePath} L ${points[points.length - 1]!.x} ${padY + innerH} L ${points[0]!.x} ${
          padY + innerH
        } Z`;

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => min + ((max - min) * i) / yTicks);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Trend chart" className="w-full">
      <defs>
        <linearGradient id="ga_area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(110,231,255,0)" />
        </linearGradient>
      </defs>

      <rect
        x="0"
        y="0"
        width={w}
        height={h}
        rx="16"
        fill="rgba(15,23,42,0.18)"
        stroke="rgba(34,48,74,0.55)"
      />

      {tickValues.map((tv, idx) => {
        const t = (tv - min) / (max - min || 1);
        const y = padY + (1 - clamp(t, 0, 1)) * innerH;
        return (
          <g key={idx}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="rgba(34,48,74,0.35)" strokeWidth="1" />
            <text x={padX - 8} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(152,162,179,0.85)">
              {formatCompact(Math.round(tv))}
            </text>
          </g>
        );
      })}

      {areaPath ? <path d={areaPath} fill="url(#ga_area)" /> : null}
      {linePath ? <path d={linePath} fill="none" stroke={stroke} strokeWidth="2.2" /> : null}

      {points.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r="3.1" fill={stroke} opacity={idx === points.length - 1 ? 1 : 0.75} />
      ))}

      {points.length > 1 ? (
        <g>
          {points.map((p, idx) => {
            if (idx === 0 || idx === points.length - 1 || idx === Math.floor(points.length / 2)) {
              return (
                <text
                  key={idx}
                  x={p.x}
                  y={h - 8}
                  textAnchor={idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle'}
                  fontSize="11"
                  fill="rgba(152,162,179,0.85)"
                >
                  {p.label}
                </text>
              );
            }
            return null;
          })}
        </g>
      ) : null}
    </svg>
  );
}

