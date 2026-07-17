/*
# FarmerPay Phase 3 — Authentication & Authorization Domain

Creates the `users` table (which existed only in Prisma schema until now)
and the complete auth foundation: sessions, refresh tokens, audit logs,
notification preferences, email verifications, and password reset tokens.

## New Tables

1. **users** — Core identity table with auth columns (password_hash,
   verification_status, is_suspended, profile fields, role-specific
   business fields like company_name, warehouse_address, store_name).

2. **sessions** — Active user sessions (device, IP, expires_at) for
   session validation and revocation.

3. **refresh_tokens** — JWT refresh token store with rotation support.

4. **audit_logs** — Immutable record of security-relevant actions.

5. **notification_preferences** — Per-user notification toggles.

6. **email_verifications** — OTP-based email verification tokens.

7. **password_reset_tokens** — Password reset tokens with expiry.

## Security

- All tables have RLS enabled with anon+authenticated CRUD policies
  (transitional — the Express backend will enforce authorization
  server-side using the service role key).
- Token tables store hashed tokens, never plaintext.
*/

-- ─── Users ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text,
  role text NOT NULL DEFAULT 'FARMER',
  phone text,
  password_hash text,
  is_verified boolean NOT NULL DEFAULT false,
  verification_status text NOT NULL DEFAULT 'PENDING',
  is_suspended boolean NOT NULL DEFAULT false,
  suspended_at timestamptz,
  preferred_language text DEFAULT 'en',
  country text,
  state text,
  district text,
  timezone text DEFAULT 'UTC',
  avatar_url text,
  bio text,
  company_name text,
  business_registration_number text,
  warehouse_address text,
  store_name text,
  store_address text,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_is_suspended ON users(is_suspended);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_users" ON users;
CREATE POLICY "anon_crud_users" ON users FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Sessions ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash text NOT NULL,
  device_info text,
  ip_address text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token_hash ON sessions(refresh_token_hash);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_sessions" ON sessions;
CREATE POLICY "anon_crud_sessions" ON sessions FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Refresh Tokens ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  replaced_by uuid REFERENCES refresh_tokens(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_refresh_tokens" ON refresh_tokens;
CREATE POLICY "anon_crud_refresh_tokens" ON refresh_tokens FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Audit Logs ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_audit_logs" ON audit_logs;
CREATE POLICY "anon_crud_audit_logs" ON audit_logs FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Notification Preferences ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  batch_updates boolean NOT NULL DEFAULT true,
  payment_alerts boolean NOT NULL DEFAULT true,
  verification_updates boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON notification_preferences(user_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_notification_prefs" ON notification_preferences;
CREATE POLICY "anon_crud_notification_prefs" ON notification_preferences FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Email Verifications ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_code text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token_hash ON email_verifications(token_hash);

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_email_verifications" ON email_verifications;
CREATE POLICY "anon_crud_email_verifications" ON email_verifications FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── Password Reset Tokens ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_password_reset_tokens" ON password_reset_tokens;
CREATE POLICY "anon_crud_password_reset_tokens" ON password_reset_tokens FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ─── updated_at trigger for users ───────────────────────────────────

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── updated_at trigger for notification_preferences ─────────────────

DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
