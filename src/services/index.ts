// Service layer. Each service owns one domain and exposes typed methods.
export { auth } from './auth';
export type { RegisterInput } from './auth';

import { apiClient } from '../api';
import type { User } from '../types';

export const walletService = {
  balance: () => apiClient.get<{ balance: string; currency: string }>('/wallet/balance'),
  transactions: () => apiClient.get<unknown[]>('/wallet/transactions'),
};

// Agricultural domain services (Phase 2)
export {
  farmService,
  categoryService,
  productService,
  harvestService,
  batchService,
} from './agricultural';

// QR & Passport domain services (Phase 4)
export { qrService, passportService } from './qr';
