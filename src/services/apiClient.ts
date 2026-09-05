/**
 * ICEGUARD AI - Unified Backend API Client
 * Configurable REST client connecting Next.js frontend to FastAPI backend.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

export interface ApiResponseMeta {
  source?: string;
  data_provenance?: string;
  timestamp?: string;
  isRealData?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Universal fetch wrapper with configurable timeout and error reporting
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 6000
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${cleanEndpoint}`;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new ApiError(
        `API Error [${response.status}] ${response.statusText}: ${errorText}`,
        response.status
      );
    }

    return (await response.json()) as T;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new ApiError(`Request timeout after ${timeoutMs}ms: ${url}`, 408);
    }
    throw err;
  }
}

/**
 * Health check helper
 */
export async function checkBackendHealth(): Promise<{
  online: boolean;
  status?: string;
  version?: string;
  services?: Record<string, string>;
}> {
  try {
    const data = await apiFetch<any>('/health', { method: 'GET' }, 3000);
    return {
      online: data.status === 'HEALTHY',
      status: data.status,
      version: data.version,
      services: data.services,
    };
  } catch {
    return { online: false };
  }
}