import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import {
  ArrowLeft, Package, MapPin, Calendar, Scale, Hash, Sprout, Leaf,
  QrCode as QrCodeIcon, Download, History, ShieldCheck, RefreshCw,
  Image as ImageIcon, Award, Clock, AlertTriangle,
} from 'lucide-react';
import {
  PageHeader, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, EmptyState, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  QRCard, PassportVerificationBadge, CertificationCard, ImageGallery,
  TimelinePlaceholder, buildPassportTimeline,
} from '../../../components/ui';
import { batchService, qrService, passportService } from '../../../services';
import { QUERY_KEYS, BATCH_STATUS_LABELS } from '../../../constants';
import { formatDate, formatRelativeTime } from '../../../utils';
import type { QRDownloadFormat } from '../../../types';

export function BatchPassportPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [scanHistoryOpen, setScanHistoryOpen] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const qrSvgRef = useRef<HTMLDivElement>(null);

  const { data: batch, isLoading } = useQuery({
    queryKey: QUERY_KEYS.batch(batchId ?? ''),
    queryFn: () => batchService.get(batchId!),
    enabled: !!batchId,
  });

  const { data: qrCode, refetch: refetchQR } = useQuery({
    queryKey: QUERY_KEYS.batchQR(batchId ?? ''),
    queryFn: () => qrService.getForBatch(batchId!),
    enabled: !!batchId,
  });

  const { data: passport } = useQuery({
    queryKey: QUERY_KEYS.batchPassport(batchId ?? ''),
    queryFn: () => passportService.getPassport(batchId!),
    enabled: !!batchId,
  });

  const generateMutation = useMutation({
    mutationFn: () => {
      if (!batch) throw new Error('Batch not loaded');
      return qrService.generateForBatch(batch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batchQR(batchId ?? '') });
    },
  });

  const regenMutation = useMutation({
    mutationFn: () => {
      if (!batch) throw new Error('Batch not loaded');
      return qrService.regenerate(batch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batchQR(batchId ?? '') });
      setRegenOpen(false);
    },
  });

  const handleDownload = useCallback(async (format: QRDownloadFormat) => {
    if (!qrCode || !batch) return;
    await qrService.logDownload(qrCode.id, batch.id, format);

    if (format === 'PNG') {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, qrCode.verifyUrl, {
        width: 1024,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const link = document.createElement('a');
      link.download = `${batch.batchId}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (format === 'SVG') {
      const svgString = await QRCode.toString(qrCode.verifyUrl, {
        type: 'svg',
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = `${batch.batchId}-qr.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
    } else if (format === 'PDF' || format === 'STICKER') {
      // Generate a printable label
      const labelHtml = generateLabelHtml(batch.batchId, batch.product?.name ?? 'Product', batch.harvest?.harvestDate ?? '', qrCode.verifyUrl);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(labelHtml);
        win.document.close();
        setTimeout(() => win.print(), 500);
      }
    }
  }, [qrCode, batch]);

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground">Loading batch...</div>;
  }

  if (!batch) {
    return (
      <EmptyState
        icon={<Package size={28} />}
        title="Batch not found"
        description="This batch may have been removed."
        action={<Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>}
      />
    );
  }

  const timeline = buildPassportTimeline(batch.batchId, passport?.passportData.currentHolder ?? null);

  return (
    <div>
      <PageHeader
        title="Digital Product Passport"
        description={`Immutable identity for ${batch.batchId}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Batches', href: '/dashboard/farmer/batches' },
          { label: batch.batchId },
          { label: 'Passport' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button variant="outline" onClick={() => setScanHistoryOpen(true)}>
              <History size={16} />
              Scan History
            </Button>
            {qrCode && (
              <Button variant="outline" onClick={() => setRegenOpen(true)}>
                <RefreshCw size={16} />
                Regenerate
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: QR + key info */}
        <div className="space-y-6">
          <QRCard
            qrCode={qrCode ?? null}
            batchInternalId={batch.batchId}
            onDownload={handleDownload}
            loading={generateMutation.isPending}
          />
          {!qrCode && !generateMutation.isPending && (
            <Button
              className="w-full"
              onClick={() => generateMutation.mutate()}
              loading={generateMutation.isPending}
            >
              <QrCodeIcon size={18} />
              Generate QR Code
            </Button>
          )}

          {/* Batch summary card */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={<Hash size={16} />} label="Batch ID">
                <span className="font-mono text-sm font-medium text-primary">{batch.batchId}</span>
              </InfoRow>
              <InfoRow icon={<Leaf size={16} />} label="Product">
                {batch.product?.name ?? '—'}
              </InfoRow>
              <InfoRow icon={<Sprout size={16} />} label="Farm">
                {batch.farm?.name ?? '—'}
              </InfoRow>
              <InfoRow icon={<Calendar size={16} />} label="Harvest Date">
                {batch.harvest ? formatDate(batch.harvest.harvestDate) : '—'}
              </InfoRow>
              <InfoRow icon={<Scale size={16} />} label="Quantity">
                {batch.quantity} {batch.unit}
              </InfoRow>
              <InfoRow icon={<MapPin size={16} />} label="Location">
                {batch.farm ? [batch.farm.district, batch.farm.state, batch.farm.country].filter(Boolean).join(', ') : '—'}
              </InfoRow>
            </CardContent>
          </Card>
        </div>

        {/* Center: Passport details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Hero / Status banner */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Package size={28} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">{batch.product?.name ?? 'Unknown Product'}</h2>
                    <p className="text-sm text-muted-foreground">
                      {batch.quantity} {batch.unit} · {batch.farm?.name ?? 'Unknown Farm'}
                    </p>
                  </div>
                </div>
                <PassportVerificationBadge
                  status={passport?.verificationStatus ?? 'PENDING_VERIFICATION'}
                  size="lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <ImageIcon size={18} />
                  Batch Images
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGallery images={batch.images ?? []} />
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Award size={18} />
                  Certifications
                </span>
              </CardTitle>
              <CardDescription>Quality and compliance certificates for this batch.</CardDescription>
            </CardHeader>
            <CardContent>
              {batch.certifications.length === 0 ? (
                <EmptyState
                  icon={<Award size={24} />}
                  title="No certifications"
                  description="Add certifications to strengthen consumer trust."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {batch.certifications.map((cert, i) => (
                    <CertificationCard key={cert.id} certification={cert} index={i} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Clock size={18} />
                  Ownership Timeline
                </span>
              </CardTitle>
              <CardDescription>
                Custody chain from farm to consumer. Future phases will unlock transfers and blockchain anchoring.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimelinePlaceholder entries={timeline} />
            </CardContent>
          </Card>

          {/* Blockchain placeholder */}
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50">
                <ShieldCheck size={24} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Blockchain Anchoring</p>
                <p className="text-xs text-muted-foreground">
                  This passport will be cryptographically anchored on the Stellar ledger in a future phase.
                  The batch ID and QR signature are already immutable.
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">Phase 5</Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scan history modal */}
      <Modal open={scanHistoryOpen} onClose={() => setScanHistoryOpen(false)} className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Scan History</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ScanHistoryContent batchInternalId={batch.batchId} />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setScanHistoryOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Regenerate confirmation */}
      <Modal open={regenOpen} onClose={() => setRegenOpen(false)}>
        <ModalHeader>
          <ModalTitle>Regenerate QR Code</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex items-start gap-3 rounded-lg bg-warning/10 p-4">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warning" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">This will invalidate the current QR code.</p>
              <p className="mt-1">
                The old QR will be marked as compromised and will no longer verify.
                A new QR with an incremented version will be generated. Use this only
                if the current QR has been compromised or leaked.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setRegenOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => regenMutation.mutate()}
            loading={regenMutation.isPending}
          >
            <RefreshCw size={16} />
            Regenerate
          </Button>
        </ModalFooter>
      </Modal>

      {/* Hidden ref for SVG export */}
      <div ref={qrSvgRef} className="hidden" />
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm">{children}</div>
      </div>
    </div>
  );
}

function ScanHistoryContent({ batchInternalId }: { batchInternalId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.batchScans(batchInternalId),
    queryFn: () => qrService.getScanHistory(batchInternalId),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading scan history...</p>;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<History size={24} />}
        title="No scans yet"
        description="When someone scans this QR code, the scan will appear here."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Browser</TableHead>
          <TableHead>IP Hash</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((scan) => (
          <TableRow key={scan.id}>
            <TableCell className="text-sm">{formatRelativeTime(scan.scanTime)}</TableCell>
            <TableCell className="text-sm">{scan.deviceType ?? '—'}</TableCell>
            <TableCell className="text-sm">{scan.browser ?? '—'}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{scan.ipHash?.substring(0, 12) ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function generateLabelHtml(batchId: string, productName: string, harvestDate: string, verifyUrl: string): string {
  return `<!DOCTYPE html>
<html><head><title>FarmerPay QR Label - ${batchId}</title>
<style>
  @page { size: 4in 4in; margin: 0; }
  body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .label { width: 3.5in; height: 3.5in; border: 2px solid #0f172a; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; align-items: center; }
  .logo { font-size: 14px; font-weight: 700; color: #0f766e; letter-spacing: -0.02em; }
  .qr { margin: 8px 0; }
  .batch-id { font-family: monospace; font-size: 11px; font-weight: 600; color: #0f172a; }
  .product { font-size: 12px; color: #475569; margin-top: 4px; }
  .date { font-size: 10px; color: #94a3b8; }
  .badge { margin-top: 8px; padding: 2px 8px; background: #dcfce7; color: #166534; border-radius: 999px; font-size: 9px; font-weight: 600; }
</style></head>
<body>
  <div class="label">
    <div class="logo">FarmerPay</div>
    <div class="qr"><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}" width="200" height="200" /></div>
    <div class="batch-id">${batchId}</div>
    <div class="product">${productName}</div>
    <div class="date">Harvested: ${harvestDate}</div>
    <div class="badge">Verified</div>
  </div>
</body></html>`;
}
