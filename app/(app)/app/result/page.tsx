'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useScan } from '@/contexts/ScanContext';
import { useProfile } from '@/contexts/ProfileContext';
import type { ScanHistory } from '@/lib/types';

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyId = searchParams.get('historyId');
  const { latestResult, resetResult } = useScan();
  const { getHistoryItem } = useProfile();

  const [historyItem, setHistoryItem] = useState<ScanHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!historyId) return;

    let cancelled = false;
    const run = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const item = await getHistoryItem(historyId);
        if (cancelled) return;
        if (!item) {
          setHistoryItem(null);
          setHistoryError('Result not found.');
          return;
        }
        setHistoryItem(item);
      } catch {
        if (cancelled) return;
        setHistoryItem(null);
        setHistoryError('Failed to load result.');
      } finally {
        if (cancelled) return;
        setHistoryLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [getHistoryItem, historyId]);

  type DisplayResult = {
    content: string;
    contentType: string;
    riskScore: string;
    classification: string;
    explanation: string;
    recommendations: string;
    timestamp?: string;
  };

  const display = useMemo<DisplayResult | null>(() => {
    if (historyId) {
      if (!historyItem) return null;
      return {
        content: historyItem.content,
        contentType: historyItem.content_type,
        riskScore: historyItem.risk_score || '0',
        classification: historyItem.classification || 'Unknown',
        explanation: historyItem.explanation || '',
        recommendations: historyItem.recommendations || '',
        timestamp: historyItem.created_at,
      };
    }

    if (!latestResult) return null;
    return {
      content: latestResult.content,
      contentType: latestResult.contentType,
      riskScore: latestResult.riskScore || '0',
      classification: latestResult.classification || 'Unknown',
      explanation: latestResult.explanation || '',
      recommendations: latestResult.recommendations || '',
      timestamp: latestResult.timestamp,
    };
  }, [historyId, historyItem, latestResult]);

  const showHistoryLoading = Boolean(historyId) && historyLoading;
  const showHistoryError = Boolean(historyId) ? historyError : null;

  if (showHistoryLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--ga-text)]">Loading…</h1>
        <p className="ga-muted">Fetching scan result.</p>
      </div>
    );
  }

  if (showHistoryError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--ga-text)]">No result</h1>
        <p className="ga-muted">{showHistoryError}</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => router.push('/app/history')}>
            Back to history
          </Button>
          <Button variant="secondary" onClick={() => router.push('/app')}>
            Go to dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!display) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[var(--ga-text)]">No result</h1>
        <p className="ga-muted">{historyId ? 'Result not found.' : 'Run a scan first.'}</p>
        <Button variant="secondary" onClick={() => router.push(historyId ? '/app/history' : '/app')}>
          {historyId ? 'Back to history' : 'Go to dashboard'}
        </Button>
      </div>
    );
  }

  const score = parseInt(display.riskScore || '0', 10);
  const riskLabel = score >= 85 ? 'Critical' : score >= 70 ? 'High' : score >= 40 ? 'Medium' : score >= 20 ? 'Low' : 'Safe';
  const riskClass =
    score >= 85
      ? 'bg-[rgb(239_83_80/0.18)] text-[var(--ga-danger)] border border-[rgb(239_83_80/0.35)]'
      : score >= 70
        ? 'bg-[rgb(255_213_79/0.18)] text-[var(--ga-warning)] border border-[rgb(255_213_79/0.35)]'
        : score >= 40
          ? 'bg-[rgb(66_165_245/0.18)] text-[var(--ga-info)] border border-[rgb(66_165_245/0.35)]'
          : score >= 20
            ? 'bg-[rgb(var(--ga-primary-rgb)/0.18)] text-[var(--ga-primary)] border border-[rgb(var(--ga-primary-rgb)/0.35)]'
            : 'bg-[rgb(102_187_106/0.18)] text-[var(--ga-success)] border border-[rgb(102_187_106/0.35)]';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ga-text)]">Scan Result</h1>
          <div className="mt-1 text-sm ga-muted">
            {display.contentType} • {display.timestamp ? new Date(display.timestamp).toLocaleString() : ''}
          </div>
        </div>
        <div className={`rounded-2xl px-4 py-2 ${riskClass}`}>
          <div className="text-xs opacity-90">Risk</div>
          <div className="text-lg font-semibold">
            {riskLabel} • {score}
          </div>
        </div>
      </div>

      <div className="ga-surface-soft p-5">
        <div className="text-sm font-semibold text-[var(--ga-text)]">Classification</div>
        <div className="mt-1 text-[var(--ga-text)]">{display.classification}</div>
      </div>

      <div className="ga-surface-soft p-5">
        <div className="text-sm font-semibold text-[var(--ga-text)]">Explanation</div>
        <pre className="mt-2 whitespace-pre-wrap text-sm text-[var(--ga-text)]">{display.explanation}</pre>
      </div>

      <div className="ga-surface-soft p-5">
        <div className="text-sm font-semibold text-[var(--ga-text)]">Recommendations</div>
        <pre className="mt-2 whitespace-pre-wrap text-sm text-[var(--ga-text)]">{display.recommendations}</pre>
      </div>

      <div className="ga-surface-soft p-5">
        <div className="text-sm font-semibold text-[var(--ga-text)]">Content</div>
        <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-[var(--ga-text)]">{display.content}</pre>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(display.content);
            }}
          >
            Copy
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (historyId) {
                router.push('/app/history');
                return;
              }
              resetResult();
              router.push('/app');
            }}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
