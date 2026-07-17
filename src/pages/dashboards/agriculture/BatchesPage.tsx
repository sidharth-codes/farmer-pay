import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, ChevronRight } from 'lucide-react';
import {
  PageHeader,
  FilterBar,
  DataTable,
  Pagination,
  EmptyState,
  Button,
  BatchStatusBadge,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  FormError,
  type Column,
} from '../../../components/ui';
import { batchService, farmService, productService, harvestService } from '../../../services';
import { QUERY_KEYS, BATCH_UNITS, BATCH_STATUS_LABELS } from '../../../constants';
import type { Batch, BatchStatus } from '../../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDate } from '../../../utils';

const schema = z.object({
  harvestId: z.string().uuid('Select a harvest'),
  productId: z.string().uuid('Select a product'),
  farmId: z.string().uuid('Select a farm'),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.enum(BATCH_UNITS).default('kg'),
});

type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = Object.entries(BATCH_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export function BatchesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [farmFilter, setFarmFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.batches, { search, statusFilter, farmFilter, page }],
    queryFn: () =>
      batchService.list({
        search,
        status: statusFilter !== 'all' ? (statusFilter as BatchStatus) : undefined,
        farmId: farmFilter !== 'all' ? farmFilter : undefined,
        page,
        pageSize,
      }),
  });

  const { data: farmsData } = useQuery({
    queryKey: QUERY_KEYS.farms,
    queryFn: () => farmService.list({ pageSize: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: () => productService.list({ pageSize: 100 }),
  });

  const { data: harvestsData } = useQuery({
    queryKey: ['harvests', { pageSize: 100 }],
    queryFn: () => harvestService.list({ pageSize: 100 }),
  });

  const farms = farmsData?.items ?? [];
  const products = productsData?.items ?? [];
  const harvests = harvestsData?.items ?? [];

  const batches = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const columns: Column<Batch>[] = [
    {
      key: 'batchId',
      header: 'Batch ID',
      render: (b) => (
        <span className="font-mono text-sm font-medium text-primary">{b.batchId}</span>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      render: (b) => b.product?.name || '—',
    },
    {
      key: 'farm',
      header: 'Farm',
      render: (b) => b.farm?.name || '—',
    },
    {
      key: 'quantity',
      header: 'Quantity',
      align: 'right',
      render: (b) => <span>{b.quantity} {b.unit}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => <BatchStatusBadge status={b.status} />,
    },
    {
      key: 'created',
      header: 'Created',
      render: (b) => <span className="text-muted-foreground">{formatDate(b.createdAt)}</span>,
    },
    {
      key: 'chevron',
      header: '',
      align: 'right',
      render: () => <ChevronRight size={16} className="text-muted-foreground" />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Batches"
        description="The core traceability unit — every batch carries an immutable ID."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Batches' }]}
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={harvests.length === 0 || products.length === 0}>
            <Plus size={16} />
            Create Batch
          </Button>
        }
      />

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by batch ID…"
        filters={[
          { key: 'status', label: 'Status', options: STATUS_OPTIONS },
          { key: 'farm', label: 'Farm', options: farms.map((f) => ({ label: f.name, value: f.id })) },
        ]}
        activeFilters={{ status: statusFilter, farm: farmFilter }}
        onFilter={(k, v) => {
          if (k === 'status') { setStatusFilter(v); setPage(1); }
          if (k === 'farm') { setFarmFilter(v); setPage(1); }
        }}
        onClear={() => { setStatusFilter('all'); setFarmFilter('all'); setPage(1); }}
        className="mb-4"
      />

      <DataTable
        columns={columns}
        data={batches}
        rowKey={(b) => b.id}
        onRowClick={(b) => navigate(b.id)}
        loading={isLoading}
        empty={
          <EmptyState
            icon={<Package size={28} />}
            title="No batches yet"
            description={harvests.length === 0 ? 'Record a harvest first, then create a batch.' : 'Create your first batch to start tracing.'}
            action={harvests.length > 0 && products.length > 0 ? <Button onClick={() => setCreateOpen(true)}><Plus size={16} />Create Batch</Button> : undefined}
          />
        }
      />

      {totalPages > 1 ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
      ) : null}

      {total > 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">{total} batch{total !== 1 ? 'es' : ''} total</p>
      ) : null}

      <CreateBatchModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        farms={farms}
        products={products}
        harvests={harvests}
      />
    </div>
  );
}

function CreateBatchModal({
  open,
  onClose,
  farms,
  products,
  harvests,
}: {
  open: boolean;
  onClose: () => void;
  farms: { id: string; name: string }[];
  products: { id: string; name: string }[];
  harvests: { id: string; harvestDate: string; farm: { name: string } | null }[];
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { unit: 'kg' } });

  const selectedFarm = watch('farmId');

  // Filter harvests to the selected farm
  const availableHarvests = selectedFarm
    ? harvests.filter((h) => h.farm?.name === farms.find((f) => f.id === selectedFarm)?.name)
    : harvests;

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      batchService.create({
        harvest_id: v.harvestId,
        product_id: v.productId,
        farm_id: v.farmId,
        quantity: parseFloat(v.quantity),
        unit: v.unit,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.batches });
      reset();
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader><ModalTitle>Create batch</ModalTitle></ModalHeader>
      <ModalBody>
        <form id="create-batch" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="b-farm">Farm</Label>
            <select
              id="b-farm"
              {...register('farmId')}
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select farm…</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <FormError>{errors.farmId?.message}</FormError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-harvest">Harvest</Label>
            <select
              id="b-harvest"
              {...register('harvestId')}
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select harvest…</option>
              {availableHarvests.map((h) => (
                <option key={h.id} value={h.id}>
                  {formatDate(h.harvestDate)} {h.farm?.name ? `· ${h.farm.name}` : ''}
                </option>
              ))}
            </select>
            <FormError>{errors.harvestId?.message}</FormError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-product">Product</Label>
            <select
              id="b-product"
              {...register('productId')}
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <FormError>{errors.productId?.message}</FormError>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="b-qty">Quantity</Label>
              <Input id="b-qty" type="number" step="any" placeholder="100" invalid={!!errors.quantity} {...register('quantity')} />
              <FormError>{errors.quantity?.message}</FormError>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-unit">Unit</Label>
              <select
                id="b-unit"
                {...register('unit')}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {BATCH_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            A unique batch ID (e.g. FP-KL-2026-000001) will be generated automatically and cannot be changed.
          </p>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" form="create-batch" loading={isSubmitting}>Create batch</Button>
      </ModalFooter>
    </Modal>
  );
}
