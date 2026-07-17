// Central API client. Phase 1 ships the surface; Phase 2 points BASE_URL
// at the Express backend and wires real JWT auth.
import { requireEnv } from '../utils';

const BASE_URL = requireEnv('VITE_API_URL') || '/api';

export interface RequestOptions extends RequestInit {
  auth?: boolean;
}

// Phase 1: no real backend yet. This client is written so Phase 2 only needs
// to flip the implementation — call sites stay unchanged.
export const apiClient = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { auth = true, headers, ...rest } = options;
    const token = auth ? localStorage.getItem('farmerpay.token') : null;

    const response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...rest,
    });

    if (!response.ok) {
      throw new ApiClientError(response.status, await response.text().catch(() => 'Request failed'));
    }
    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  },
  get: <T>(path: string, opts?: RequestOptions) => apiClient.request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiClient.request<T>(path, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiClient.request<T>(path, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    apiClient.request<T>(path, { ...opts, method: 'DELETE' }),
};

export class ApiClientError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiClientError';
  }
}
