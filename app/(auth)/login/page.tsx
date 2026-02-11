'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/errors';
import { AuthFrame } from '@/components/auth/AuthFrame';

function LoginForm() {
  const router = useRouter();
  const { user, signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace('/app');
  }, [router, user]);

  return (
    <AuthFrame title="Sign in" subtitle="Access the Ganium security dashboard.">
      <div>
        {error ? (
          <div className="mb-4 rounded-2xl border border-[rgb(239_83_80/0.35)] bg-[rgb(239_83_80/0.10)] p-3 text-sm text-[var(--ga-text)]">
            {error}
          </div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              await signIn(email, password);
              router.push('/app');
            } catch (err: unknown) {
              setError(getErrorMessage(err) || 'Failed to sign in');
            }
          }}
        >
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          <Button type="submit" disabled={authLoading}>
            {authLoading ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Link className="text-[var(--ga-primary)] hover:underline" href="/forgot-password">
              Forgot password?
            </Link>
            <Link className="text-[var(--ga-text)] hover:underline" href="/signup">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </AuthFrame>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
