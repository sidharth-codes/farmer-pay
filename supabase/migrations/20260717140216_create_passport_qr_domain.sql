/*
# FarmerPay Phase 4 — Digital Product Passport & QR Identity

Creates the complete QR code, digital passport, and scan logging infrastructure.

## New Tables

1. **qr_codes** — QR code records for batches. Each batch has one active QR.
   When regenerated (compromised), old QR is invalidated and a new version
   created. Contains signed payload (URL + signature + timestamp + checksum),
   version number, and status.

2. **qr_code_downloads** — Logs every QR download (PNG, SVG, PDF, sticker)
   with format, downloader, and timestamp.

3. **qr_scan_logs** — Logs every public QR scan. Stores scan time,
   approximate location (country/city), device type, browser, and hashed IP
   (never raw IP).

4. **digital_passports** — Cached passport data per batch as JSONB. Contains
   assembled passport (batch, farm, farmer, harvest, images, certifications,
   current holder, status). Updated when batch data changes.

## Security

- All tables have RLS enabled with anon+authenticated CRUD policies.
- QR payloads include HMAC-SHA256 signature to prevent forgery.
- Scan logs store only hashed IPs, never raw addresses.
*/

-- ─── QR Codes ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE,
  batch_internal_id text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  payload text NOT NULL,
  signature text NOT NULL,
  checksum text NOT NULL,
  verify_url text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  generated_by uuid,
  compromised_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_internal_id ON qr_codes(batch_internal_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_qr_codes" ON qr_codes;
CREATE POLICY "anon_crud_qr_codes" ON qr_codes FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── QR Code Downloads ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS qr_code_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid REFERENCES qr_codes(id) ON DELETE CASCADE,
  batch_id uuid,
  format text NOT NULL,
  downloaded_by uuid,
  ip_hash text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_downloads_qr_code_id ON qr_code_downloads(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_downloads_batch_id ON qr_code_downloads(batch_id);

ALTER TABLE qr_code_downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_qr_downloads" ON qr_code_downloads;
CREATE POLICY "anon_crud_qr_downloads" ON qr_code_downloads FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── QR Scan Logs ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS qr_scan_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid,
  batch_internal_id text NOT NULL,
  scan_time timestamptz DEFAULT now(),
  country text,
  city text,
  device_type text,
  browser text,
  ip_hash text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_batch_id ON qr_scan_logs(batch_internal_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_scan_time ON qr_scan_logs(scan_time);

ALTER TABLE qr_scan_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_qr_scan_logs" ON qr_scan_logs;
CREATE POLICY "anon_crud_qr_scan_logs" ON qr_scan_logs FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Digital Passports ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS digital_passports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  batch_internal_id text NOT NULL,
  passport_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  verification_status text NOT NULL DEFAULT 'PENDING',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_digital_passports_batch_id ON digital_passports(batch_id);
CREATE INDEX IF NOT EXISTS idx_digital_passports_batch_internal_id ON digital_passports(batch_internal_id);

ALTER TABLE digital_passports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_digital_passports" ON digital_passports;
CREATE POLICY "anon_crud_digital_passports" ON digital_passports FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── updated_at triggers ───────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_qr_codes_updated_at ON qr_codes;
CREATE TRIGGER trg_qr_codes_updated_at BEFORE UPDATE ON qr_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_digital_passports_updated_at ON digital_passports;
CREATE TRIGGER trg_digital_passports_updated_at BEFORE UPDATE ON digital_passports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
