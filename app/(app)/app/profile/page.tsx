'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/errors';

export default function ProfilePage() {
  const { profile, updateProfile, uploadAvatarFile } = useProfile();
  const { updatePassword } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ga-text)]">Profile</h1>
        <p className="ga-muted">Manage your account details.</p>
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

      <div className="ga-surface-soft p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-[var(--ga-radius-surface)] border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)]">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div>
            <div className="text-sm ga-muted">Email</div>
            <div className="font-semibold text-[var(--ga-text)]">{profile?.email ?? '—'}</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-[var(--ga-text)] mb-2">Avatar</div>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              setError(null);
              setStatus(null);
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                await uploadAvatarFile(file);
                setStatus('Avatar updated.');
              } catch (err: unknown) {
                setError(getErrorMessage(err) || 'Failed to upload avatar');
              }
            }}
          />
        </div>

        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Button
          variant="secondary"
          onClick={async () => {
            setError(null);
            setStatus(null);
            try {
              await updateProfile({ full_name: fullName || null });
              setStatus('Profile updated.');
            } catch (err: unknown) {
              setError(getErrorMessage(err) || 'Failed to update profile');
            }
          }}
        >
          Save changes
        </Button>
      </div>

      <div className="ga-surface-soft p-5 space-y-4">
        <div className="text-lg font-semibold text-[var(--ga-text)]">Change password</div>
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Button
          variant="secondary"
          onClick={async () => {
            setError(null);
            setStatus(null);
            try {
              if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');
              await updatePassword(newPassword);
              setNewPassword('');
              setStatus('Password updated.');
            } catch (err: unknown) {
              setError(getErrorMessage(err) || 'Failed to update password');
            }
          }}
        >
          Update password
        </Button>
      </div>
    </div>
  );
}
