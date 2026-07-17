import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Sprout, Search as SearchIcon } from 'lucide-react';
import {
  PageHeader,
  FilterBar,
  DataTable,
  Pagination,
  EmptyState,
  Button,
  Badge,
  VerificationStatusBadge,
  type Column,
} from '../../../components/ui';
import { farmService } from '../../../services';
import { QUERY_KEYS } from '../../../constants';
import type { Farm } from '../../../types';
import { formatDate } from '../../../utils';

export function FarmListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.farms, { search, page }],
    queryFn: () => farmService.list({ search, page, pageSize }),
  });

  const farms = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const columns: Column<Farm>[] = [
    {
      key: 'name',
      header: 'Farm',
      render: (farm) => (
        <Link to={`farms/${farm.id}`} className="font-medium text-primary hover:underline">
          {farm.name}
        </Link>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (farm) => (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin size={14} className="shrink-0" />
          {[farm.district, farm.state, farm.country].filter(Boolean).join(', ') || '—'}
        </span>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      render: (farm) =>
        farm.farmSize ? (
          <span>{farm.farmSize} {farm.farmSizeUnit}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'organic',
      header: 'Organic',
      render: (farm) =>
        farm.isOrganic ? <Badge variant="success">Organic</Badge> : <Badge variant="secondary">Conventional</Badge>,
    },
    {
      key: 'verification',
      header: 'Verification',
      render: (farm) => <VerificationStatusBadge status={farm.verificationStatus} />,
    },
    {
      key: 'created',
      header: 'Created',
      render: (farm) => <span className="text-muted-foreground">{formatDate(farm.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Farms"
        description="Manage your registered farms and their details."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Farms' }]}
        actions={
          <Button asChild>
            <Link to="farms/create">
              <Plus size={16} />
              Add Farm
            </Link>
          </Button>
        }
      />

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by farm name, district, or state…"
        className="mb-4"
      />

      <DataTable
        columns={columns}
        data={farms}
        rowKey={(farm) => farm.id}
        loading={isLoading}
        empty={
          <EmptyState
            icon={<Sprout size={28} />}
            title="No farms yet"
            description="Register your first farm to start creating harvests and batches."
            action={
              <Button asChild>
                <Link to="farms/create">
                  <Plus size={16} />
                  Add Farm
                </Link>
              </Button>
            }
          />
        }
      />

      {totalPages > 1 ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
      ) : null}

      {total > 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {total} farm{total !== 1 ? 's' : ''} total
        </p>
      ) : null}

      <span className="hidden">{SearchIcon.name}</span>
    </div>
  );
}
