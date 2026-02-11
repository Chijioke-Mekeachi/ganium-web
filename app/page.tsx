import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Zap, Lock, Globe, Users } from 'lucide-react';

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="ga-surface-soft px-5 py-4">
      <div className="text-xs uppercase tracking-wide ga-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[var(--ga-text)]">{value}</div>
    </div>
  );
}

function Feature({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="ga-surface-soft px-5 py-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--ga-card-rgb)/0.65)] border border-[rgb(var(--ga-border-rgb)/0.9)]">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--ga-text)]">{title}</div>
          <div className="mt-1 text-sm ga-muted">{body}</div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen ga-tech-bg">
      <header className="mx-auto max-w-6xl px-6 pt-8">
        <nav className="flex items-center justify-between ga-surface-soft px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.75)]">
              <Image src="/logo.png" width={40} height={40} alt="Ganium" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-[var(--ga-text)]">Ganium</div>
              <div className="text-xs ga-muted">Security dashboard</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-[var(--ga-radius-control)] px-3 py-2 text-sm font-medium text-[var(--ga-text)] hover:bg-[rgb(var(--ga-card-rgb)/0.55)]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-[var(--ga-radius-control)] px-3 py-2 text-sm font-medium text-[var(--ga-text)] hover:bg-[rgb(var(--ga-card-rgb)/0.55)]"
            >
              Create account
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] px-4 py-2 text-sm text-[var(--ga-text)]">
              <span className="h-2 w-2 rounded-full bg-[var(--ga-secondary)]" />
              Building the trust layer for everyday internet use
            </div>

            <h1 className="text-balance text-4xl font-semibold tracking-tight text-[var(--ga-text)] sm:text-5xl">
              AI-powered protection against <span className="text-[var(--ga-primary)]">online scams</span>.
            </h1>

            <p className="text-pretty text-lg leading-relaxed ga-muted">
              Ganium helps people and teams verify links, emails, and messages before they click—reducing fraud, phishing,
              and account takeover risk across the web.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/login">
                <Button className="w-full sm:w-auto px-6 py-3">Sign in</Button>
              </Link>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full px-6 py-3">
                  Create account
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Signals analyzed" value="Millions+" />
              <Metric label="Avg. decision time" value="< 2s" />
              <Metric label="Coverage" value="Web + Messages" />
            </div>
          </div>

          <div className="ga-surface p-4 sm:p-6">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)]">
              <Image src="/preview.png" alt="Ganium preview" fill className="object-cover" priority />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Feature
                title="Real-time risk scoring"
                body="Classifies suspicious patterns and signals before the click."
                icon={<Zap className="h-5 w-5 text-[var(--ga-primary)]" />}
              />
              <Feature
                title="Privacy first"
                body="Designed to minimize sensitive data exposure while staying effective."
                icon={<Lock className="h-5 w-5 text-[var(--ga-secondary)]" />}
              />
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          <Feature
            title="Phishing defense"
            body="Spot impersonation attempts, spoofed domains, and malicious redirects."
            icon={<ShieldCheck className="h-5 w-5 text-[var(--ga-primary)]" />}
          />
          <Feature
            title="Internet-scale signals"
            body="Uses multi-source signals and pattern recognition to improve decisions."
            icon={<Globe className="h-5 w-5 text-[var(--ga-secondary)]" />}
          />
          <Feature
            title="Team-ready workflows"
            body="Built with sharing, audits, and admin controls in mind."
            icon={<Users className="h-5 w-5 text-[var(--ga-primary)]" />}
          />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="ga-surface px-6 py-6">
            <div className="text-lg font-semibold text-[var(--ga-text)]">Why now</div>
            <div className="mt-2 text-sm ga-muted">
              Fraud is moving faster than manual verification can handle. Users need an always-on safety layer that can
              evaluate risk instantly and consistently.
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Metric label="Problem" value="Clicks are costly" />
              <Metric label="Solution" value="Verify first" />
            </div>
          </div>

          <div className="ga-surface px-6 py-6">
            <div className="text-lg font-semibold text-[var(--ga-text)]">Business model</div>
            <div className="mt-2 text-sm ga-muted">
              Freemium for consumers with paid upgrades, plus a team plan for organizations that need centralized
              controls, compliance, and reporting.
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Metric label="Consumer" value="Free → Pro" />
              <Metric label="Teams" value="Per-seat SaaS" />
            </div>
          </div>
        </section>

        <section className="mt-10 ga-surface px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold text-[var(--ga-text)]">Ready to start scanning?</div>
              <div className="mt-1 text-sm ga-muted">Sign in to open the dashboard and run your first scan.</div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button className="px-6 py-3">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" className="px-6 py-3">
                  Create account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-col gap-3 border-t border-[rgb(var(--ga-border-rgb)/0.9)] pt-6 text-sm ga-muted sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Ganium</div>
          <div className="flex items-center gap-4">
            <Link className="hover:text-[var(--ga-text)]" href="/login">
              Sign in
            </Link>
            <span className="text-[rgb(var(--ga-border-rgb)/0.9)]">•</span>
            <Link className="hover:text-[var(--ga-text)]" href="/signup">
              Create account
            </Link>
            <span className="text-[rgb(var(--ga-border-rgb)/0.9)]">•</span>
            <a className="hover:text-[var(--ga-text)]" href="mailto:support@ganium.ai">
              support@ganium.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
