'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/errors';
import { AuthFrame } from '@/components/auth/AuthFrame';

function SignupForm() {
  const router = useRouter();
  const { user, signUp, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace('/app');
  }, [router, user]);

  return (
    <AuthFrame title="Create account" subtitle="Get 2 free tokens to start scanning.">
      <div>
        {error ? (
          <div className="mb-4 rounded-2xl border border-[rgb(239_83_80/0.35)] bg-[rgb(239_83_80/0.10)] p-3 text-sm text-[var(--ga-text)]">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-2xl border border-[rgb(102_187_106/0.35)] bg-[rgb(102_187_106/0.10)] p-3 text-sm text-[var(--ga-text)]">
            {success}
          </div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSuccess(null);
            if (password.length < 6) return setError('Password must be at least 6 characters');
            if (password !== confirm) return setError("Passwords don't match");
            try {
              await signUp(email, password, fullName || undefined);
              setSuccess('Account created. Check your email to verify your account, then sign in.');
              setTimeout(() => router.push('/login'), 1200);
            } catch (err: unknown) {
              setError(getErrorMessage(err) || 'Failed to sign up');
            }
          }}
        >
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <Button type="submit" disabled={authLoading}>
            {authLoading ? 'Creating…' : 'Create account'}
          </Button>

          <div className="text-sm text-[var(--ga-text)]">
            Already have an account?{' '}
            <Link className="text-[var(--ga-primary)] hover:underline" href="/login">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </AuthFrame>
  );
}

export default function SignupPage() {
  return (
    <AuthProvider>
      <SignupForm />
    </AuthProvider>
  );
}
