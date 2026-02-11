'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useScan } from '@/contexts/ScanContext';
import { getErrorMessage } from '@/lib/errors';

export default function ScanUrlPage() {
  const router = useRouter();
  const { scanUrl, loading } = useScan();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--ga-text)]">Scan URL</h1>
      <p className="ga-muted">Check a website for phishing and other threats.</p>

      {error ? (
        <div className="rounded-2xl border border-[rgb(239_83_80/0.35)] bg-[rgb(239_83_80/0.10)] p-3 text-sm text-[var(--ga-text)]">
          {error}
        </div>
      ) : null}

      <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />

      <div className="flex gap-3">
        <Button
          onClick={async () => {
            setError(null);
            try {
              await scanUrl(url);
              router.push('/app/result');
            } catch (e: unknown) {
              setError(getErrorMessage(e) || 'Scan failed');
            }
          }}
          disabled={loading}
        >
          {loading ? 'Scanning…' : 'Scan'}
        </Button>
        <Button variant="secondary" onClick={() => router.push('/app')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
