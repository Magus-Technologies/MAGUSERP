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

  console.log(`[apiClient] status: ${res.status} | content-type: ${res.headers.get('content-type')}`);
  let data: unknown;
  let rawText = '';
  try {
    rawText = await res.text();
    console.log(`[apiClient] body length: ${rawText.length} | first 100: ${rawText.slice(0, 100)}`);
    console.log(`[apiClient] last 100: ${rawText.slice(-100)}`);
    // Buscar si hay caracteres no-JSON inesperados
    const match = rawText.match(/[\x00-\x08\x0b\x0c\x0e-\x1f]/);
    if (match) {
      console.warn(`[apiClient] control char found at index ${rawText.indexOf(match[0])}: 0x${match[0].charCodeAt(0).toString(16)}`);
    }
    data = JSON.parse(rawText);
  } catch (e) {
    console.warn('[apiClient] parse failed:', (e as Error).message);
    // Buscar la posición aproximada del error en el texto
    const errMsg = (e as Error).message;
    const posMatch = errMsg.match(/position (\d+)/i) || errMsg.match(/(\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      console.warn(`[apiClient] around error pos ${pos}: ${JSON.stringify(rawText.slice(Math.max(0, pos - 30), pos + 30))}`);
    }
    data = null;
  }

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
