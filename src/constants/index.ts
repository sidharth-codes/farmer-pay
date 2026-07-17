import type { UserRole } from '../types';

export const APP_NAME = 'FarmerPay';
export const APP_TAGLINE = 'Trust Every Harvest.';
export const APP_TAGLINE_FULL = 'Trust Every Harvest.';
export const APP_DESCRIPTION =
  'Blockchain-powered agricultural traceability and instant secure payments on the Stellar network.';

export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  FEATURES: '/features',
  HOW_IT_WORKS: '/how-it-works',
  CONTACT: '/contact',
  VERIFY: '/verify/:batchId',
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  // Dashboards
  DASHBOARD: '/dashboard',
  FARMER: '/dashboard/farmer',
  WHOLESALER: '/dashboard/wholesaler',
  RETAILER: '/dashboard/retailer',
  ADMIN: '/dashboard/admin',
  // Agricultural domain
  FARMS: 'farms',
  FARM_CREATE: 'farms/create',
  FARM_DETAIL: 'farms/:farmId',
  PRODUCTS: 'products',
  HARVESTS: 'harvests',
  BATCHES: 'batches',
  BATCH_DETAIL: 'batches/:batchId',
  BATCH_PASSPORT: 'batches/:batchId/passport',
  BATCH_QR: 'batches/:batchId/qr',
  BATCH_SCAN_HISTORY: 'batches/:batchId/scans',
  PROFILE: 'profile',
  SECURITY: 'security',
  // Errors
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
} as const;

export const ROLE_DASHBOARD: Record<Exclude<UserRole, 'CONSUMER'>, string> = {
  FARMER: ROUTES.FARMER,
  WHOLESALER: ROUTES.WHOLESALER,
  RETAILER: ROUTES.RETAILER,
  ADMIN: ROUTES.ADMIN,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  FARMER: 'Farmer',
  WHOLESALER: 'Wholesaler',
  RETAILER: 'Retailer',
  ADMIN: 'Admin',
  CONSUMER: 'Consumer',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  FARMER: 'Register harvests, mint traceable batches, receive instant payments.',
  WHOLESALER: 'Acquire bulk batches with verified provenance, split and redistribute.',
  RETAILER: 'Receive batches for storefronts, expose consumer-facing verification.',
  ADMIN: 'Oversee the network, manage participants and resolve disputes.',
  CONSUMER: 'Scan to verify the full journey of any product from farm to shelf.',
};

export const STORAGE_KEYS = {
  TOKEN: 'farmerpay.token',
  USER: 'farmerpay.user',
  THEME: 'farmerpay.theme',
  REMEMBER_ME: 'farmerpay.remember',
  PENDING_REGISTRATION: 'farmerpay.pending-registration',
} as const;

export const QUERY_KEYS = {
  auth: ['auth'] as const,
  profile: ['profile'] as const,
  notificationPrefs: ['notification-preferences'] as const,
  sessions: ['sessions'] as const,
  auditLogs: ['audit-logs'] as const,
  adminUsers: ['admin-users'] as const,
  farms: ['farms'] as const,
  farm: (id: string) => ['farms', id] as const,
  products: ['products'] as const,
  categories: ['categories'] as const,
  harvests: ['harvests'] as const,
  batches: ['batches'] as const,
  batch: (id: string) => ['batches', id] as const,
  batchPassport: (id: string) => ['batches', id, 'passport'] as const,
  batchQR: (id: string) => ['batches', id, 'qr'] as const,
  batchScans: (id: string) => ['batches', id, 'scans'] as const,
  qrDownloads: (id: string) => ['batches', id, 'downloads'] as const,
} as const;

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
};

export const BATCH_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Created',
  LISTED: 'Listed',
  RESERVED: 'Reserved',
  PURCHASED: 'Purchased',
  TRANSFERRED: 'Transferred',
  DELIVERED: 'Delivered',
  CLOSED: 'Closed',
};

export const BATCH_STATUS_VARIANTS: Record<string, 'secondary' | 'success' | 'warning' | 'destructive' | 'default'> = {
  CREATED: 'secondary',
  LISTED: 'default',
  RESERVED: 'warning',
  PURCHASED: 'success',
  TRANSFERRED: 'default',
  DELIVERED: 'success',
  CLOSED: 'secondary',
};

export const VERIFICATION_STATUS_VARIANTS: Record<string, 'secondary' | 'success' | 'destructive' | 'warning'> = {
  PENDING: 'secondary',
  VERIFIED: 'success',
  REJECTED: 'destructive',
  SUSPENDED: 'warning',
};

export const SEASONS = ['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter', 'Rabi', 'Kharif', 'Zaid'] as const;

export const PASSPORT_VERIFICATION_STATUS_LABELS: Record<string, string> = {
  VERIFIED: 'Verified',
  PENDING_VERIFICATION: 'Pending Verification',
  SUSPENDED: 'Suspended',
  EXPIRED: 'Expired',
  REJECTED: 'Rejected',
};

export const PASSPORT_VERIFICATION_STATUS_VARIANTS: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  VERIFIED: 'success',
  PENDING_VERIFICATION: 'secondary',
  SUSPENDED: 'warning',
  EXPIRED: 'warning',
  REJECTED: 'destructive',
};

export const QR_CODE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  COMPROMISED: 'Compromised',
  EXPIRED: 'Expired',
};

export const QR_CODE_STATUS_VARIANTS: Record<string, 'success' | 'destructive' | 'warning'> = {
  ACTIVE: 'success',
  COMPROMISED: 'destructive',
  EXPIRED: 'warning',
};

export const QR_DOWNLOAD_FORMATS = ['PNG', 'SVG', 'PDF', 'STICKER'] as const;

export const VERIFY_BASE_URL = 'https://farmerpay.app/verify';

export const FARM_SIZE_UNITS = ['acres', 'hectares', 'sq_meters', 'sq_feet'] as const;

export const BATCH_UNITS = ['kg', 'quintal', 'ton', 'crate', 'box', 'bag', 'liter'] as const;
