import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/errors';

const BASE_URL = process.env.SENTINELAI_API_BASE_URL || 'https://sentinelai-backend.vercel.app/';
const API_KEY = process.env.SENTINELAI_API_KEY || 'sentinelai-secret-key';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${BASE_URL}scan/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    return NextResponse.json({ error: getErrorMessage(e) || 'Bad request' }, { status: 400 });
  }
}
