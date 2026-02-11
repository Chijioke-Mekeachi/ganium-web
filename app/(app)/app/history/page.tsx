'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProfile } from '@/contexts/ProfileContext';
import type { HistoryFilters, HistoryStats, ScanHistory } from '@/lib/types';
import { getErrorMessage } from '@/lib/errors';

export default function HistoryPage() {
  const router = useRouter();
  const { fetchHistory, deleteHistoryItem, clearHistory, exportHistory } = useProfile();
  const [contentType, setContentType] = useState<string>('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<ScanHistory[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(() => {
    const f: HistoryFilters = { limit: 200 };
    if (contentType) f.contentType = contentType as HistoryFilters['contentType'];
    if (search) f.searchQuery = search;
    return f;
  }, [contentType, search]);

  const load = async () => {
    setError(null);
    try {
      const data = await fetchHistory(filters);
      setItems(data.scans);
      setStats(data.stats);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Failed to load history');
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const openResult = (scanId: string) => {
    router.push(`/app/result?historyId=${encodeURIComponent(scanId)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ga-text)]">History</h1>
          <p className="ga-muted">Your last scans and basic stats.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const json = await exportHistory('json');
              await navigator.clipboard.writeText(json);
            }}
          >
            Copy JSON
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const csv = await exportHistory('csv');
              await navigator.clipboard.writeText(csv);
            }}
          >
            Copy CSV
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirm('Clear all history?')) return;
              await clearHistory();
              await load();
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[rgb(239_83_80/0.35)] bg-[rgb(239_83_80/0.10)] p-3 text-sm text-[var(--ga-text)]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] p-4 bg-[rgb(var(--ga-card-rgb)/0.55)]">
          <div className="text-sm ga-muted">Total scans</div>
          <div className="mt-1 text-xl font-semibold text-[var(--ga-text)]">{stats?.totalScans ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] p-4 bg-[rgb(var(--ga-card-rgb)/0.55)]">
          <div className="text-sm ga-muted">Avg risk</div>
          <div className="mt-1 text-xl font-semibold text-[var(--ga-text)]">{stats?.riskAvg ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] p-4 bg-[rgb(var(--ga-card-rgb)/0.55)]">
          <div className="text-sm ga-muted">Tokens used</div>
          <div className="mt-1 text-xl font-semibold text-[var(--ga-text)]">{stats?.tokensUsed ?? 0}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="block">
          <div className="mb-2 text-sm font-medium text-[var(--ga-text)]">Type</div>
          <select
            className="rounded-[var(--ga-radius-control)] border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] px-3 py-3 text-sm text-[var(--ga-text)] outline-none focus-visible:ga-focus"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          >
            <option value="">All</option>
            <option value="text">Text</option>
            <option value="url">URL</option>
            <option value="email">Email</option>
            <option value="wallet">Wallet</option>
            <option value="qr">QR</option>
          </select>
        </label>
        <div className="flex-1 min-w-[240px]">
          <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search content/classification…" />
        </div>
        <Button variant="secondary" onClick={load}>
          Refresh
        </Button>
      </div>

      <div className="overflow-auto rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)]">
        <table className="w-full text-sm text-[var(--ga-text)]">
          <thead className="bg-[rgb(var(--ga-card-rgb)/0.92)] ga-muted">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Risk</th>
              <th className="px-4 py-3 text-left">Classification</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr
                key={it.id}
                className="border-t border-[rgb(var(--ga-border-rgb)/0.75)] cursor-pointer hover:bg-[rgb(var(--ga-card-rgb)/0.82)]"
                role="button"
                tabIndex={0}
                onClick={() => openResult(it.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openResult(it.id);
                  }
                }}
              >
                <td className="px-4 py-3 ga-muted">{new Date(it.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">{it.content_type}</td>
                <td className="px-4 py-3">{it.risk_score}</td>
                <td className="px-4 py-3">{it.classification}</td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openResult(it.id);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm('Delete this item?')) return;
                      await deleteHistoryItem(it.id);
                      await load();
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 ga-muted" colSpan={5}>
                  No history.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
