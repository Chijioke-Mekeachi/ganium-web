'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ContentType, ScanResult } from '@/lib/types';
import * as scanApi from '@/lib/api/scan';
import { useProfile } from '@/contexts/ProfileContext';

interface ScanContextType {
  loading: boolean;
  latestResult: ScanResult | null;
  scanHistory: ScanResult[];
  tokensRemaining: number;
  hasTokens: boolean;
  scanText: (text: string) => Promise<ScanResult>;
  scanUrl: (url: string) => Promise<ScanResult>;
  scanEmail: (emailId: string) => Promise<ScanResult>;
  scanWallet: (wallet: string) => Promise<ScanResult>;
  resetResult: () => void;
  clearHistory: () => void;
}

const ScanContext = createContext<ScanContextType | null>(null);

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used within ScanProvider');
  return ctx;
}

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const { profile, recordScan, checkTokenUsage, hasTokens, tokensRemaining } = useProfile();

  const requireTokens = useCallback(
    async (contentType: ContentType) => {
      if (!profile) throw new Error('Please sign in to use the scanner');
      const tokensNeeded = contentType === 'wallet' ? 2 : 1;

      const ok = await checkTokenUsage();
      if (!ok) throw new Error('No tokens remaining. Please upgrade your subscription or refill tokens.');
      if ((profile.tokens_remaining || 0) < tokensNeeded) {
        throw new Error(`Insufficient tokens. This scan requires ${tokensNeeded} tokens.`);
      }
      return tokensNeeded;
    },
    [checkTokenUsage, profile]
  );

  type ApiScanResponse = {
    riskScore?: string;
    risk_score?: string;
    classification?: string;
    explanation?: string;
    recommendations?: string;
    detectedBy?: string;
  };

  const request = useCallback(
    async (contentType: ContentType, fn: () => Promise<ApiScanResponse>, content: string) => {
      setLoading(true);
      try {
        const tokensUsed = await requireTokens(contentType);
        const apiResult = await fn();

        const formatted: ScanResult = {
          content,
          contentType,
          riskScore: apiResult.riskScore ?? apiResult.risk_score ?? '0',
          classification: apiResult.classification ?? 'Unknown',
          explanation: apiResult.explanation ?? '',
          recommendations: apiResult.recommendations ?? '',
          detectedBy: apiResult.detectedBy,
          timestamp: new Date().toISOString(),
          tokensUsed,
        };

        await recordScan(
          {
            content,
            content_type: contentType,
            risk_score: formatted.riskScore,
            classification: formatted.classification,
            explanation: formatted.explanation,
            recommendations: formatted.recommendations,
          },
          tokensUsed
        );

        setLatestResult(formatted);
        setScanHistory((prev) => [formatted, ...prev.slice(0, 9)]);
        return formatted;
      } finally {
        setLoading(false);
      }
    },
    [recordScan, requireTokens]
  );

  const scanText = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t) throw new Error('Please enter text to scan');
      const truncated = t.length > 1000 ? `${t.substring(0, 1000)}...` : t;
      return request('text', () => scanApi.scanText(truncated), truncated);
    },
    [request]
  );

  const scanUrl = useCallback(
    async (url: string) => {
      const u = url.trim();
      if (!u) throw new Error('Please enter a URL to scan');
      try {
        new URL(u);
      } catch {
        throw new Error('Please enter a valid URL');
      }
      const clean = u.toLowerCase();
      return request('url', () => scanApi.scanUrl(clean), clean);
    },
    [request]
  );

  const scanEmail = useCallback(
    async (emailId: string) => {
      const e = emailId.trim().toLowerCase();
      if (!e) throw new Error('Please enter an email address to scan');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(e)) throw new Error('Please enter a valid email address');
      return request('email', () => scanApi.scanEmail(e), e);
    },
    [request]
  );

  const scanWallet = useCallback(
    async (wallet: string) => {
      const w = wallet.trim();
      if (!w) throw new Error('Please enter a wallet address to scan');
      const walletRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!walletRegex.test(w)) throw new Error('Please enter a valid Ethereum wallet address (0x + 40 hex chars)');
      const clean = w.toLowerCase();
      return request('wallet', () => scanApi.scanWallet(clean), clean);
    },
    [request]
  );

  const resetResult = useCallback(() => setLatestResult(null), []);
  const clearHistory = useCallback(() => setScanHistory([]), []);

  const value = useMemo<ScanContextType>(
    () => ({
      loading,
      latestResult,
      scanHistory,
      tokensRemaining,
      hasTokens,
      scanText,
      scanUrl,
      scanEmail,
      scanWallet,
      resetResult,
      clearHistory,
    }),
    [
      clearHistory,
      hasTokens,
      latestResult,
      loading,
      resetResult,
      scanEmail,
      scanHistory,
      scanText,
      scanUrl,
      scanWallet,
      tokensRemaining,
    ]
  );

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}
