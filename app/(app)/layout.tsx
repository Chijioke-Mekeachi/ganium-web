'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { ScanProvider } from '@/contexts/ScanContext';
import { AppShell } from '@/components/app/AppShell';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center ga-tech-bg">
        <div className="ga-surface px-6 py-5 text-[var(--ga-text)]">Loading…</div>
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <ScanProvider>
          <Protected>
            <AppShell>{children}</AppShell>
          </Protected>
        </ScanProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
