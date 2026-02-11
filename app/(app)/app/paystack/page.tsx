'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useProfile } from '@/contexts/ProfileContext';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/errors';

export default function PaystackPage() {
  const { authorizationDetails, verifyPayment, clearAuthorizationDetails } = useProfile();
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const ref = authorizationDetails?.reference || reference;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ga-text)]">Paystack</h1>
        <p className="ga-muted">Open the payment link, complete payment, then verify.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[rgb(239_83_80/0.35)] bg-[rgb(239_83_80/0.10)] p-3 text-sm text-[var(--ga-text)]">
          {error}
        </div>
      ) : null}
      {status ? (
        <div className="rounded-2xl border border-[rgb(102_187_106/0.35)] bg-[rgb(102_187_106/0.10)] p-3 text-sm text-[var(--ga-text)]">
          {status}
        </div>
      ) : null}

      {authorizationDetails?.authUrl ? (
        <div className="ga-surface-soft p-5 space-y-3">
          <div className="text-sm text-[var(--ga-text)]">
            Reference: <span className="font-semibold">{authorizationDetails.reference}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                window.open(authorizationDetails.authUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              Open Paystack
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearAuthorizationDetails();
                setStatus(null);
                setError(null);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <div className="ga-surface-soft p-5 space-y-3">
          <div className="text-sm ga-muted">No active payment session found.</div>
          <Input label="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="paystack reference" />
        </div>
      )}

      <Button
        variant="secondary"
        disabled={verifying || !ref}
        onClick={async () => {
          setError(null);
          setStatus(null);
          setVerifying(true);
          try {
            const ok = await verifyPayment(ref);
            if (ok) setStatus('Payment verified. Your profile was refreshed.');
            else setError('Payment not verified yet. If you just paid, wait a moment and retry.');
          } catch (e: unknown) {
            setError(getErrorMessage(e) || 'Verification failed');
          } finally {
            setVerifying(false);
          }
        }}
      >
        {verifying ? 'Verifying…' : 'Verify payment'}
      </Button>
    </div>
  );
}
