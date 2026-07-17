import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Leaf, Search as SearchIcon, Trash2 } from 'lucide-react';
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
import { productService, categoryService } from '../../../services';
import { QUERY_KEYS } from '../../../constants';
import type { Product } from '../../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDate } from '../../../utils';

const createSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  scientificName: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  shelfLife: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type CreateValues = z.infer<typeof createSchema>;

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.products, { search, categoryId, page }],
    queryFn: () =>
      productService.list({
        search,
        categoryId: categoryId !== 'all' ? categoryId : undefined,
        page,
        pageSize,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: categoryService.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products }),
  });

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-2">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Leaf size={16} />
            </div>
          )}
          <span className="font-medium">{p.name}</span>
        </div>
      ),
    },
    {
      key: 'scientificName',
      header: 'Scientific name',
      render: (p) => <span className="text-muted-foreground italic">{p.scientificName || '—'}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) =>
        p.category ? <Badge variant="secondary">{p.category.name}</Badge> : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'shelfLife',
      header: 'Shelf life',
      render: (p) => <span className="text-muted-foreground">{p.shelfLife || '—'}</span>,
    },
    {
      key: 'created',
      header: 'Created',
      render: (p) => <span className="text-muted-foreground">{formatDate(p.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete product "${p.name}"?`)) deleteMutation.mutate(p.id);
          }}
          aria-label="Delete product"
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage product types available for batch creation."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Products' }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            Add Product
          </Button>
        }
      />

      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by product name…"
        filters={[
          {
            key: 'category',
            label: 'Category',
            options: (categories ?? []).map((c) => ({ label: c.name, value: c.id })),
          },
        ]}
        activeFilters={{ category: categoryId }}
        onFilter={(_, v) => { setCategoryId(v); setPage(1); }}
        onClear={() => { setCategoryId('all'); setPage(1); }}
        className="mb-4"
      />

      <DataTable
        columns={columns}
        data={products}
        rowKey={(p) => p.id}
        loading={isLoading}
        empty={
          <EmptyState
            icon={<Leaf size={28} />}
            title="No products yet"
            description="Add your first product to start creating batches."
            action={<Button onClick={() => setCreateOpen(true)}><Plus size={16} />Add Product</Button>}
          />
        }
      />

      {totalPages > 1 ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
      ) : null}

      {total > 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {total} product{total !== 1 ? 's' : ''} total
        </p>
      ) : null}

      <CreateProductModal open={createOpen} onClose={() => setCreateOpen(false)} categories={categories ?? []} />

      <span className="hidden">{SearchIcon.name}</span>
    </div>
  );
}

function CreateProductModal({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
  });

  const mutation = useMutation({
    mutationFn: (v: CreateValues) =>
      productService.create({
        name: v.name,
        scientific_name: v.scientificName,
        description: v.description,
        category_id: v.categoryId || undefined,
        shelf_life: v.shelfLife,
        image_url: v.imageUrl || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      reset();
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Add product</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <form id="create-product" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" placeholder="Tomato" invalid={!!errors.name} {...register('name')} />
            <FormError>{errors.name?.message}</FormError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-sci">Scientific name (optional)</Label>
            <Input id="p-sci" placeholder="Solanum lycopersicum" {...register('scientificName')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-cat">Category</Label>
            <select
              id="p-cat"
              {...register('categoryId')}
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-shelf">Shelf life (optional)</Label>
              <Input id="p-shelf" placeholder="7 days" {...register('shelfLife')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-img">Image URL (optional)</Label>
              <Input id="p-img" placeholder="https://…" {...register('imageUrl')} />
              <FormError>{errors.imageUrl?.message}</FormError>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description (optional)</Label>
            <textarea
              id="p-desc"
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('description')}
            />
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" form="create-product" loading={isSubmitting}>Create product</Button>
      </ModalFooter>
    </Modal>
  );
}
