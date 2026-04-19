import { API_BASE } from './endpoints';
import { storage, StorageKeys } from '../utils/storage';

type OnUnauthorized = () => void;
let onUnauthorized: OnUnauthorized | null = null;

export function setOnUnauthorized(cb: OnUnauthorized) {
  onUnauthorized = cb;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false,
): Promise<T> {
  const token = await storage.get<string>(StorageKeys.AUTH_TOKEN);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  console.log(`[apiClient] ${method} ${API_BASE}${path}`);
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined
      ? isFormData ? (body as FormData) : JSON.stringify(body)
      : undefined,
  });

  const text = await res.text();
  console.log(`[apiClient] status: ${res.status} | body(200): ${text.slice(0, 200)}`);
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }

  if (res.status === 401) {
    await storage.remove(StorageKeys.AUTH_TOKEN);
    await storage.remove(StorageKeys.USER_DATA);
    onUnauthorized?.();
    throw new ApiError(401, 'No autorizado');
  }

  if (!res.ok) {
    const msg = (data as any)?.message ?? `Error ${res.status}`;
    throw new ApiError(res.status, msg);
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const apiClient = {
  get:    <T>(path: string)                         => request<T>('GET',    path),
  post:   <T>(path: string, body?: unknown)         => request<T>('POST',   path, body),
  put:    <T>(path: string, body?: unknown)         => request<T>('PUT',    path, body),
  patch:  <T>(path: string, body?: unknown)         => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                         => request<T>('DELETE', path),
  postForm: <T>(path: string, form: FormData)       => request<T>('POST',   path, form, true),
};
