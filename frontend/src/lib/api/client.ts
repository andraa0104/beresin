/**
 * Centralized API Client for Beresin Platform
 * Handles Envelope Normalization, Error Extraction, Auth Headers, and Timeout
 */

import { ApiResponse, ApiErrorResponse } from '@/types/api.generated';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  statusCode: number;
  errorPath?: string;
  originalMessage: string | string[];

  constructor(statusCode: number, message: string | string[], path?: string) {
    const formattedMessage = Array.isArray(message) ? message.join(', ') : message;
    super(formattedMessage);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorPath = path;
    this.originalMessage = message;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  token?: string | null;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, token, headers, ...restOptions } = options;

  // Clean URL endpoint
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  // Build headers
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  // If body is NOT FormData, set JSON content type
  if (!(restOptions.body instanceof FormData) && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  // Inject Bearer token
  const activeToken = token !== undefined ? token : getClientStoredToken();
  if (activeToken) {
    reqHeaders['Authorization'] = `Bearer ${activeToken}`;
  }

  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: reqHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const errorJson = json as ApiErrorResponse | null;
      const message = errorJson?.message || response.statusText || 'Terjadi kesalahan pada server';
      throw new ApiError(response.status, message, errorJson?.path);
    }

    // Unwrap envelope: return data directly if envelope exists
    if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
      return (json as ApiResponse<T>).data;
    }

    return json as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Koneksi timeout. Silakan periksa jaringan internet Anda dan coba lagi.');
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || 'Gagal terhubung ke server Beresin');
  }
}

function getClientStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('beresin_auth_token');
  } catch {
    return null;
  }
}
