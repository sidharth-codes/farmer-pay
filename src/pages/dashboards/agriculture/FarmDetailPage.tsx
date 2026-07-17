import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Ruler,
  Leaf,
  FileText,
  Package,
  Sprout,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  VerificationStatusBadge,
  EmptyState,
} from '../../../components/ui';
import { farmService, harvestService, batchService } from '../../../services';
import { QUERY_KEYS } from '../../../constants';
import { formatDate } from '../../../utils';

export function FarmDetailPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();

  const { data: farm, isLoading } = useQuery({
    queryKey: QUERY_KEYS.farm(farmId ?? ''),
    queryFn: () => farmService.get(farmId!),
    enabled: !!farmId,
  });

  const { data: harvestsData } = useQuery({
    queryKey: ['harvests', { farmId }],
    queryFn: () => harvestService.list({ farmId, pageSize: 50 }),
    enabled: !!farmId,
  });

  const { data: batchesData } = useQuery({
    queryKey: ['batches', { farmId }],
    queryFn: () => batchService.list({ farmId, pageSize: 50 }),
    enabled: !!farmId,
  });

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground">Loading farm…</div>;
  }

  if (!farm) {
    return (
      <EmptyState
        icon={<Sprout size={28} />}
        title="Farm not found"
        description="This farm may have been removed."
        action={<Button variant="outline" onClick={() => navigate('/dashboard/farmer/farms')}>Back to farms</Button>}
      />
    );
  }

  const harvests = harvestsData?.items ?? [];
  const batches = batchesData?.items ?? [];

  return (
    <div>
      <PageHeader
        title={farm.name}
        description={farm.description || 'No description provided.'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Farms', href: '/dashboard/farmer/farms' },
          { label: farm.name },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/dashboard/farmer/farms')}>
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Farm details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow icon={<MapPin size={16} />} label="Location">
              {[farm.address, farm.district, farm.state, farm.country].filter(Boolean).join(', ') || '—'}
            </DetailRow>
            <DetailRow icon={<Ruler size={16} />} label="Farm size">
              {farm.farmSize ? `${farm.farmSize} ${farm.farmSizeUnit}` : '—'}
            </DetailRow>
            <DetailRow icon={<Leaf size={16} />} label="Organic status">
              {farm.isOrganic ? <Badge variant="success">Organic</Badge> : <Badge variant="secondary">Conventional</Badge>}
            </DetailRow>
            <DetailRow icon={<FileText size={16} />} label="Verification">
              <VerificationStatusBadge status={farm.verificationStatus} />
            </DetailRow>
            {farm.latitude && farm.longitude ? (
              <DetailRow icon={<MapPin size={16} />} label="Coordinates">
                {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
              </DetailRow>
            ) : null}
            <DetailRow icon={<Calendar size={16} />} label="Registered">
              {formatDate(farm.createdAt)}
            </DetailRow>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calendar size={20} />
                </div>
                <span className="font-display text-2xl font-bold">{harvests.length}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Harvests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package size={20} />
                </div>
                <span className="font-display text-2xl font-bold">{batches.length}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Batches</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent harvests</CardTitle>
          </CardHeader>
          <CardContent>
            {harvests.length === 0 ? (
              <EmptyState icon={<Sprout size={24} />} title="No harvests yet" description="Create a harvest to start producing batches." />
            ) : (
              <ul className="divide-y divide-border">
                {harvests.map((h) => (
                  <li key={h.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{formatDate(h.harvestDate)}</p>
                      <p className="text-xs text-muted-foreground">{h.season || '—'} · {h.weatherNotes || 'No weather notes'}</p>
                    </div>
                    <Badge variant="secondary">{h.batches?.length ?? 0} batches</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
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
