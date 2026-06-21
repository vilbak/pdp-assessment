// Small fetch wrapper for every request: base URL, auth header, JSON body, error check.
import { getAuthToken } from '../auth/auth';

const BASE_URL = '/api';

// Issue 4: one request() path instead of the original's 5 copy-pasted fetch blocks.
export const request = async <T>(
  path: string,
  options: { signal?: AbortSignal; method?: string; body?: unknown } = {},
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    signal: options.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`, // Issue 10: one correct Bearer header (original had it inverted)
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
};
