'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useProfile } from '@/contexts/ProfileContext';
import { getErrorMessage } from '@/lib/errors';

const EXCHANGE_RATE = 1500; // $1 = ₦1500 (matches mobile)

export default function SubscriptionPage() {
  const { profile, subscriptionPlans, startSubscriptionPayment } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const plans = useMemo(() => subscriptionPlans ?? [], [subscriptionPlans]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ga-text)]">Subscription</h1>
          <p className="ga-muted">
            Status: <span className="font-semibold">{profile?.subscription_status ?? 'inactive'}</span>
          </p>
        </div>
        <Link href="/app/paystack">
          <Button variant="secondary">Payment Status</Button>
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[rgb(239_83_80/0.35)] bg-[rgb(239_83_80/0.10)] p-3 text-sm text-[var(--ga-text)]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const amountNaira = plan.monthly_price_usd * EXCHANGE_RATE;
          return (
            <div key={plan.id} className="ga-surface-soft p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-[var(--ga-text)]">{plan.name}</div>
                  <div className="mt-1 text-sm ga-muted">{plan.monthly_tokens} tokens / month</div>
                </div>
                <div className="text-right">
                  <div className="text-sm ga-muted">${plan.monthly_price_usd.toFixed(2)} / mo</div>
                  <div className="text-xs ga-muted">≈ ₦{amountNaira.toFixed(0)}</div>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  disabled={!!processing}
                  onClick={async () => {
                    setError(null);
                    setProcessing(plan.id);
                    try {
                      await startSubscriptionPayment({ planId: plan.id, amount: amountNaira });
                      window.location.href = '/app/paystack';
                    } catch (e: unknown) {
                      setError(getErrorMessage(e) || 'Failed to start payment');
                    } finally {
                      setProcessing(null);
                    }
                  }}
                >
                  {processing === plan.id ? 'Starting…' : 'Subscribe'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="ga-surface-soft p-5">
        <div className="text-lg font-semibold text-[var(--ga-text)]">Buy tokens</div>
        <div className="mt-1 text-sm ga-muted">Token purchases use Paystack.</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[5, 10, 20, 50].map((tokens) => {
            const amountUsd = tokens * 0.1;
            const amountNaira = amountUsd * EXCHANGE_RATE;
            return (
              <div key={tokens} className="rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] p-4">
                <div className="text-sm ga-muted">{tokens} tokens</div>
                <div className="mt-1 font-semibold text-[var(--ga-text)]">${amountUsd.toFixed(2)}</div>
                <div className="text-xs ga-muted">≈ ₦{amountNaira.toFixed(0)}</div>
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    disabled={!!processing}
                    onClick={async () => {
                      setError(null);
                      setProcessing(`t:${tokens}`);
                      try {
                        await startSubscriptionPayment({ tokens, amount: amountNaira });
                        window.location.href = '/app/paystack';
                      } catch (e: unknown) {
                        setError(getErrorMessage(e) || 'Failed to start payment');
                      } finally {
                        setProcessing(null);
                      }
                    }}
                  >
                    {processing === `t:${tokens}` ? 'Starting…' : 'Buy'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
