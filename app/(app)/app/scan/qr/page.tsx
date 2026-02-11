'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useScan } from '@/contexts/ScanContext';
import { useProfile } from '@/contexts/ProfileContext';
import { getErrorMessage } from '@/lib/errors';

function extractEthereumAddress(qrData: string): string | null {
  const cleanData = qrData.trim();
  const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
  if (ethereumRegex.test(cleanData)) return cleanData.toLowerCase();
  const ethUriRegex = /^ethereum:(0x[a-fA-F0-9]{40})(?:\\?.*)?$/;
  const ethUriMatch = cleanData.match(ethUriRegex);
  if (ethUriMatch) return ethUriMatch[1].toLowerCase();
  if (cleanData.includes('0x')) {
    const addressMatch = cleanData.match(/(0x[a-fA-F0-9]{40})/);
    if (addressMatch) return addressMatch[1].toLowerCase();
  }
  return null;
}

function isUrl(content: string) {
  try {
    new URL(content.trim());
    return true;
  } catch {
    return false;
  }
}

export default function QRScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const { scanText, scanUrl, scanWallet } = useScan();
  const { recordQRScan } = useProfile();

  const detectorAvailable = typeof window !== 'undefined' && 'BarcodeDetector' in window;
  const [supported, setSupported] = useState(detectorAvailable);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [manual, setManual] = useState('');
  const [error, setError] = useState<string | null>(null);

  const stop = async () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRunning(false);
    setStatus('');
  };

  useEffect(() => {
    return () => {
      void stop();
    };
  }, []);

  const handleContent = async (content: string) => {
    setError(null);
    setStatus('Processing…');

    const wallet = extractEthereumAddress(content);
    if (wallet) {
      setStatus('Scanning wallet…');
      const result = await scanWallet(wallet);
      await recordQRScan(wallet, undefined, { source: 'web_qr', raw_data: content.slice(0, 200), tokens_used: 2 });
      void result;
      router.push('/app/result');
      return;
    }

    if (isUrl(content)) {
      setStatus('Scanning URL…');
      await scanUrl(content);
      router.push('/app/result');
      return;
    }

    setStatus('Scanning text…');
    await scanText(content);
    router.push('/app/result');
  };

  const start = async () => {
    setError(null);
    if (!detectorAvailable) {
      setSupported(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      type Barcode = { rawValue?: string };
      type BarcodeDetectorInstance = { detect: (source: HTMLVideoElement) => Promise<Barcode[]> };
      type BarcodeDetectorConstructor = new (options?: { formats: string[] }) => BarcodeDetectorInstance;

      const Detector = (window as unknown as { BarcodeDetector: BarcodeDetectorConstructor }).BarcodeDetector;
      const detector = new Detector({ formats: ['qr_code'] });

      setRunning(true);
      setStatus('Point your camera at a QR code…');

      timerRef.current = window.setInterval(async () => {
        const v = videoRef.current;
        if (!v || v.readyState < 2) return;
        try {
          const barcodes = await detector.detect(v);
          if (!barcodes?.length) return;
          const value = barcodes[0]?.rawValue;
          if (!value) return;
          await stop();
          await handleContent(value);
        } catch {
          // ignore and keep scanning
        }
      }, 300);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || 'Failed to access camera');
      setSupported(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ga-text)]">QR Scanner</h1>
          <p className="ga-muted">Scans URLs/text (1 token) and Ethereum wallets (2 tokens).</p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/app')}>
          Close
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[rgb(239_83_80/0.35)] bg-[rgb(239_83_80/0.10)] p-3 text-sm text-[var(--ga-text)]">
          {error}
        </div>
      ) : null}
      {status ? (
        <div className="rounded-2xl border border-[rgb(var(--ga-border-rgb)/0.9)] bg-[rgb(var(--ga-card-rgb)/0.55)] p-3 text-sm text-[var(--ga-text)]">
          {status}
        </div>
      ) : null}

      {!supported ? (
        <div className="ga-surface-soft p-5">
          <div className="font-semibold text-[var(--ga-text)]">Camera QR scanning not supported in this browser.</div>
          <div className="mt-2 text-sm ga-muted">Use the manual input below (paste the decoded QR content).</div>
        </div>
      ) : (
        <div className="rounded-[var(--ga-radius-surface)] border border-[rgb(var(--ga-border-rgb)/0.9)] bg-black overflow-hidden">
          <video ref={videoRef} className="h-[360px] w-full object-cover" muted playsInline />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!running ? (
          <Button onClick={start} disabled={!supported}>
            Start camera
          </Button>
        ) : (
          <Button variant="secondary" onClick={stop}>
            Stop
          </Button>
        )}
      </div>

      <div className="ga-surface-soft p-5 space-y-3">
        <div className="text-sm font-semibold text-[var(--ga-text)]">Manual input</div>
        <Input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Paste QR content here…" />
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await handleContent(manual);
            } catch (e: unknown) {
              setError(getErrorMessage(e) || 'Failed');
            }
          }}
        >
          Analyze
        </Button>
      </div>
    </div>
  );
}
