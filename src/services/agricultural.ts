import { supabase } from '../api';
import type {
  Farm,
  Product,
  ProductCategory,
  Harvest,
  Batch,
  BatchImage,
  Certification,
  BatchListParams,
  ListParams,
  Paginated,
} from '../types';

// ─── Farms ───────────────────────────────────────────────────────────

export const farmService = {
  async list(params?: ListParams): Promise<Paginated<Farm>> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('farms')
      .select('*, location:locations(*)', { count: 'exact' });

    if (params?.search) {
      query = query.or(
        `name.ilike.%${params.search}%,district.ilike.%${params.search}%,state.ilike.%${params.search}%`,
      );
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      items: (data ?? []) as Farm[],
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  async get(id: string): Promise<Farm> {
    const { data, error } = await supabase
      .from('farms')
      .select('*, location:locations(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Farm not found');
    return data as Farm;
  },

  async create(input: {
    name: string;
    address?: string;
    district?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    farm_size?: number;
    farm_size_unit?: string;
    is_organic?: boolean;
    verification_status?: string;
    description?: string;
  }): Promise<Farm> {
    const { data, error } = await supabase
      .from('farms')
      .insert(input)
      .select('*, location:locations(*)')
      .single();
    if (error) throw error;
    return data as Farm;
  },

  async update(id: string, input: Partial<Record<string, unknown>>): Promise<Farm> {
    const { data, error } = await supabase
      .from('farms')
      .update(input)
      .eq('id', id)
      .select('*, location:locations(*)')
      .single();
    if (error) throw error;
    return data as Farm;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('farms').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Categories ──────────────────────────────────────────────────────

export const categoryService = {
  async list(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []) as ProductCategory[];
  },

  async create(input: { name: string; description?: string }): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from('product_categories')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as ProductCategory;
  },
};

// ─── Products ────────────────────────────────────────────────────────

export const productService = {
  async list(params?: ListParams & { categoryId?: string }): Promise<Paginated<Product>> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('products')
      .select('*, category:product_categories(*)', { count: 'exact' });

    if (params?.search) {
      query = query.or(
        `name.ilike.%${params.search}%,scientific_name.ilike.%${params.search}%`,
      );
    }
    if (params?.categoryId) {
      query = query.eq('category_id', params.categoryId);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      items: (data ?? []) as Product[],
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  async create(input: {
    name: string;
    scientific_name?: string;
    description?: string;
    category_id?: string;
    shelf_life?: string;
    image_url?: string;
  }): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(input)
      .select('*, category:product_categories(*)')
      .single();
    if (error) throw error;
    return data as Product;
  },

  async update(id: string, input: Partial<Record<string, unknown>>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select('*, category:product_categories(*)')
      .single();
    if (error) throw error;
    return data as Product;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Harvests ────────────────────────────────────────────────────────

export const harvestService = {
  async list(params?: ListParams & { farmId?: string }): Promise<Paginated<Harvest>> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('harvests')
      .select('*, farm:farms(*)', { count: 'exact' });

    if (params?.farmId) query = query.eq('farm_id', params.farmId);
    if (params?.search) {
      query = query.or(`season.ilike.%${params.search}%,notes.ilike.%${params.search}%`);
    }

    const { data, error, count } = await query
      .order('harvest_date', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      items: (data ?? []) as Harvest[],
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  async create(input: {
    farm_id: string;
    harvest_date: string;
    weather_notes?: string;
    season?: string;
    notes?: string;
  }): Promise<Harvest> {
    const { data, error } = await supabase
      .from('harvests')
      .insert(input)
      .select('*, farm:farms(*)')
      .single();
    if (error) throw error;
    return data as Harvest;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('harvests').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Batches ─────────────────────────────────────────────────────────

export const batchService = {
  async list(params?: BatchListParams): Promise<Paginated<Batch>> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('batches').select(
      '*, farm:farms(*), product:products(*, category:product_categories(*)), harvest:harvests(*), images:batch_images(*), certifications:certifications(*)',
      { count: 'exact' },
    );

    if (params?.status) query = query.eq('status', params.status);
    if (params?.farmId) query = query.eq('farm_id', params.farmId);
    if (params?.productId) query = query.eq('product_id', params.productId);
    if (params?.search) {
      query = query.or(`batch_id.ilike.%${params.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      items: (data ?? []) as Batch[],
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  async get(id: string): Promise<Batch> {
    const { data, error } = await supabase
      .from('batches')
      .select(
        '*, farm:farms(*, location:locations(*)), product:products(*, category:product_categories(*)), harvest:harvests(*, farm:farms(*)), images:batch_images(*), certifications:certifications(*)',
      )
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Batch not found');
    return data as Batch;
  },

  async create(input: {
    harvest_id: string;
    product_id: string;
    farm_id: string;
    quantity: number;
    unit: string;
  }): Promise<Batch> {
    // Generate the immutable batch ID client-side: FP-KL-YYYY-NNNNNN
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('batches')
      .select('*', { count: 'exact', head: true })
      .like('batch_id', `FP-KL-${year}-%`);
    const seq = String((count ?? 0) + 1).padStart(6, '0');
    const batchId = `FP-KL-${year}-${seq}`;

    const { data, error } = await supabase
      .from('batches')
      .insert({ ...input, batch_id: batchId })
      .select(
        '*, farm:farms(*), product:products(*, category:product_categories(*)), harvest:harvests(*), images:batch_images(*), certifications:certifications(*)',
      )
      .single();
    if (error) throw error;
    return data as Batch;
  },

  async update(id: string, input: Partial<Record<string, unknown>>): Promise<Batch> {
    const { data, error } = await supabase
      .from('batches')
      .update(input)
      .eq('id', id)
      .select(
        '*, farm:farms(*), product:products(*, category:product_categories(*)), harvest:harvests(*), images:batch_images(*), certifications:certifications(*)',
      )
      .single();
    if (error) throw error;
    return data as Batch;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('batches').delete().eq('id', id);
    if (error) throw error;
  },

  async addImage(batchId: string, url: string, caption?: string): Promise<BatchImage> {
    const { data, error } = await supabase
      .from('batch_images')
      .insert({ batch_id: batchId, url, caption })
      .select('*')
      .single();
    if (error) throw error;
    return data as BatchImage;
  },

  async addCertification(input: {
    batch_id: string;
    name: string;
    issued_by: string;
    issue_date: string;
    expiry_date?: string;
    document_url?: string;
  }): Promise<Certification> {
    const { data, error } = await supabase
      .from('certifications')
      .insert(input)
      .select('*')
      .single();
    if (error) throw error;
    return data as Certification;
  },
};
