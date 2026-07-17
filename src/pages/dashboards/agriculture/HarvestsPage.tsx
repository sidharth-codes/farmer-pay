import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CalendarDays, Cloud, Trash2 } from 'lucide-react';
import {
  PageHeader,
  FilterBar,
  DataTable,
  Pagination,
  EmptyState,
  Button,
  Badge,
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
import { harvestService, farmService } from '../../../services';
import { QUERY_KEYS, SEASONS } from '../../../constants';
import type { Harvest } from '../../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDate } from '../../../utils';

const schema = z.object({
  farmId: z.string().uuid('Select a farm'),
  harvestDate: z.string().min(1, 'Harvest date is required'),
  weatherNotes: z.string().optional(),
  season: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function HarvestsPage() {
  const [search, setSearch] = useState('');
  const [farmFilter, setFarmFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['harvests', { search, farmFilter, page }],
    queryFn: () =>
      harvestService.list({
        search,
        farmId: farmFilter !== 'all' ? farmFilter : undefined,
        page,
        pageSize,
      }),
  });

  const { data: farmsData } = useQuery({
    queryKey: QUERY_KEYS.farms,
    queryFn: () => farmService.list({ pageSize: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => harvestService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['harvests'] }),
  });

  const harvests = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const farms = farmsData?.items ?? [];

  const columns: Column<Harvest>[] = [
    {
      key: 'date',
      header: 'Harvest date',
      render: (h) => (
        <span className="flex items-center gap-1.5 font-medium">
          <CalendarDays size={14} className="text-muted-foreground" />
          {formatDate(h.harvestDate)}
        </span>
      ),
    },
    {
      key: 'farm',
      header: 'Farm',
      render: (h) => h.farm?.name || '—',
    },
    {
      key: 'season',
      header: 'Season',
      render: (h) => (h.season ? <Badge variant="secondary">{h.season}</Badge> : <span className="text-muted-foreground">—</span>),
    },
    {
      key: 'weather',
      header: 'Weather',
      render: (h) => (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Cloud size={14} />
          {h.weatherNotes || '—'}
        </span>
      ),
    },
    {
      key: 'batches',
      header: 'Batches',
      align: 'right',
      render: (h) => <Badge variant="default">{h.batches?.length ?? 0}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (h) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this harvest and all its batches?')) deleteMutation.mutate(h.id);
          }}
          aria-label="Delete harvest"
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Harvests"
        description="Track harvesting events and link them to batches."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Harvests' }]}
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={farms.length === 0}>
            <Plus size={16} />
            Record Harvest
          </Button>
        }
      />

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by season or notes…"
        filters={[
          {
            key: 'farm',
            label: 'Farm',
            options: farms.map((f) => ({ label: f.name, value: f.id })),
          },
        ]}
        activeFilters={{ farm: farmFilter }}
        onFilter={(_, v) => { setFarmFilter(v); setPage(1); }}
        onClear={() => { setFarmFilter('all'); setPage(1); }}
        className="mb-4"
      />

      <DataTable
        columns={columns}
        data={harvests}
        rowKey={(h) => h.id}
        loading={isLoading}
        empty={
          <EmptyState
            icon={<CalendarDays size={28} />}
            title="No harvests yet"
            description={farms.length === 0 ? 'Create a farm first, then record a harvest.' : 'Record your first harvest to start creating batches.'}
            action={farms.length > 0 ? <Button onClick={() => setCreateOpen(true)}><Plus size={16} />Record Harvest</Button> : undefined}
          />
        }
      />

      {totalPages > 1 ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
      ) : null}

      {total > 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">{total} harvest{total !== 1 ? 's' : ''} total</p>
      ) : null}

      <CreateHarvestModal open={createOpen} onClose={() => setCreateOpen(false)} farms={farms} />
    </div>
  );
}

function CreateHarvestModal({
  open,
  onClose,
  farms,
}: {
  open: boolean;
  onClose: () => void;
  farms: { id: string; name: string }[];
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      harvestService.create({
        farm_id: v.farmId,
        harvest_date: v.harvestDate,
        weather_notes: v.weatherNotes,
        season: v.season,
        notes: v.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
      reset();
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader><ModalTitle>Record harvest</ModalTitle></ModalHeader>
      <ModalBody>
        <form id="create-harvest" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="h-farm">Farm</Label>
            <select
              id="h-farm"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="h-date">Harvest date</Label>
              <Input id="h-date" type="date" invalid={!!errors.harvestDate} {...register('harvestDate')} />
              <FormError>{errors.harvestDate?.message}</FormError>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="h-season">Season</Label>
              <select
                id="h-season"
                {...register('season')}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select season…</option>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="h-weather">Weather notes (optional)</Label>
            <Input id="h-weather" placeholder="Sunny, 28°C" {...register('weatherNotes')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="h-notes">Notes (optional)</Label>
            <textarea
              id="h-notes"
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('notes')}
            />
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" form="create-harvest" loading={isSubmitting}>Record harvest</Button>
      </ModalFooter>
    </Modal>
  );
}
