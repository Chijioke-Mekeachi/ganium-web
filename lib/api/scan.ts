export type ApiScanResponse = {
  riskScore?: string;
  risk_score?: string;
  classification?: string;
  explanation?: string;
  recommendations?: string;
  detectedBy?: string;
  [key: string]: unknown;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  return (await res.json()) as T;
}

export async function scanText(text: string): Promise<ApiScanResponse> {
  return postJson<ApiScanResponse>('/api/scan/text', { text });
}

export async function scanUrl(url: string): Promise<ApiScanResponse> {
  return postJson<ApiScanResponse>('/api/scan/url', { url });
}

export async function scanEmail(emailId: string): Promise<ApiScanResponse> {
  return postJson<ApiScanResponse>('/api/scan/email', { emailId });
}

export async function scanWallet(wallet: string): Promise<ApiScanResponse> {
  return postJson<ApiScanResponse>('/api/scan/wallet', { wallet });
}
