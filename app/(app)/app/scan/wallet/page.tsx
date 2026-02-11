'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useScan } from '@/contexts/ScanContext';
import { getErrorMessage } from '@/lib/errors';

export default function ScanWalletPage() {
  const router = useRouter();
  const { scanWallet, loading } = useScan();
  const [wallet, setWallet] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ga-text)]">Scan Wallet</h1>
          <p className="ga-muted">Ethereum addresses cost 2 tokens.</p>
        </div>
        <Link href="/app/scan/qr">
          <Button variant="secondary">Scan via QR</Button>
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[rgb(239_83_80/0.35)] bg-[rgb(239_83_80/0.10)] p-3 text-sm text-[var(--ga-text)]">
          {error}
        </div>
      ) : null}

      <Input
        label="Ethereum address"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        placeholder="0x…"
      />

      <div className="flex gap-3">
        <Button
          onClick={async () => {
            setError(null);
            try {
              await scanWallet(wallet);
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
