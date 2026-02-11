import Image from 'next/image';
import React from 'react';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';

export function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <div className="hidden lg:block ga-surface p-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)]">
              <Image src="/logo.png" alt="Ganium" width={44} height={44} className="h-full w-full object-cover" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-[var(--ga-text)]">Ganium</div>
              <div className="text-xs ga-muted">Web security console</div>
            </div>
          </div>

          <div className="mt-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] px-4 py-2 text-xs font-medium text-[var(--ga-text)]">
              <Sparkles className="h-4 w-4 text-[var(--ga-primary)]" />
              Real-time risk signals
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-[var(--ga-text)]">
              Verify before you click.
            </div>
            <div className="mt-3 text-sm leading-relaxed ga-muted">
              Scan links, messages, and wallets. Get instant classification, a risk score, and recommended actions—built
              for day-to-day protection.
            </div>
          </div>

          <div className="mt-10 grid gap-3">
            <div className="ga-kpi px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.45)]">
                  <ShieldCheck className="h-5 w-5 text-[var(--ga-secondary)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--ga-text)]">Threat classification</div>
                  <div className="mt-1 text-sm ga-muted">Clear outcomes: safe, low, medium, high, critical.</div>
                </div>
              </div>
            </div>
            <div className="ga-kpi px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.45)]">
                  <Zap className="h-5 w-5 text-[var(--ga-primary)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--ga-text)]">Fast decisions</div>
                  <div className="mt-1 text-sm ga-muted">Designed for sub-second workflows and repeat scans.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-xs ga-muted">
            Protected by default • Minimal data retention • Built for teams & individuals
          </div>
        </div>

        <div className="ga-surface p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-[var(--ga-text)]">{title}</h1>
            <p className="mt-2 ga-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

