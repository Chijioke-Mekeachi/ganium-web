'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useScan } from '@/contexts/ScanContext';
import { getErrorMessage } from '@/lib/errors';

export default function ScanTextPage() {
  const router = useRouter();
  const { scanText, loading } = useScan();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--ga-text)]">Scan Text</h1>
      <p className="ga-muted">Paste a message, description, or any suspicious content.</p>

      {error ? (
        <div className="rounded-2xl border border-[rgb(239_83_80/0.35)] bg-[rgb(239_83_80/0.10)] p-3 text-sm text-[var(--ga-text)]">
          {error}
        </div>
      ) : null}

      <Textarea label="Text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste text here…" />

      <div className="flex gap-3">
        <Button
          onClick={async () => {
            setError(null);
            try {
              await scanText(text);
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
