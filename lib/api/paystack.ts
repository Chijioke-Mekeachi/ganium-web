export interface PaymentResponse {
  authorization_url: string;
  reference: string;
}

export async function initializePayment(payload: {
  amount: number;
  email: string;
  metadata?: unknown;
}): Promise<PaymentResponse> {
  const res = await fetch('/api/paystack/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to initialize payment');
  }

  return (await res.json()) as PaymentResponse;
}

export async function verifyPayment(reference: string): Promise<boolean> {
  const res = await fetch(`/api/paystack/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to verify payment');
  }

  const data = (await res.json()) as { verified: boolean };
  return data.verified;
}

