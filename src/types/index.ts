export type UserRole = 'FARMER' | 'WHOLESALER' | 'RETAILER' | 'ADMIN' | 'CONSUMER';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export type AccountVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  isVerified: boolean;
  verificationStatus: AccountVerificationStatus;
  isSuspended: boolean;
  avatarUrl: string | null;
  bio: string | null;
  country: string | null;
  state: string | null;
  district: string | null;
  timezone: string;
  preferredLanguage: string;
  companyName: string | null;
  businessRegistrationNumber: string | null;
  warehouseAddress: string | null;
  storeName: string | null;
  storeAddress: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  batchUpdates: boolean;
  paymentAlerts: boolean;
  verificationUpdates: boolean;
}

export interface SessionInfo {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

// ─── Agricultural Domain ─────────────────────────────────────────────

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type BatchStatus =
  | 'CREATED'
  | 'LISTED'
  | 'RESERVED'
  | 'PURCHASED'
  | 'TRANSFERRED'
  | 'DELIVERED'
  | 'CLOSED';

export interface Location {
  id: string;
  address: string;
  district: string | null;
  state: string | null;
  country: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Farm {
  id: string;
  name: string;
  ownerId: string | null;
  locationId: string | null;
  location: Location | null;
  address: string | null;
  district: string | null;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  farmSize: number | null;
  farmSizeUnit: string;
  isOrganic: boolean;
  verificationStatus: VerificationStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  scientificName: string | null;
  description: string | null;
  categoryId: string | null;
  category: ProductCategory | null;
  shelfLife: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Harvest {
  id: string;
  farmId: string;
  farm: Farm | null;
  harvestDate: string;
  weatherNotes: string | null;
  season: string | null;
  notes: string | null;
  createdBy: string | null;
  batches?: Batch[];
  createdAt: string;
  updatedAt: string;
}

export interface BatchImage {
  id: string;
  batchId: string;
  url: string;
  caption: string | null;
  uploadedAt: string;
}

export interface Certification {
  id: string;
  batchId: string;
  name: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string | null;
  documentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  batchId: string;
  harvestId: string;
  harvest: Harvest | null;
  productId: string;
  product: Product | null;
  farmId: string;
  farm: Farm | null;
  quantity: number;
  unit: string;
  status: BatchStatus;
  currentHolderId: string | null;
  metadata: Record<string, unknown> | null;
  images: BatchImage[];
  certifications: Certification[];
  createdAt: string;
  updatedAt: string;
}

// ─── List query params ───────────────────────────────────────────────

export interface ListParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface BatchListParams extends ListParams {
  status?: BatchStatus;
  farmId?: string;
  productId?: string;
  categoryId?: string;
}

// ─── QR & Passport Domain ────────────────────────────────────────────

export type QRCodeStatus = 'ACTIVE' | 'COMPROMISED' | 'EXPIRED';

export type PassportVerificationStatus =
  | 'VERIFIED'
  | 'PENDING_VERIFICATION'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'REJECTED';

export interface QRCode {
  id: string;
  batchId: string;
  batchInternalId: string;
  version: number;
  payload: string;
  signature: string;
  checksum: string;
  verifyUrl: string;
  status: QRCodeStatus;
  generatedBy: string | null;
  compromisedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QRCodeDownload {
  id: string;
  qrCodeId: string;
  batchId: string | null;
  format: 'PNG' | 'SVG' | 'PDF' | 'STICKER';
  downloadedBy: string | null;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface QRScanLog {
  id: string;
  qrCodeId: string | null;
  batchInternalId: string;
  scanTime: string;
  country: string | null;
  city: string | null;
  deviceType: string | null;
  browser: string | null;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface DigitalPassport {
  id: string;
  batchId: string;
  batchInternalId: string;
  passportData: PassportData;
  verificationStatus: PassportVerificationStatus;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface PassportData {
  batchId: string;
  batchInternalId: string;
  product: {
    name: string;
    scientificName: string | null;
    description: string | null;
    category: string | null;
    imageUrl: string | null;
  } | null;
  farm: {
    name: string;
    address: string | null;
    district: string | null;
    state: string | null;
    country: string;
    latitude: number | null;
    longitude: number | null;
    isOrganic: boolean;
  } | null;
  farmer: {
    name: string;
    email: string;
  } | null;
  harvest: {
    harvestDate: string;
    season: string | null;
    weatherNotes: string | null;
    notes: string | null;
  } | null;
  quantity: number;
  unit: string;
  status: BatchStatus;
  verificationStatus: PassportVerificationStatus;
  currentHolder: {
    name: string;
    role: UserRole;
  } | null;
  images: BatchImage[];
  certifications: Certification[];
  createdAt: string;
  updatedAt: string;
}

export type QRDownloadFormat = 'PNG' | 'SVG' | 'PDF' | 'STICKER';
