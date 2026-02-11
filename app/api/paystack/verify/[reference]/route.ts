import { NextResponse } from 'next/server';

const BASE_URL = process.env.SENTINELAI_API_BASE_URL || 'https://sentinelai-backend.vercel.app/';

export async function GET(_req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const res = await fetch(`${BASE_URL}paystack/verify/${encodeURIComponent(reference)}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  }

  const data = await res.json();
  const ok = !!(data?.status && data?.data && data?.data?.status === 'success');
  return NextResponse.json({ verified: ok });
}
