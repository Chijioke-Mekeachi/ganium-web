import { NextResponse } from 'next/server';

const BASE_URL = process.env.SENTINELAI_API_BASE_URL || 'https://sentinelai-backend.vercel.app/';

export async function POST(req: Request) {
  const payload = await req.json();
  const res = await fetch(`${BASE_URL}paystack/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  }

  const data = await res.json();
  const responseData = data?.data || data;
  return NextResponse.json({
    authorization_url: responseData.authorization_url,
    reference: responseData.reference,
  });
}

