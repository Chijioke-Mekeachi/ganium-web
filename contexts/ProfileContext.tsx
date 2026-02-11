'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type {
  HistoryFilters,
  HistoryStats,
  QRScanData,
  ScanHistory,
  SubscriptionPlan,
  UserProfile,
} from '@/lib/types';
import { initializePayment as initPaystack, verifyPayment as verifyPaystack } from '@/lib/api/paystack';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorCode } from '@/lib/errors';

interface AuthDetails {
  authUrl: string;
  reference: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  subscriptionPlans: SubscriptionPlan[];
  loading: boolean;
  refreshing: boolean;
  hasTokens: boolean;
  tokensRemaining: number;
  qrScans: QRScanData[];
  authorizationDetails: AuthDetails | null;

  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateTokens: (tokensChange: number) => Promise<void>;
  validateAndFetchTokens: () => Promise<number>;
  forceFetchTokens: () => Promise<number>;
  checkTokenUsage: () => Promise<boolean>;

  recordScan: (
    scanData: Omit<ScanHistory, 'id' | 'user_id' | 'created_at' | 'tokens_used'>,
    tokensUsed?: number
  ) => Promise<ScanHistory>;
  getScanHistory: (limit?: number) => Promise<ScanHistory[]>;
  getHistoryItem: (scanId: string) => Promise<ScanHistory | null>;
  fetchHistory: (filters?: HistoryFilters) => Promise<{
    scans: ScanHistory[];
    grouped: Record<string, ScanHistory[]>;
    stats: HistoryStats;
  }>;
  deleteHistoryItem: (scanId: string) => Promise<boolean>;
  clearHistory: () => Promise<boolean>;
  exportHistory: (format: 'csv' | 'json') => Promise<string>;
  getHistoryStats: () => Promise<HistoryStats>;

  recordQRScan: (walletAddress: string, ensDomain?: string, metadata?: Record<string, unknown>) => Promise<QRScanData>;
  getQRScans: (limit?: number) => Promise<QRScanData[]>;
  clearQRScans: () => Promise<void>;

  subscribeToPlan: (planIdOrName: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refillTokens: (tokens: number) => Promise<void>;

  startSubscriptionPayment: (options: { planId?: string; tokens?: number; amount: number }) => Promise<{ authorization_url: string; reference: string }>;
  verifyPayment: (reference: string) => Promise<boolean>;
  clearAuthorizationDetails: () => void;

  uploadAvatarFile: (file: File) => Promise<string>;
  getPlanByName: (name: string) => SubscriptionPlan | undefined;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}

const AVATAR_BUCKET = 'avatars';
const QR_SCANS_TABLE = 'qr_scans';
const PLANS_TABLE = 'subscription_plans';
const PROFILES_TABLE = 'profiles';
const SCANS_TABLE = 'scans_history';

const defaultPlans: SubscriptionPlan[] = [
  { id: 'basic', key: 'basic', name: 'Basic', monthly_tokens: 10, monthly_price_usd: 0.99, scan_price_usd: 0.099, features: [] },
  { id: 'standard', key: 'standard', name: 'Standard', monthly_tokens: 110, monthly_price_usd: 9.9, scan_price_usd: 0.09, features: [] },
  { id: 'pro', key: 'pro', name: 'Pro', monthly_tokens: 230, monthly_price_usd: 19.99, scan_price_usd: 0.087, features: [] },
  { id: 'business', key: 'business', name: 'Business', monthly_tokens: 1500, monthly_price_usd: 29.0, scan_price_usd: 0.019, features: [] },
];

function getDefaultStats(): HistoryStats {
  return {
    totalScans: 0,
    riskAvg: 0,
    tokensUsed: 0,
    byType: { text: 0, url: 0, email: 0, qr: 0, wallet: 0 },
    byRisk: { critical: 0, high: 0, medium: 0, low: 0, safe: 0 },
  };
}

function calculateStats(scans: ScanHistory[]): HistoryStats {
  const totalScans = scans.length;
  const riskSum = scans.reduce((sum, scan) => {
    const score = parseInt(scan.risk_score || '0', 10);
    return sum + (Number.isFinite(score) ? score : 0);
  }, 0);

  const tokensUsed = scans.reduce((sum, scan) => sum + (scan.tokens_used || 1), 0);
  const byType = { text: 0, url: 0, email: 0, qr: 0, wallet: 0 };
  const byRisk = { critical: 0, high: 0, medium: 0, low: 0, safe: 0 };

  scans.forEach((scan) => {
    const t = scan.content_type as keyof typeof byType;
    if (byType[t] !== undefined) byType[t] += 1;
    const score = parseInt(scan.risk_score || '0', 10);
    if (score >= 85) byRisk.critical += 1;
    else if (score >= 70) byRisk.high += 1;
    else if (score >= 40) byRisk.medium += 1;
    else if (score >= 20) byRisk.low += 1;
    else byRisk.safe += 1;
  });

  return {
    totalScans,
    riskAvg: totalScans > 0 ? Math.round(riskSum / totalScans) : 0,
    tokensUsed,
    byType,
    byRisk,
  };
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [qrScans, setQrScans] = useState<QRScanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authorizationDetails, setAuthorizationDetails] = useState<AuthDetails | null>(null);
  const profileId = profile?.id;

  const findPlan = useCallback(
    (planIdOrName: string) => {
      const direct = subscriptionPlans.find((p) => p.id === planIdOrName || p.key === planIdOrName);
      if (direct) return direct;
      return subscriptionPlans.find((p) => p.name.toLowerCase() === planIdOrName.toLowerCase());
    },
    [subscriptionPlans]
  );

  const attachPlanToProfile = useCallback(
    (profileData: UserProfile, plans: SubscriptionPlan[]) => {
      if (profileData.subscription_plan_id && plans.length > 0) {
        const plan = plans.find((p) => p.id === profileData.subscription_plan_id);
        if (plan) return { ...profileData, subscription_plan: plan };
      }
      return { ...profileData, subscription_plan: undefined };
    },
    []
  );

  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(PLANS_TABLE)
        .select('id, key, name, monthly_tokens, monthly_price_usd, scan_price_usd')
        .order('monthly_tokens', { ascending: true });

      if (error) throw error;
      const plans = (data?.length ? data : defaultPlans) as SubscriptionPlan[];
      setSubscriptionPlans(plans);
      return plans;
    } catch {
      setSubscriptionPlans(defaultPlans);
      return defaultPlans;
    }
  }, []);

  const createProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.auth.getUser();
    const authUser = data.user;
    const userMetadata = (authUser?.user_metadata ?? {}) as Record<string, unknown>;
    const newProfile: Partial<UserProfile> = {
      id: userId,
      email: authUser?.email || '',
      full_name: typeof userMetadata.full_name === 'string' ? userMetadata.full_name : null,
      avatar_url: typeof userMetadata.avatar_url === 'string' ? userMetadata.avatar_url : null,
      subscription_plan_id: null,
      tokens_remaining: 2,
      tokens_used_total: 0,
      subscription_status: 'inactive',
      current_period_end: null,
      last_scan_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from(PROFILES_TABLE)
      .insert([newProfile])
      .select('*')
      .single();

    if (error) {
      const local: UserProfile = {
        ...(newProfile as UserProfile),
        subscription_plan: undefined,
        qr_scans: [],
      };
      setProfile(local);
      return local;
    }

    const complete: UserProfile = { ...(inserted as UserProfile), subscription_plan: undefined, qr_scans: [] };
    setProfile(complete);
    return complete;
  }, []);

  const getQRScans = useCallback(
    async (limit = 50) => {
      if (!profileId) return [];
      try {
        const { data, error } = await supabase
          .from(QR_SCANS_TABLE)
          .select('*')
          .eq('user_id', profileId)
          .order('scanned_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        setQrScans((data || []) as QRScanData[]);
        return (data || []) as QRScanData[];
      } catch {
        return qrScans;
      }
    },
    [profileId, qrScans]
  );

  const fetchProfile = useCallback(
    async (userId: string) => {
      const plans = subscriptionPlans.length ? subscriptionPlans : await fetchSubscriptionPlans();

      const { data: profileData, error } = await supabase.from(PROFILES_TABLE).select('*').eq('id', userId).single();

      if (error) {
        const code = getErrorCode(error);
        if (code === 'PGRST116') {
          return await createProfile(userId);
        }
        throw error;
      }

      const base = profileData as UserProfile;
      if (base.tokens_remaining === null || base.tokens_remaining === undefined) {
        await supabase.from(PROFILES_TABLE).update({ tokens_remaining: 0 }).eq('id', userId);
        base.tokens_remaining = 0;
      }

      let qr: QRScanData[] = [];
      try {
        const { data: qrData } = await supabase
          .from(QR_SCANS_TABLE)
          .select('*')
          .eq('user_id', userId)
          .order('scanned_at', { ascending: false })
          .limit(20);
        qr = (qrData || []) as QRScanData[];
        setQrScans(qr);
      } catch {
        // ignore and leave qr_scans empty
      }

      const complete = attachPlanToProfile({ ...base, qr_scans: qr }, plans);
      setProfile(complete);
      return complete;
    },
    [attachPlanToProfile, createProfile, fetchSubscriptionPlans, subscriptionPlans]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setQrScans([]);
      setLoading(false);
      return;
    }
    setRefreshing(true);
    try {
      await fetchProfile(user.id);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchProfile, user]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await fetchSubscriptionPlans();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchSubscriptionPlans]);

  useEffect(() => {
    void refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('paystack_auth');
      if (raw) setAuthorizationDetails(JSON.parse(raw) as AuthDetails);
    } catch {
      // ignore
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!profile) throw new Error('No profile found');
      const { data, error } = await supabase
        .from(PROFILES_TABLE)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .select('*')
        .single();
      if (error) throw error;
      setProfile(attachPlanToProfile(data as UserProfile, subscriptionPlans));
    },
    [attachPlanToProfile, profile, subscriptionPlans]
  );

  const forceFetchTokens = useCallback(async () => {
    if (!profile) throw new Error('No profile found');
    const { data, error } = await supabase.from(PROFILES_TABLE).select('tokens_remaining').eq('id', profile.id).single();
    if (error) return profile.tokens_remaining || 0;
    const newTokens = ((data as { tokens_remaining?: number | null })?.tokens_remaining ?? 0) || 0;
    setProfile((prev) => (prev ? { ...prev, tokens_remaining: newTokens } : prev));
    return newTokens;
  }, [profile]);

  const validateAndFetchTokens = useCallback(async () => {
    if (!profile) throw new Error('No profile found');
    if (profile.tokens_remaining !== null && profile.tokens_remaining !== undefined) return profile.tokens_remaining;
    return await forceFetchTokens();
  }, [forceFetchTokens, profile]);

  const updateTokens = useCallback(
    async (tokensChange: number) => {
      if (!profile) throw new Error('No profile found');
      const currentTokens = await validateAndFetchTokens();
      const newTokens = Math.max(0, currentTokens + tokensChange);
      const tokensUsed = tokensChange < 0 ? -tokensChange : 0;

      try {
        const { data, error } = await supabase
          .from(PROFILES_TABLE)
          .update({
            tokens_remaining: newTokens,
            tokens_used_total: (profile.tokens_used_total || 0) + tokensUsed,
            last_scan_at: tokensChange < 0 ? new Date().toISOString() : profile.last_scan_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
          .select('*')
          .single();
        if (error) throw error;
        setProfile(attachPlanToProfile(data as UserProfile, subscriptionPlans));
      } catch (e) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                tokens_remaining: newTokens,
                tokens_used_total: tokensChange < 0 ? prev.tokens_used_total - tokensChange : prev.tokens_used_total,
              }
            : prev
        );
        throw e;
      }
    },
    [attachPlanToProfile, profile, subscriptionPlans, validateAndFetchTokens]
  );

  const recordScan = useCallback(
    async (scanData: Omit<ScanHistory, 'id' | 'user_id' | 'created_at' | 'tokens_used'>, tokensUsed = 1) => {
      if (!profile) throw new Error('No profile found');
      const { data, error } = await supabase
        .from(SCANS_TABLE)
        .insert([
          {
            user_id: profile.id,
            tokens_used: tokensUsed,
            ...scanData,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (error) throw error;
      await updateTokens(-tokensUsed);
      return data as ScanHistory;
    },
    [profile, updateTokens]
  );

  const getScanHistory = useCallback(
    async (limit = 50) => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from(SCANS_TABLE)
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as ScanHistory[];
    },
    [profileId]
  );

  const getHistoryItem = useCallback(
    async (scanId: string) => {
      if (!profileId) return null;
      const { data, error } = await supabase.from(SCANS_TABLE).select('*').eq('id', scanId).eq('user_id', profileId).single();
      if (error) {
        const code = getErrorCode(error);
        if (code === 'PGRST116') return null;
        throw error;
      }
      return data as ScanHistory;
    },
    [profileId]
  );

  const fetchHistory = useCallback(
    async (filters: HistoryFilters = {}) => {
      if (!profileId) return { scans: [], grouped: {}, stats: getDefaultStats() };

      try {
        let query = supabase.from(SCANS_TABLE).select('*').eq('user_id', profileId).order('created_at', { ascending: false });

        if (filters.contentType) query = query.eq('content_type', filters.contentType);
        if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
        if (filters.dateTo) query = query.lte('created_at', filters.dateTo);
        if (filters.limit) query = query.limit(filters.limit);
        if (filters.searchQuery) {
          query = query.or(
            `content.ilike.%${filters.searchQuery}%,classification.ilike.%${filters.searchQuery}%,explanation.ilike.%${filters.searchQuery}%`
          );
        }

        const { data: scans, error } = await query;
        if (error) throw error;

        const rows = (scans || []) as ScanHistory[];
        const grouped = rows.reduce((acc, scan) => {
          const date = new Date(scan.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          if (!acc[date]) acc[date] = [];
          acc[date].push(scan);
          return acc;
        }, {} as Record<string, ScanHistory[]>);

        const stats = calculateStats(rows);
        return { scans: rows, grouped, stats };
      } catch {
        return { scans: [], grouped: {}, stats: getDefaultStats() };
      }
    },
    [profileId]
  );

  const deleteHistoryItem = useCallback(
    async (scanId: string) => {
      if (!profileId) throw new Error('No profile found');
      const { error } = await supabase.from(SCANS_TABLE).delete().eq('id', scanId).eq('user_id', profileId);
      if (error) throw error;
      return true;
    },
    [profileId]
  );

  const clearHistory = useCallback(async () => {
    if (!profileId) throw new Error('No profile found');
    const { error } = await supabase.from(SCANS_TABLE).delete().eq('user_id', profileId);
    if (error) throw error;
    return true;
  }, [profileId]);

  const exportHistory = useCallback(
    async (format: 'csv' | 'json' = 'json') => {
      if (!profileId) throw new Error('No profile found');
      const { data: scans, error } = await supabase
        .from(SCANS_TABLE)
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const rows = (scans || []) as ScanHistory[];
      if (format === 'csv') {
        const headers = ['Date', 'Content Type', 'Content', 'Risk Score', 'Classification', 'Explanation', 'Recommendations', 'Tokens Used'];
        const dataRows = rows.map((scan) => [
          new Date(scan.created_at).toISOString(),
          scan.content_type,
          `"${scan.content.replace(/"/g, '""')}"`,
          scan.risk_score,
          scan.classification,
          `"${scan.explanation.replace(/"/g, '""')}"`,
          `"${scan.recommendations.replace(/"/g, '""')}"`,
          scan.tokens_used,
        ]);
        return [headers.join(','), ...dataRows.map((r) => r.join(','))].join('\n');
      }

      return JSON.stringify({ exportedAt: new Date().toISOString(), userId: profileId, scans: rows }, null, 2);
    },
    [profileId]
  );

  const getHistoryStats = useCallback(async () => {
    if (!profileId) return getDefaultStats();
    const { data: scans, error } = await supabase.from(SCANS_TABLE).select('*').eq('user_id', profileId);
    if (error) return getDefaultStats();
    return calculateStats((scans || []) as ScanHistory[]);
  }, [profileId]);

  const recordQRScan = useCallback(
    async (walletAddress: string, ensDomain?: string, metadata?: Record<string, unknown>) => {
      if (!profileId) throw new Error('No profile found');
      const scanType: QRScanData['scan_type'] = ensDomain ? 'ethereum' : 'other';
      const scanData: QRScanData & { user_id: string; created_at: string } = {
        user_id: profileId,
        wallet_address: walletAddress.toLowerCase(),
        ens_domain: ensDomain?.toLowerCase(),
        scan_type: scanType,
        scanned_at: new Date().toISOString(),
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from(QR_SCANS_TABLE).insert([scanData]).select().single();
      if (error) {
        const local: QRScanData = { ...scanData, id: Date.now().toString(), wallet_address: scanData.wallet_address };
        setQrScans((prev) => [local, ...prev]);
        return local;
      }
      setQrScans((prev) => [data as QRScanData, ...prev]);
      return data as QRScanData;
    },
    [profileId]
  );

  const clearQRScans = useCallback(async () => {
    if (!profileId) throw new Error('No profile found');
    const { error } = await supabase.from(QR_SCANS_TABLE).delete().eq('user_id', profileId);
    if (error) throw error;
    setQrScans([]);
  }, [profileId]);

  const subscribeToPlan = useCallback(
    async (planIdOrName: string) => {
      if (!profile) throw new Error('No profile found');
      const plan = findPlan(planIdOrName);
      if (!plan) throw new Error(`Plan not found: ${planIdOrName}`);

      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      const { data, error } = await supabase
        .from(PROFILES_TABLE)
        .update({
          subscription_plan_id: plan.id,
          tokens_remaining: (profile.tokens_remaining || 0) + plan.monthly_tokens,
          subscription_status: 'active',
          current_period_end: currentPeriodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) throw error;
      const updated = data as UserProfile;

      await supabase.from('subscription_history').insert([
        {
          user_id: profile.id,
          plan_id: plan.id,
          action: 'subscribed',
          tokens_added: plan.monthly_tokens,
          tokens_remaining: updated.tokens_remaining,
          metadata: { plan_name: plan.name },
        },
      ]);

      setProfile({ ...updated, subscription_plan: plan });
    },
    [findPlan, profile]
  );

  const cancelSubscription = useCallback(async () => {
    if (!profile) throw new Error('No profile found');

    const { data, error } = await supabase
      .from(PROFILES_TABLE)
      .update({ subscription_status: 'canceled', current_period_end: null, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
      .select('*')
      .single();
    if (error) throw error;
    const updated = data as UserProfile;

    await supabase.from('subscription_history').insert([
      {
        user_id: profile.id,
        plan_id: profile.subscription_plan_id,
        action: 'canceled',
        tokens_added: 0,
        tokens_remaining: updated.tokens_remaining,
        metadata: { previous_plan: profile.subscription_plan?.name, tokens_at_cancellation: profile.tokens_remaining },
      },
    ]);

    setProfile({ ...updated, subscription_plan: undefined });
  }, [profile]);

  const refillTokens = useCallback(
    async (tokens: number) => {
      if (!profile) throw new Error('No profile found');

      const { data, error } = await supabase
        .from(PROFILES_TABLE)
        .update({ tokens_remaining: (profile.tokens_remaining || 0) + tokens, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .select('*')
        .single();
      if (error) throw error;
      const updated = data as UserProfile;

      await supabase.from('subscription_history').insert([
        {
          user_id: profile.id,
          plan_id: profile.subscription_plan_id,
          action: 'tokens_refilled',
          tokens_added: tokens,
          tokens_remaining: updated.tokens_remaining,
          metadata: { previous_tokens: profile.tokens_remaining },
        },
      ]);

      setProfile(attachPlanToProfile(updated, subscriptionPlans));
    },
    [attachPlanToProfile, profile, subscriptionPlans]
  );

  const startSubscriptionPayment = useCallback(
    async (options: { planId?: string; tokens?: number; amount: number }) => {
      if (!profile) throw new Error('No profile found');
      let planId = options.planId;
      if (options.planId) {
        const plan = findPlan(options.planId);
        if (plan) planId = plan.id;
      }

      const payment = await initPaystack({
        email: profile.email,
        amount: options.amount,
        metadata: {
          planId,
          tokens: options.tokens,
          userId: profile.id,
          type: options.planId ? 'subscription' : 'token_purchase',
        },
      });

      const details = { authUrl: payment.authorization_url, reference: payment.reference };
      setAuthorizationDetails(details);
      localStorage.setItem('paystack_auth', JSON.stringify(details));
      return payment;
    },
    [findPlan, profile]
  );

  const clearAuthorizationDetails = useCallback(() => {
    setAuthorizationDetails(null);
    try {
      localStorage.removeItem('paystack_auth');
    } catch {
      // ignore
    }
  }, []);

  const verifyPayment = useCallback(
    async (reference: string) => {
      const verified = await verifyPaystack(reference);
      if (verified) {
        clearAuthorizationDetails();
        await refreshProfile();
      }
      return verified;
    },
    [clearAuthorizationDetails, refreshProfile]
  );

  const uploadAvatarFile = useCallback(
    async (file: File) => {
      if (!profile) throw new Error('No profile found');
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `${profile.id}-${Date.now()}.${ext}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, file, {
        contentType: file.type || `image/${ext}`,
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
      const url = data.publicUrl;
      await updateProfile({ avatar_url: url });
      return url;
    },
    [profile, updateProfile]
  );

  const checkTokenUsage = useCallback(async () => {
    if (!profile) return false;
    try {
      const currentTokens = await validateAndFetchTokens();
      return currentTokens > 0 || profile.subscription_status === 'active';
    } catch {
      return (profile.tokens_remaining || 0) > 0 || profile.subscription_status === 'active';
    }
  }, [profile, validateAndFetchTokens]);

  const hasTokens = profile ? (profile.tokens_remaining || 0) > 0 : false;
  const tokensRemaining = profile?.tokens_remaining || 0;

  const getPlanByName = useCallback(
    (name: string) => subscriptionPlans.find((p) => p.name.toLowerCase() === name.toLowerCase()),
    [subscriptionPlans]
  );

  const value = useMemo<ProfileContextType>(
    () => ({
      profile,
      subscriptionPlans,
      loading,
      refreshing,
      hasTokens,
      tokensRemaining,
      qrScans,
      authorizationDetails,
      refreshProfile,
      updateProfile,
      updateTokens,
      validateAndFetchTokens,
      forceFetchTokens,
      checkTokenUsage,
      recordScan,
      getScanHistory,
      getHistoryItem,
      fetchHistory,
      deleteHistoryItem,
      clearHistory,
      exportHistory,
      getHistoryStats,
      recordQRScan,
      getQRScans,
      clearQRScans,
      subscribeToPlan,
      cancelSubscription,
      refillTokens,
      startSubscriptionPayment,
      verifyPayment,
      clearAuthorizationDetails,
      uploadAvatarFile,
      getPlanByName,
    }),
    [
      authorizationDetails,
      cancelSubscription,
      checkTokenUsage,
      clearAuthorizationDetails,
      clearHistory,
      clearQRScans,
      deleteHistoryItem,
      exportHistory,
      fetchHistory,
      forceFetchTokens,
      getHistoryItem,
      getHistoryStats,
      getPlanByName,
      getQRScans,
      getScanHistory,
      hasTokens,
      loading,
      profile,
      qrScans,
      recordQRScan,
      recordScan,
      refreshing,
      refillTokens,
      refreshProfile,
      startSubscriptionPayment,
      subscribeToPlan,
      subscriptionPlans,
      tokensRemaining,
      updateProfile,
      updateTokens,
      uploadAvatarFile,
      validateAndFetchTokens,
      verifyPayment,
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
