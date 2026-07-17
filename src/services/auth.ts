import { supabase } from '../api/supabase';
import type {
  AccountVerificationStatus,
  AuditLog,
  NotificationPreferences,
  SessionInfo,
  User,
  UserRole,
} from '../types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'CONSUMER'>;
  phone?: string;
  country?: string;
  state?: string;
  district?: string;
  companyName?: string;
  businessRegistrationNumber?: string;
  warehouseAddress?: string;
  storeName?: string;
  storeAddress?: string;
}

export interface LoginResult {
  user: User;
  session: import('@supabase/supabase-js').Session | null;
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as UserRole,
    phone: (row.phone as string) ?? null,
    isVerified: (row.is_verified as boolean) ?? false,
    verificationStatus: (row.verification_status as AccountVerificationStatus) ?? 'PENDING',
    isSuspended: (row.is_suspended as boolean) ?? false,
    avatarUrl: (row.avatar_url as string) ?? null,
    bio: (row.bio as string) ?? null,
    country: (row.country as string) ?? null,
    state: (row.state as string) ?? null,
    district: (row.district as string) ?? null,
    timezone: (row.timezone as string) ?? 'UTC',
    preferredLanguage: (row.preferred_language as string) ?? 'en',
    companyName: (row.company_name as string) ?? null,
    businessRegistrationNumber: (row.business_registration_number as string) ?? null,
    warehouseAddress: (row.warehouse_address as string) ?? null,
    storeName: (row.store_name as string) ?? null,
    storeAddress: (row.store_address as string) ?? null,
    lastLoginAt: (row.last_login_at as string) ?? null,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
  };
}

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data ? mapUser(data) : null;
}

async function upsertProfile(
  authUserId: string,
  input: RegisterInput,
): Promise<User> {
  const row = {
    id: authUserId,
    name: input.name,
    email: input.email,
    role: input.role,
    phone: input.phone ?? null,
    country: input.country ?? null,
    state: input.state ?? null,
    district: input.district ?? null,
    company_name: input.companyName ?? null,
    business_registration_number: input.businessRegistrationNumber ?? null,
    warehouse_address: input.warehouseAddress ?? null,
    store_name: input.storeName ?? null,
    store_address: input.storeAddress ?? null,
    verification_status: 'PENDING' as AccountVerificationStatus,
    is_verified: false,
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(row)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Failed to create user profile');
  return mapUser(data);
}

async function createNotificationPreferences(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: userId });
  if (error) throw error;
}

async function logAudit(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    metadata: metadata ?? {},
  });
}

export const auth = {
  async register(input: RegisterInput): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { name: input.name, role: input.role } },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Registration failed');

    const user = await upsertProfile(data.user.id, input);
    await createNotificationPreferences(data.user.id);
    await logAudit(data.user.id, 'REGISTER', { role: input.role });
    return user;
  },

  async login(email: string, password: string): Promise<LoginResult> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    const user = await fetchProfile(data.user.id);
    if (!user) throw new Error('Profile not found');
    if (user.isSuspended) throw new Error('Account suspended. Contact support.');

    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id);
    await logAudit(data.user.id, 'LOGIN');

    return { user, session: data.session };
  },

  async logout(): Promise<void> {
    const { data } = await supabase.auth.getUser();
    if (data.user) await logAudit(data.user.id, 'LOGOUT');
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return fetchProfile(data.user.id);
  },

  async updateProfile(
    userId: string,
    updates: Partial<{
      name: string;
      phone: string;
      avatarUrl: string;
      bio: string;
      country: string;
      state: string;
      district: string;
      timezone: string;
      preferredLanguage: string;
      companyName: string;
      businessRegistrationNumber: string;
      warehouseAddress: string;
      storeName: string;
      storeAddress: string;
    }>,
  ): Promise<User> {
    const snakeCase: Record<string, unknown> = {};
    if (updates.name !== undefined) snakeCase.name = updates.name;
    if (updates.phone !== undefined) snakeCase.phone = updates.phone;
    if (updates.avatarUrl !== undefined) snakeCase.avatar_url = updates.avatarUrl;
    if (updates.bio !== undefined) snakeCase.bio = updates.bio;
    if (updates.country !== undefined) snakeCase.country = updates.country;
    if (updates.state !== undefined) snakeCase.state = updates.state;
    if (updates.district !== undefined) snakeCase.district = updates.district;
    if (updates.timezone !== undefined) snakeCase.timezone = updates.timezone;
    if (updates.preferredLanguage !== undefined) snakeCase.preferred_language = updates.preferredLanguage;
    if (updates.companyName !== undefined) snakeCase.company_name = updates.companyName;
    if (updates.businessRegistrationNumber !== undefined) snakeCase.business_registration_number = updates.businessRegistrationNumber;
    if (updates.warehouseAddress !== undefined) snakeCase.warehouse_address = updates.warehouseAddress;
    if (updates.storeName !== undefined) snakeCase.store_name = updates.storeName;
    if (updates.storeAddress !== undefined) snakeCase.store_address = updates.storeAddress;

    const { data, error } = await supabase
      .from('users')
      .update(snakeCase)
      .eq('id', userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Failed to update profile');
    await logAudit(userId, 'PROFILE_UPDATE');
    return mapUser(data);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email ?? '',
      password: currentPassword,
    });
    if (verifyError) throw new Error('Current password is incorrect');

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;

    const { data } = await supabase.auth.getUser();
    if (data.user) await logAudit(data.user.id, 'PASSWORD_CHANGE');
  },

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      await createNotificationPreferences(userId);
      return {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        batchUpdates: true,
        paymentAlerts: true,
        verificationUpdates: true,
      };
    }
    return {
      emailEnabled: data.email_enabled,
      pushEnabled: data.push_enabled,
      smsEnabled: data.sms_enabled,
      batchUpdates: data.batch_updates,
      paymentAlerts: data.payment_alerts,
      verificationUpdates: data.verification_updates,
    };
  },

  async updateNotificationPreferences(
    userId: string,
    prefs: NotificationPreferences,
  ): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .update({
        email_enabled: prefs.emailEnabled,
        push_enabled: prefs.pushEnabled,
        sms_enabled: prefs.smsEnabled,
        batch_updates: prefs.batchUpdates,
        payment_alerts: prefs.paymentAlerts,
        verification_updates: prefs.verificationUpdates,
      })
      .eq('user_id', userId);
    if (error) throw error;
  },

  async getSessions(userId: string): Promise<SessionInfo[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((s) => ({
      id: s.id,
      deviceInfo: s.device_info,
      ipAddress: s.ip_address,
      expiresAt: s.expires_at,
      createdAt: s.created_at,
    }));
  },

  async getAuditLogs(userId: string, limit = 20): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((l) => ({
      id: l.id,
      action: l.action,
      resourceType: l.resource_type,
      resourceId: l.resource_id,
      metadata: l.metadata,
      ipAddress: l.ip_address,
      userAgent: l.user_agent,
      createdAt: l.created_at,
    }));
  },

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async resetPassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async adminGetUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapUser);
  },

  async adminUpdateUserStatus(
    userId: string,
    updates: { verificationStatus?: AccountVerificationStatus; isSuspended?: boolean },
  ): Promise<void> {
    const row: Record<string, unknown> = {};
    if (updates.verificationStatus !== undefined) {
      row.verification_status = updates.verificationStatus;
      row.is_verified = updates.verificationStatus === 'VERIFIED';
    }
    if (updates.isSuspended !== undefined) {
      row.is_suspended = updates.isSuspended;
      row.suspended_at = updates.isSuspended ? new Date().toISOString() : null;
    }
    const { error } = await supabase.from('users').update(row).eq('id', userId);
    if (error) throw error;
    await logAudit(userId, 'ADMIN_STATUS_UPDATE', updates);
  },
};
