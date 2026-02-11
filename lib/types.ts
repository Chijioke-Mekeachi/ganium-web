export type ContentType = 'text' | 'url' | 'email' | 'wallet';

export interface ScanResult {
  content: string;
  contentType: ContentType;
  riskScore: string;
  classification: string;
  explanation: string;
  recommendations: string;
  detectedBy?: string;
  timestamp?: string;
  source?: string;
  tokensUsed?: number;
  additionalData?: Record<string, unknown>;
}

export interface SubscriptionPlan {
  id: string;
  key: string;
  name: string;
  monthly_tokens: number;
  monthly_price_usd: number;
  scan_price_usd: number;
  features?: string[];
}

export interface QRScanData {
  id?: string;
  user_id?: string;
  wallet_address: string;
  ens_domain?: string;
  scan_type: 'ethereum' | 'other';
  scanned_at: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_plan_id: string | null;
  tokens_remaining: number;
  tokens_used_total: number;
  subscription_status: 'active' | 'canceled' | 'past_due' | 'inactive';
  current_period_end: string | null;
  last_scan_at: string | null;
  created_at: string;
  updated_at: string;
  subscription_plan?: SubscriptionPlan;
  qr_scans?: QRScanData[];
}

export interface ScanHistory {
  id: string;
  user_id: string;
  content: string;
  content_type: 'text' | 'url' | 'email' | 'qr' | 'wallet';
  risk_score: string;
  classification: string;
  explanation: string;
  recommendations: string;
  tokens_used: number;
  created_at: string;
}

export interface HistoryFilters {
  contentType?: 'text' | 'url' | 'email' | 'qr' | 'wallet';
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  searchQuery?: string;
}

export interface HistoryStats {
  totalScans: number;
  riskAvg: number;
  tokensUsed: number;
  byType: {
    text: number;
    url: number;
    email: number;
    qr: number;
    wallet: number;
  };
  byRisk: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    safe: number;
  };
}

