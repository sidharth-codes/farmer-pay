import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG as QRCodeReact } from 'qrcode.react';
import { Download, QrCode, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils';
import type { QRCode } from '../../types';

interface QRCardProps {
  qrCode: QRCode | null;
  batchInternalId: string;
  onDownload?: (format: 'PNG' | 'SVG' | 'PDF' | 'STICKER') => void;
  loading?: boolean;
  className?: string;
}

export function QRCard({ qrCode, batchInternalId, onDownload, loading, className }: QRCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const verifyUrl = qrCode?.verifyUrl ?? `https://farmerpay.app/verify/${batchInternalId}`;

  useEffect(() => {
    if (canvasRef.current && verifyUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // QR is rendered by QRCodeReact component, canvas is for potential export
    }
  }, [verifyUrl]);

  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-border bg-card p-6 shadow-soft', className)}>
        <div className="flex items-center gap-2">
          <QrCode size={20} className="text-primary" />
          <h3 className="font-display text-base font-semibold">QR Code</h3>
        </div>
        <div className="mt-4 flex aspect-square items-center justify-center rounded-xl bg-secondary/30 animate-pulse">
          <QrCode size={48} className="text-muted-foreground/30" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6 shadow-soft', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode size={20} className="text-primary" />
          <h3 className="font-display text-base font-semibold">QR Code</h3>
        </div>
        {qrCode && (
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
            v{qrCode.version} · Active
          </span>
        )}
      </div>

      {qrCode ? (
        <>
          <div className="mt-4 flex flex-col items-center">
            <div className="rounded-xl border-2 border-border bg-white p-4">
              <QRCodeReact
                value={verifyUrl}
                size={200}
                level="H"
                marginSize={0}
              />
            </div>
            <p className="mt-3 font-mono text-sm font-medium text-primary">{batchInternalId}</p>
            <p className="mt-1 text-xs text-muted-foreground break-all text-center max-w-xs">{verifyUrl}</p>
          </div>

          <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-success/5 px-3 py-2 text-xs text-success">
            <ShieldCheck size={14} className="shrink-0" />
            <span>Cryptographically signed · Tamper-proof</span>
          </div>

          {onDownload && (
            <div className="mt-4">
              {downloadOpen ? (
                <div className="grid grid-cols-2 gap-2">
                  {(['PNG', 'SVG', 'PDF', 'STICKER'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => {
                        onDownload(fmt);
                        setDownloadOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary hover:border-primary/40"
                    >
                      <Download size={14} />
                      {fmt}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setDownloadOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary hover:border-primary/40"
                >
                  <Download size={16} />
                  Download QR
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50">
            <QrCode size={32} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            No QR code generated yet. Generate one to create a permanent digital identity for this batch.
          </p>
        </div>
      )}
    </div>
  );
}
