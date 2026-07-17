import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { QRCodeSVG as QRCodeReact } from 'qrcode.react';
import {
  ShieldCheck, ShieldAlert, Ban, Clock, AlertTriangle, XCircle,
  Sprout, MapPin, Calendar, Scale, Award, Package, QrCode,
  ArrowRight, ScanLine, Hash, Lock, Globe,
} from 'lucide-react';
import { Card, CardContent, Badge, Button } from '../components/ui';
import {
  PassportVerificationBadge,
  CertificationCard,
  ImageGallery,
  TimelinePlaceholder, buildPassportTimeline,
} from '../components/ui';
import { batchService, passportService, qrService } from '../services';
import { ROUTES } from '../constants';
import { formatDate, formatRelativeTime } from '../utils';
import type { PassportVerificationStatus } from '../types';

export function VerifyPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const [notFound, setNotFound] = useState(false);

  // Log the scan on mount
  useEffect(() => {
    if (batchId) {
      qrService.logScan(batchId).catch(() => {});
    }
  }, [batchId]);

  // Try to find the batch by batch_id code
  const { data: batch, isLoading } = useQuery({
    queryKey: ['verify', batchId],
    queryFn: async () => {
      // Try to find by batch_id code
      const { data } = await import('../api/supabase').then((m) => m.supabase
        .from('batches')
        .select('*, farm:farms(*, location:locations(*)), product:products(*, category:product_categories(*)), harvest:harvests(*), images:batch_images(*), certifications:certifications(*)')
        .eq('batch_id', batchId!)
        .maybeSingle());
      if (!data) {
        setNotFound(true);
        return null;
      }
      // Also try to get/create passport
      const passport = await passportService.getPassport(data.id);
      if (!passport) {
        return { batch: data as never, passport: null };
      }
      return { batch: data as never, passport };
    },
    enabled: !!batchId,
  });

  if (isLoading) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 -z-10 bg-hero-radial" aria-hidden="true" />
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
            <ScanLine size={32} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Verifying batch...</p>
        </div>
      </div>
    );
  }

  if (notFound || !batch) {
    return <VerifyNotFound batchId={batchId ?? ''} />;
  }

  const { batch: batchData, passport } = batch;
  const verificationStatus = passport?.verificationStatus ?? 'PENDING_VERIFICATION';
  const qrCode = null; // QR is loaded separately if needed
  const verifyUrl = `https://farmerpay.app/verify/${batchData.batchId}`;
  const timeline = buildPassportTimeline(batchData.batchId, passport?.passportData.currentHolder ?? null);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-hero-radial" aria-hidden="true" />

      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ScanLine size={32} />
            </div>
            <div className="mt-4">
              <PassportVerificationBadge status={verificationStatus} size="lg" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {verificationStatus === 'VERIFIED' ? 'Batch Verified' : 'Batch Verification'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Provenance for batch{' '}
              <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm text-primary">
                {batchData.batchId}
              </code>
            </p>
          </motion.div>

          {/* Hero card — Apple Wallet style */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              {/* Top section with gradient */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                      <Package size={24} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-semibold">{batchData.product?.name ?? 'Unknown Product'}</h2>
                      <p className="text-xs text-muted-foreground">{batchData.quantity} {batchData.unit}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="rounded-lg border-2 border-border bg-white p-2">
                      <QRCodeReact value={verifyUrl} size={100} level="H" />
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">{batchData.batchId}</p>
                  </div>
                </div>
              </div>

              {/* Verification banner */}
              <div className="border-t border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className={verificationStatus === 'VERIFIED' ? 'text-success' : 'text-muted-foreground'} />
                  <span className="text-sm font-medium">
                    {verificationStatus === 'VERIFIED'
                      ? 'This batch is cryptographically verified by FarmerPay'
                      : verificationStatus === 'PENDING_VERIFICATION'
                      ? 'This batch is pending verification'
                      : verificationStatus === 'SUSPENDED'
                      ? 'This batch has been suspended'
                      : verificationStatus === 'REJECTED'
                      ? 'This batch verification was rejected'
                      : 'This batch has expired'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Product image */}
          {batchData.product?.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Card>
                <CardContent className="p-0 overflow-hidden rounded-2xl">
                  <img
                    src={batchData.product.imageUrl}
                    alt={batchData.product.name}
                    className="w-full max-h-64 object-cover"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Batch details grid */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-display text-base font-semibold flex items-center gap-2">
                  <Hash size={18} className="text-primary" />
                  Batch Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem icon={<Sprout size={16} />} label="Farm" value={batchData.farm?.name ?? '—'} />
                  <DetailItem icon={<MapPin size={16} />} label="Location" value={batchData.farm ? [batchData.farm.district, batchData.farm.state, batchData.farm.country].filter(Boolean).join(', ') : '—'} />
                  <DetailItem icon={<Calendar size={16} />} label="Harvest Date" value={batchData.harvest ? formatDate(batchData.harvest.harvestDate) : '—'} />
                  <DetailItem icon={<Scale size={16} />} label="Quantity" value={`${batchData.quantity} ${batchData.unit}`} />
                  <DetailItem icon={<Package size={16} />} label="Status" value={batchData.status} />
                  <DetailItem icon={<Clock size={16} />} label="Last Updated" value={passport ? formatRelativeTime(passport.lastUpdated) : '—'} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Images */}
          {batchData.images && batchData.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-display text-base font-semibold">Batch Images</h3>
                  <ImageGallery images={batchData.images} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Certifications */}
          {batchData.certifications && batchData.certifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-display text-base font-semibold flex items-center gap-2">
                    <Award size={18} className="text-success" />
                    Certifications
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {batchData.certifications.map((cert: never, i: number) => (
                      <CertificationCard key={i} certification={cert as never} index={i} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-display text-base font-semibold flex items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  Ownership Timeline
                </h3>
                <TimelinePlaceholder entries={timeline} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Map placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50">
                  <Globe size={24} className="text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">Farm Location Map</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Interactive farm location map will be available in a future phase.
                  {batchData.farm?.location?.latitude && batchData.farm?.location?.longitude && (
                    <> Coordinates: {batchData.farm.location.latitude.toFixed(2)}, {batchData.farm.location.longitude.toFixed(2)}</>
                  )}
                </p>
                <Badge variant="outline" className="mt-3">Phase 5</Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
              <Lock size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Tamper-Proof Verification</p>
                <p className="mt-1">
                  This QR code contains a cryptographic signature (HMAC-SHA256) and checksum.
                  Any modification to the QR payload will cause verification to fail.
                  The batch ID is immutable and never reused.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Back link */}
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link to={ROUTES.HOME}>
                Back to home
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function VerifyNotFound({ batchId }: { batchId: string }) {
  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 -z-10 bg-hero-radial" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-md text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <XCircle size={32} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Batch not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No batch exists with ID{' '}
          <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm">{batchId}</code>.
          This QR code may be invalid or the batch may have been removed.
        </p>
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link to={ROUTES.HOME}>
              Back to home
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
