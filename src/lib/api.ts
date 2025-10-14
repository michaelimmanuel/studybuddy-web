/**
 * Simple API helper library
 * - Generic request<T> with JSON parsing
 * - Timeout support via AbortController
 * - Optional retries with exponential backoff
 * - Convenience helpers: get, post, put, del
 * - Reads base URL from NEXT_PUBLIC_API_BASE_URL
 */

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions extends Omit<RequestInit, 'body' | 'signal'> {
  timeout?: number; 
  retries?: number; 
  retryDelay?: number; 
  token?: string; 
  body?: any; 
}

export class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let _inMemoryToken: string | null = null;

export function setToken(token?: string) {
  _inMemoryToken = token ?? null;
  try { if (token) localStorage.setItem('token', token); else localStorage.removeItem('token'); } catch {}
}
export function getToken() {
  return _inMemoryToken;
}
export function clearToken() {
  _inMemoryToken = null;
  try { localStorage.removeItem('token'); } catch {}
}

let _baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
export function setBaseUrl(url: string) { _baseUrl = url; }
const getBaseUrl = () => _baseUrl;

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function request<T = any>(
  path: string,
  method: HTTPMethod = 'GET',
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeout = 0,
    retries = 0,
    retryDelay = 300,
    headers = {},
    token,
    body,
    ...rest
  } = options;

  const url = path.startsWith('http') ? path : `${getBaseUrl()}${path}`;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(headers as Record<string, string>),
  };

  // attach token if provided
  const resolvedToken = token ?? getToken();
  if (resolvedToken) {
    finalHeaders.Authorization = `Bearer ${resolvedToken}`;
  }

  // Ensure cookies are always sent for authentication
  const credentials = (rest as any).credentials ?? 'include';
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${url}`, {
      headers: finalHeaders,
      credentials,
      hasBody: body !== undefined
    });
  }

  let attempt = 0;

  while (true) {
    attempt++;

    const controller = new AbortController();
    const signals: AbortSignal[] = [controller.signal];

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        // Ensure cookies are sent with all requests for session management
        credentials: credentials,
        // Additional options for better cookie handling
        mode: 'cors',
        ...rest,
      } as RequestInit);

      if (timeoutId) clearTimeout(timeoutId);

      // Debug response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] Response ${res.status}:`, {
          url,
          status: res.status,
          headers: Object.fromEntries(res.headers.entries()),
          ok: res.ok
        });
      }

      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!res.ok) {
        const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
        throw new ApiError(`Request failed with status ${res.status}`, res.status, data);
      }

      if (isJson) {
        return (await res.json()) as T;
      }

      // fallback: return text as any
      const text = await res.text();
      return text as unknown as T;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);

      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const isNetworkError = err instanceof TypeError;

      // If aborted due to timeout, wrap in ApiError
      if (isAbort) {
        const ae = new ApiError('Request timed out');
        // if retries available, retry
        if (attempt <= retries + 1) {
          const delay = retryDelay * Math.pow(2, attempt - 1);
          await sleep(delay);
          continue;
        }
        throw ae;
      }

      // for network errors (failed fetch), allow retry
      if (isNetworkError && attempt <= retries + 1) {
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
        continue;
      }

      // rethrow ApiError or generic errors
      if (err instanceof ApiError) throw err;
      throw new ApiError((err as Error)?.message || 'Unknown error');
    }
  }
}

export const api = {
  get: <T = any>(path: string, opts?: RequestOptions) => request<T>(path, 'GET', opts),
  post: <T = any>(path: string, body?: any, opts?: RequestOptions) => request<T>(path, 'POST', { ...opts, body }),
  put: <T = any>(path: string, body?: any, opts?: RequestOptions) => request<T>(path, 'PUT', { ...opts, body }),
  patch: <T = any>(path: string, body?: any, opts?: RequestOptions) => request<T>(path, 'PATCH', { ...opts, body }),
  del: <T = any>(path: string, body?: any, opts?: RequestOptions) => request<T>(path, 'DELETE', { ...opts, body }),
};

export default api;
