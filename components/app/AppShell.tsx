'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import {
  Bell,
  CreditCard,
  FileSearch,
  History,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  QrCode,
  Search,
  User,
  Wallet,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/scan/text', label: 'Scan Text', icon: FileSearch },
  { href: '/app/scan/url', label: 'Scan URL', icon: Link2 },
  { href: '/app/scan/wallet', label: 'Scan Wallet', icon: Wallet },
  { href: '/app/scan/qr', label: 'QR Scanner', icon: QrCode },
  { href: '/app/history', label: 'History', icon: History },
  { href: '/app/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/app/profile', label: 'Profile', icon: User },
  { href: '/app/updates', label: 'Updates', icon: Bell },
] as const;

type NavItem = (typeof navItems)[number] & { isActive: boolean };

function AppNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.()}
            className={[
              'group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition',
              item.isActive
                ? 'bg-[rgb(var(--ga-primary-rgb)/0.16)] text-[var(--ga-text)] border border-[rgb(var(--ga-primary-rgb)/0.35)]'
                : 'text-[var(--ga-text)] hover:bg-[rgb(var(--ga-card-rgb)/0.55)] border border-transparent',
            ].join(' ')}
          >
            <span
              className={[
                'grid h-8 w-8 place-items-center rounded-xl border transition',
                item.isActive
                  ? 'border-[rgb(var(--ga-primary-rgb)/0.45)] bg-[rgb(var(--ga-primary-rgb)/0.14)]'
                  : 'border-[rgb(var(--ga-border-rgb)/0.75)] bg-[rgb(var(--ga-card-rgb)/0.45)] group-hover:border-[rgb(var(--ga-border-rgb)/0.95)]',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile, tokensRemaining } = useProfile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const active = useMemo(() => {
    return navItems.map((i) => ({ ...i, isActive: pathname === i.href || pathname.startsWith(i.href + '/') }));
  }, [pathname]);

  return (
    <div className="min-h-screen ga-tech-bg">
      <div className="relative mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:gap-4">
          <div className="ga-surface p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)]">
                <Image src="/logo.png" alt="Ganium" width={44} height={44} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--ga-text)]">Ganium</div>
                <div className="truncate text-xs ga-muted">{profile?.email ?? '—'}</div>
              </div>
            </div>
          </div>

          <div className="ga-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide ga-muted">Workspace</div>
              <div className="rounded-full border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] px-2 py-1 text-xs">
                <span className="ga-muted">Tokens</span> <span className="ml-1 font-semibold ga-mono">{tokensRemaining}</span>
              </div>
            </div>
            <AppNav items={active} />
          </div>

          <div className="ga-surface p-4">
            <div className="text-xs font-semibold uppercase tracking-wide ga-muted">Account</div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] px-3 py-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--ga-text)]">Signed in</div>
                <div className="truncate text-xs ga-muted">{profile?.subscription_status ?? 'inactive'} plan</div>
              </div>
              <Button
                variant="secondary"
                className="px-3 py-2"
                onClick={async () => {
                  await signOut();
                  router.push('/login');
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <header className="ga-surface px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] text-[var(--ga-text)] hover:bg-[rgb(var(--ga-card-rgb)/0.75)]"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)]">
                    <Image src="/logo.png" alt="Ganium" width={40} height={40} className="h-full w-full object-cover" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-[var(--ga-text)]">Ganium</div>
                    <div className="text-xs ga-muted">Security dashboard</div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="text-xs uppercase tracking-wide ga-muted">Security</div>
                <div className="text-lg font-semibold text-[var(--ga-text)]">Overview</div>
              </div>

              <div className="flex flex-1 items-center justify-end gap-3">
                <div className="hidden md:flex w-full max-w-md items-center gap-2 rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.45)] px-3 py-2">
                  <Search className="h-4 w-4 ga-muted" />
                  <input
                    className="w-full bg-transparent text-sm text-[var(--ga-text)] placeholder:text-[var(--ga-placeholder)] outline-none"
                    placeholder="Quick search (scans, domains, wallets)…"
                    aria-label="Quick search"
                  />
                </div>

                <div className="hidden sm:flex items-center gap-2 rounded-full border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] px-3 py-2 text-xs">
                  <span className="ga-muted">Tokens</span>
                  <span className="font-semibold ga-mono">{tokensRemaining}</span>
                </div>
                <Link href="/app/scan/url" className="hidden sm:block">
                  <Button className="px-4 py-2">
                    <FileSearch className="mr-2 h-4 w-4" />
                    New scan
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {mobileNavOpen ? (
            <div className="lg:hidden fixed inset-0 z-50">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="Close navigation"
                onClick={() => setMobileNavOpen(false)}
              />
              <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm ga-surface p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)]">
                      <Image src="/logo.png" alt="Ganium" width={40} height={40} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--ga-text)]">Ganium</div>
                      <div className="truncate text-xs ga-muted">{profile?.email ?? '—'}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] text-[var(--ga-text)] hover:bg-[rgb(var(--ga-card-rgb)/0.75)]"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] px-3 py-3 text-sm">
                  <div className="ga-muted text-xs uppercase tracking-wide">Tokens remaining</div>
                  <div className="mt-1 text-xl font-semibold ga-mono">{tokensRemaining}</div>
                </div>

                <div className="mt-4">
                  <AppNav items={active} onNavigate={() => setMobileNavOpen(false)} />
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={async () => {
                      await signOut();
                      router.push('/login');
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                  <Link href="/app/profile" className="flex-1" onClick={() => setMobileNavOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          <main className="ga-surface p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
