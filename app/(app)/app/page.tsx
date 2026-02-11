'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/Button';
import type { HistoryStats, ScanHistory } from '@/lib/types';
import { AreaChart } from '@/components/dashboard/AreaChart';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { StackedBar } from '@/components/dashboard/StackedBar';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { Activity, ArrowUpRight, Clock, Coins, ShieldCheck, TrendingUp, TriangleAlert } from 'lucide-react';

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function riskLabel(score: number) {
  if (score >= 85) return { label: 'Critical', color: 'rgba(239,83,80,0.95)', bg: 'rgba(239,83,80,0.14)' };
  if (score >= 70) return { label: 'High', color: 'rgba(255,133,85,0.95)', bg: 'rgba(255,133,85,0.14)' };
  if (score >= 40) return { label: 'Medium', color: 'rgba(255,213,79,0.95)', bg: 'rgba(255,213,79,0.12)' };
  if (score >= 20) return { label: 'Low', color: 'rgba(110,231,255,0.95)', bg: 'rgba(110,231,255,0.12)' };
  return { label: 'Safe', color: 'rgba(102,187,106,0.95)', bg: 'rgba(102,187,106,0.12)' };
}

function toScore(scan: ScanHistory) {
  const n = parseInt(scan.risk_score || '0', 10);
  return Number.isFinite(n) ? n : 0;
}

function buildTrend(scans: ScanHistory[], days = 7) {
  const now = new Date();
  const buckets = Array.from({ length: days }, (_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - idx));
    d.setHours(0, 0, 0, 0);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    return { date: d, label, value: 0 };
  });

  scans.forEach((s) => {
    const d = new Date(s.created_at);
    const b = buckets.find((b0) => sameDay(b0.date, d));
    if (b) b.value += 1;
  });

  return buckets.map((b) => ({ label: b.label, value: b.value }));
}

export default function DashboardPage() {
  const { profile, refreshProfile, fetchHistory } = useProfile();
  const [recent, setRecent] = useState<ScanHistory[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [trend, setTrend] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshProfile();
      const { scans, stats } = await fetchHistory({ limit: 250 });
      setStats(stats);
      setRecent(scans.slice(0, 6));
      setTrend(buildTrend(scans, 7));
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [fetchHistory, refreshProfile]);

  const lastScanAt = recent[0]?.created_at ? new Date(recent[0].created_at) : null;
  const avgRisk = stats?.riskAvg ?? 0;
  const highRiskCount = stats ? stats.byRisk.critical + stats.byRisk.high : 0;

  const riskSegments = [
    { label: 'Critical', value: stats?.byRisk.critical ?? 0, color: 'rgba(239,83,80,0.95)' },
    { label: 'High', value: stats?.byRisk.high ?? 0, color: 'rgba(255,133,85,0.95)' },
    { label: 'Medium', value: stats?.byRisk.medium ?? 0, color: 'rgba(255,213,79,0.95)' },
    { label: 'Low', value: stats?.byRisk.low ?? 0, color: 'rgba(110,231,255,0.95)' },
    { label: 'Safe', value: stats?.byRisk.safe ?? 0, color: 'rgba(102,187,106,0.95)' },
  ];

  const typeSegments = [
    { label: 'Text', value: stats?.byType.text ?? 0, color: 'rgba(110,231,255,0.95)' },
    { label: 'URL', value: stats?.byType.url ?? 0, color: 'rgba(180,160,255,0.95)' },
    { label: 'Wallet', value: stats?.byType.wallet ?? 0, color: 'rgba(108,219,142,0.95)' },
    { label: 'QR', value: stats?.byType.qr ?? 0, color: 'rgba(255,213,79,0.95)' },
    { label: 'Email', value: stats?.byType.email ?? 0, color: 'rgba(255,133,85,0.95)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ga-text)]">
            Security dashboard{profile?.full_name ? ` — ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 ga-muted">
            Monitor scan activity, risk distribution, and recommended actions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/scan/url">
            <Button className="px-5">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Start scan
            </Button>
          </Link>
          <Link href="/app/history">
            <Button variant="secondary" className="px-5">
              View history
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total scans"
          value={String(stats?.totalScans ?? 0)}
          hint="Across all content types"
          icon={<Activity className="h-5 w-5 text-[var(--ga-primary)]" />}
        />
        <KpiCard
          label="Avg risk"
          value={`${avgRisk}`}
          hint={avgRisk >= 70 ? 'Elevated risk profile' : 'Stable baseline'}
          icon={<TrendingUp className="h-5 w-5 text-[var(--ga-secondary)]" />}
        />
        <KpiCard
          label="High-risk"
          value={String(highRiskCount)}
          hint="Critical + high"
          icon={<TriangleAlert className="h-5 w-5 text-[var(--ga-warning)]" />}
        />
        <KpiCard
          label="Last scan"
          value={lastScanAt ? lastScanAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
          hint={lastScanAt ? lastScanAt.toLocaleDateString() : 'No recent activity'}
          icon={<Clock className="h-5 w-5 text-[var(--ga-accent)]" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ga-surface-soft p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[var(--ga-text)]">Threat trend</div>
              <div className="mt-1 text-sm ga-muted">Scans per day (last 7 days)</div>
            </div>
            <div className="rounded-full border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] px-3 py-2 text-xs">
              <span className="ga-muted">Tokens used</span>{' '}
              <span className="ml-1 font-semibold ga-mono">{stats?.tokensUsed ?? 0}</span>
            </div>
          </div>
          <div className="mt-4">
            {loading ? <div className="h-[180px] rounded-2xl ga-hairline bg-[rgb(var(--ga-card-rgb)/0.35)]" /> : <AreaChart data={trend} />}
          </div>
        </div>

        <div className="ga-surface-soft p-5">
          <div className="text-sm font-semibold text-[var(--ga-text)]">Risk distribution</div>
          <div className="mt-1 text-sm ga-muted">Breakdown by risk band</div>
          <div className="mt-4">
            <StackedBar segments={riskSegments} ariaLabel="Risk distribution" />
          </div>
          <div className="mt-4 rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.40)] px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="ga-muted">Risk posture</div>
              <div className="font-semibold text-[var(--ga-text)] ga-mono">{avgRisk}/100</div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[rgb(var(--ga-border-rgb)/0.45)]">
              <div
                className="h-full"
                style={{
                  width: `${Math.min(100, Math.max(0, avgRisk))}%`,
                  background: avgRisk >= 70 ? 'rgba(255,133,85,0.95)' : 'rgba(110,231,255,0.95)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ga-surface-soft p-5">
          <div className="text-sm font-semibold text-[var(--ga-text)]">Scan types</div>
          <div className="mt-1 text-sm ga-muted">What you scan most often</div>
          <div className="mt-4">
            <DonutChart
              segments={typeSegments}
              centerLabel="Total"
              centerValue={String(stats?.totalScans ?? 0)}
            />
          </div>
        </div>

        <div className="ga-surface-soft p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[var(--ga-text)]">Recent activity</div>
              <div className="mt-1 text-sm ga-muted">Latest scans and classifications</div>
            </div>
            <Link href="/app/history" className="text-sm text-[var(--ga-primary)] hover:underline">
              Open history
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recent.length === 0 ? (
              <div className="rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.40)] px-4 py-4 text-sm ga-muted">
                No scans yet. Start with a URL scan to build your baseline.
              </div>
            ) : null}
            {recent.map((s) => {
              const score = toScore(s);
              const tone = riskLabel(score);
              return (
                <Link
                  key={s.id}
                  href={`/app/result?historyId=${encodeURIComponent(s.id)}`}
                  className="block rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.40)] px-4 py-3 transition hover:bg-[rgb(var(--ga-card-rgb)/0.62)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs ga-muted">
                        {s.content_type.toUpperCase()} • {new Date(s.created_at).toLocaleString()}
                      </div>
                      <div className="mt-1 truncate text-sm font-semibold text-[var(--ga-text)]">
                        {s.classification || 'Scan result'}
                      </div>
                      <div className="mt-1 truncate text-sm ga-muted">{s.explanation || s.content}</div>
                    </div>
                    <div
                      className="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ga-mono"
                      style={{ borderColor: tone.color, background: tone.bg, color: tone.color }}
                    >
                      {tone.label} {score}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ga-surface-soft p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-[var(--ga-text)]">Recommended actions</div>
            <div className="mt-1 text-sm ga-muted">Suggested next steps based on your recent activity.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/app/subscription">
              <Button variant="secondary">
                <Coins className="mr-2 h-4 w-4" />
                Tokens & plans
              </Button>
            </Link>
            <Link href="/app/scan/text">
              <Button variant="secondary">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Scan a message
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.40)] px-4 py-4">
            <div className="text-xs uppercase tracking-wide ga-muted">Review</div>
            <div className="mt-1 text-sm font-semibold text-[var(--ga-text)]">Investigate high-risk scans</div>
            <div className="mt-2 text-sm ga-muted">
              You have <span className="font-semibold text-[var(--ga-text)] ga-mono">{highRiskCount}</span> high-risk items. Open history and filter by risk.
            </div>
          </div>
          <div className="rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.40)] px-4 py-4">
            <div className="text-xs uppercase tracking-wide ga-muted">Protect</div>
            <div className="mt-1 text-sm font-semibold text-[var(--ga-text)]">Standardize your workflow</div>
            <div className="mt-2 text-sm ga-muted">
              Use the URL scan for external links and wallet scan for addresses—consistent inputs improve outcomes.
            </div>
          </div>
          <div className="rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.40)] px-4 py-4">
            <div className="text-xs uppercase tracking-wide ga-muted">Maintain</div>
            <div className="mt-1 text-sm font-semibold text-[var(--ga-text)]">Keep tokens available</div>
            <div className="mt-2 text-sm ga-muted">
              If you scan daily, consider a subscription plan to avoid interruptions and keep history growing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
