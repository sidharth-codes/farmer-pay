/*
# FarmerPay Phase 2 — Agricultural Domain Foundation

Creates the complete agricultural data model that every future feature
(QR tracking, ownership transfers, batch splitting, Stellar payments)
will build on.

## New Tables

1. **locations** — Reusable address object. Future ownership transfers and
   custody changes will reference this table instead of duplicating address
   fields. Decoupled from farms so any entity (warehouse, retail store,
   transit hub) can reference a location.

2. **product_categories** — Dynamic product categories (Vegetables, Fruits,
   Grains, Spices, Coffee, Tea, Flowers, Dairy, Other). Seeded with defaults
   but fully user-manageable so new categories can be added at runtime.

3. **farms** — A farmer may own multiple farms. Each farm references a
   location and stores geo coordinates, size, organic/verification status.

4. **products** — Product types (Tomato, Potato, Banana, Rice, Wheat).
   Each product belongs to a category and carries shelf-life and image.

5. **harvests** — A single harvesting event on a farm. One harvest can
   produce multiple batches. Created by references the future User model.

6. **batches** — The core traceability unit. Each batch receives an
   immutable, globally-unique Batch ID (e.g. FP-KL-2026-000001) generated
   by the application layer. The Batch ID NEVER changes. Current Holder
   is nullable and temporary — full ownership history arrives in a later
   phase via a separate ownership_history table.

7. **batch_images** — Multiple images per batch (URL, caption, upload date).

8. **certifications** — Multiple certifications per batch (Organic, FSSAI,
   Export Grade, Government Certified) with issuer, issue/expiry dates,
   and document URL.

## Indexes

- batches.batch_id (unique) — immutable ID lookups
- batches.harvest_id — list batches for a harvest
- batches.farm_id — list batches for a farm
- batches.product_id — list batches for a product
- batches.status — filter by status
- harvests.farm_id — list harvests for a farm
- harvests.harvest_date — date-range queries
- products.category_id — filter products by category
- farms.owner_id — list farms for a farmer

## Security

This is a single-tenant foundation phase (no auth implemented yet).
RLS is enabled on all tables with anon+authenticated CRUD allowed,
matching the Phase 1 pattern. When auth ships, these policies will be
tightened to owner-scoped checks.
*/

-- ─── Locations ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  district text,
  state text,
  country text NOT NULL DEFAULT 'India',
  postal_code text,
  latitude double precision,
  longitude double precision,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_locations" ON locations;
CREATE POLICY "anon_crud_locations" ON locations FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Product Categories ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_product_categories" ON product_categories;
CREATE POLICY "anon_crud_product_categories" ON product_categories FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed default categories
INSERT INTO product_categories (name) VALUES
  ('Vegetables'), ('Fruits'), ('Grains'), ('Spices'),
  ('Coffee'), ('Tea'), ('Flowers'), ('Dairy'), ('Other')
ON CONFLICT (name) DO NOTHING;

-- ─── Farms ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  address text,
  district text,
  state text,
  country text NOT NULL DEFAULT 'India',
  latitude double precision,
  longitude double precision,
  farm_size double precision,
  farm_size_unit text NOT NULL DEFAULT 'acres',
  is_organic boolean NOT NULL DEFAULT false,
  verification_status text NOT NULL DEFAULT 'PENDING',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_farms_location_id ON farms(location_id);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_farms" ON farms;
CREATE POLICY "anon_crud_farms" ON farms FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Products ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scientific_name text,
  description text,
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  shelf_life text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_products" ON products;
CREATE POLICY "anon_crud_products" ON products FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Harvests ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS harvests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  harvest_date date NOT NULL,
  weather_notes text,
  season text,
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_harvests_farm_id ON harvests(farm_id);
CREATE INDEX IF NOT EXISTS idx_harvests_harvest_date ON harvests(harvest_date);

ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_harvests" ON harvests;
CREATE POLICY "anon_crud_harvests" ON harvests FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Batches ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id text NOT NULL UNIQUE,
  harvest_id uuid NOT NULL REFERENCES harvests(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  quantity double precision NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  status text NOT NULL DEFAULT 'CREATED',
  current_holder_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_batches_batch_id ON batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_batches_harvest_id ON batches(harvest_id);
CREATE INDEX IF NOT EXISTS idx_batches_farm_id ON batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_batches_product_id ON batches(product_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_batches" ON batches;
CREATE POLICY "anon_crud_batches" ON batches FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Batch Images ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS batch_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  uploaded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_batch_images_batch_id ON batch_images(batch_id);

ALTER TABLE batch_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_batch_images" ON batch_images;
CREATE POLICY "anon_crud_batch_images" ON batch_images FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Certifications ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  name text NOT NULL,
  issued_by text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certifications_batch_id ON certifications(batch_id);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_certifications" ON certifications;
CREATE POLICY "anon_crud_certifications" ON certifications FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── updated_at trigger ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_locations_updated_at ON locations;
CREATE TRIGGER trg_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_product_categories_updated_at ON product_categories;
CREATE TRIGGER trg_product_categories_updated_at BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_farms_updated_at ON farms;
CREATE TRIGGER trg_farms_updated_at BEFORE UPDATE ON farms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_harvests_updated_at ON harvests;
CREATE TRIGGER trg_harvests_updated_at BEFORE UPDATE ON harvests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_batches_updated_at ON batches;
CREATE TRIGGER trg_batches_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_certifications_updated_at ON certifications;
CREATE TRIGGER trg_certifications_updated_at BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
