import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/lib/api/client';

describe('API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('unwraps envelope response data correctly', async () => {
    const mockData = [{ id: 1, name: 'AC' }];
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        statusCode: 200,
        data: mockData,
        timestamp: new Date().toISOString(),
      }),
    } as any);

    const res = await apiClient<typeof mockData>('services/categories');
    expect(res).toEqual(mockData);
  });

  it('throws ApiError with correct status and message on error response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        success: false,
        statusCode: 400,
        message: 'Nomor telepon sudah terdaftar',
        path: '/api/v1/auth/register',
      }),
    } as any);

    await expect(apiClient('auth/register')).rejects.toThrow('Nomor telepon sudah terdaftar');
  });
});
