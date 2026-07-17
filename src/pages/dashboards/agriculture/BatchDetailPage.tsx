import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Scale,
  Image as ImageIcon,
  Award,
  Plus,
  Hash,
  Sprout,
  Leaf,
  QrCode,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  BatchStatusBadge,
  EmptyState,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  FormError,
} from '../../../components/ui';
import { batchService } from '../../../services';
import { QUERY_KEYS, BATCH_STATUS_LABELS } from '../../../constants';
import type { BatchStatus } from '../../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDate } from '../../../utils';
import { useState } from 'react';

const imageSchema = z.object({
  url: z.string().url('Valid URL required'),
  caption: z.string().optional(),
});

const certSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  issuedBy: z.string().min(2, 'Issuer is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  documentUrl: z.string().url('Valid URL required').optional().or(z.literal('')),
});

type ImageValues = z.infer<typeof imageSchema>;
type CertValues = z.infer<typeof certSchema>;

export function BatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageOpen, setImageOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  const { data: batch, isLoading } = useQuery({
    queryKey: QUERY_KEYS.batch(batchId ?? ''),
    queryFn: () => batchService.get(batchId!),
    enabled: !!batchId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BatchStatus }) =>
      batchService.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batch(batchId ?? '') }),
  });

  const imageForm = useForm<ImageValues>({ resolver: zodResolver(imageSchema) });
  const certForm = useForm<CertValues>({ resolver: zodResolver(certSchema) });

  const imageMutation = useMutation({
    mutationFn: (v: ImageValues) => batchService.addImage(batchId!, v.url, v.caption),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batch(batchId ?? '') });
      imageForm.reset();
      setImageOpen(false);
    },
  });

  const certMutation = useMutation({
    mutationFn: (v: CertValues) =>
      batchService.addCertification({
        batch_id: batchId!,
        name: v.name,
        issued_by: v.issuedBy,
        issue_date: v.issueDate,
        expiry_date: v.expiryDate || undefined,
        document_url: v.documentUrl || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batch(batchId ?? '') });
      certForm.reset();
      setCertOpen(false);
    },
  });

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground">Loading batch…</div>;
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

  return (
    <div>
      <PageHeader
        title={batch.batchId}
        description={`Batch of ${batch.product?.name ?? 'Unknown product'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Batches', href: '/dashboard/farmer/batches' },
          { label: batch.batchId },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`${batch.id}/passport`)}>
              <QrCode size={16} />
              Digital Passport
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              Back
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Batch information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={<Hash size={16} />} label="Batch ID">
                <span className="font-mono text-sm font-medium text-primary">{batch.batchId}</span>
              </InfoRow>
              <InfoRow icon={<Leaf size={16} />} label="Product">
                {batch.product?.name ?? '—'}
                {batch.product?.category ? (
                  <Badge variant="secondary" className="ml-2">{batch.product.category.name}</Badge>
                ) : null}
              </InfoRow>
              <InfoRow icon={<Sprout size={16} />} label="Farm">
                {batch.farm?.name ?? '—'}
              </InfoRow>
              <InfoRow icon={<Calendar size={16} />} label="Harvest date">
                {batch.harvest ? formatDate(batch.harvest.harvestDate) : '—'}
              </InfoRow>
              <InfoRow icon={<Scale size={16} />} label="Quantity">
                {batch.quantity} {batch.unit}
              </InfoRow>
              <InfoRow icon={<MapPin size={16} />} label="Farm location">
                {batch.farm?.location
                  ? [batch.farm.location.address, batch.farm.location.district, batch.farm.location.state, batch.farm.location.country].filter(Boolean).join(', ')
                  : [batch.farm?.address, batch.farm?.district, batch.farm?.state, batch.farm?.country].filter(Boolean).join(', ') || '—'}
              </InfoRow>
            </CardContent>
          </Card>

          {/* Status management */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                <BatchStatusBadge status={batch.status} />
                <span className="text-sm text-muted-foreground">→</span>
                <select
                  value={batch.status}
                  onChange={(e) => statusMutation.mutate({ id: batch.id, status: e.target.value as BatchStatus })}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {Object.entries(BATCH_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Images</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setImageOpen(true)}>
                  <Plus size={14} />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {batch.images.length === 0 ? (
                <EmptyState icon={<ImageIcon size={24} />} title="No images" description="Add images to document this batch." />
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {batch.images.map((img) => (
                    <div key={img.id} className="overflow-hidden rounded-xl border border-border">
                      <img src={img.url} alt={img.caption || 'Batch image'} className="aspect-square w-full object-cover" />
                      {img.caption ? (
                        <p className="p-2 text-xs text-muted-foreground">{img.caption}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Certifications</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setCertOpen(true)}>
                  <Plus size={14} />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {batch.certifications.length === 0 ? (
                <EmptyState icon={<Award size={24} />} title="No certifications" description="Add certifications like Organic, FSSAI, Export Grade." />
              ) : (
                <ul className="divide-y divide-border">
                  {batch.certifications.map((cert) => (
                    <li key={cert.id} className="flex items-start justify-between py-3">
                      <div>
                        <p className="text-sm font-medium">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Issued by {cert.issuedBy} · {formatDate(cert.issueDate)}
                          {cert.expiryDate ? ` · Expires ${formatDate(cert.expiryDate)}` : ''}
                        </p>
                      </div>
                      <Badge variant="success">Verified</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar summary */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Package size={20} />
              </div>
              <p className="mt-4 font-display text-2xl font-bold">{batch.quantity} {batch.unit}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Total quantity</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ImageIcon size={20} />
              </div>
              <p className="mt-4 font-display text-2xl font-bold">{batch.images.length}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Images</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award size={20} />
              </div>
              <p className="mt-4 font-display text-2xl font-bold">{batch.certifications.length}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Certifications</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add image modal */}
      <Modal open={imageOpen} onClose={() => setImageOpen(false)}>
        <ModalHeader><ModalTitle>Add image</ModalTitle></ModalHeader>
        <ModalBody>
          <form id="add-image" onSubmit={imageForm.handleSubmit((v) => imageMutation.mutate(v))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="img-url">Image URL</Label>
              <Input id="img-url" placeholder="https://…" invalid={!!imageForm.formState.errors.url} {...imageForm.register('url')} />
              <FormError>{imageForm.formState.errors.url?.message}</FormError>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="img-caption">Caption (optional)</Label>
              <Input id="img-caption" placeholder="Harvest photo" {...imageForm.register('caption')} />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setImageOpen(false)}>Cancel</Button>
          <Button type="submit" form="add-image" loading={imageForm.formState.isSubmitting}>Add image</Button>
        </ModalFooter>
      </Modal>

      {/* Add certification modal */}
      <Modal open={certOpen} onClose={() => setCertOpen(false)}>
        <ModalHeader><ModalTitle>Add certification</ModalTitle></ModalHeader>
        <ModalBody>
          <form id="add-cert" onSubmit={certForm.handleSubmit((v) => certMutation.mutate(v))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Certification name</Label>
              <Input id="c-name" placeholder="Organic" invalid={!!certForm.formState.errors.name} {...certForm.register('name')} />
              <FormError>{certForm.formState.errors.name?.message}</FormError>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-issued">Issued by</Label>
              <Input id="c-issued" placeholder="FSSAI" invalid={!!certForm.formState.errors.issuedBy} {...certForm.register('issuedBy')} />
              <FormError>{certForm.formState.errors.issuedBy?.message}</FormError>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-issue">Issue date</Label>
                <Input id="c-issue" type="date" invalid={!!certForm.formState.errors.issueDate} {...certForm.register('issueDate')} />
                <FormError>{certForm.formState.errors.issueDate?.message}</FormError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-expiry">Expiry date (optional)</Label>
                <Input id="c-expiry" type="date" {...certForm.register('expiryDate')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-doc">Document URL (optional)</Label>
              <Input id="c-doc" placeholder="https://…" {...certForm.register('documentUrl')} />
              <FormError>{certForm.formState.errors.documentUrl?.message}</FormError>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCertOpen(false)}>Cancel</Button>
          <Button type="submit" form="add-cert" loading={certForm.formState.isSubmitting}>Add certification</Button>
        </ModalFooter>
      </Modal>
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
