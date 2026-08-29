import { z } from 'zod';
import { OrderItemType } from '@/types/api.generated';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z
    .string()
    .min(8, 'Nomor telepon minimal 8 digit')
    .regex(/^[0-9+]+$/, 'Format nomor telepon hanya boleh berisi angka'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  phoneOrEmail: z.string().min(3, 'Masukkan nomor telepon atau email'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const orderItemInputSchema = z.object({
  itemType: z.nativeEnum(OrderItemType),
  referenceId: z.number().int().positive(),
  qty: z.number().int().min(1, 'Jumlah minimal 1'),
});

export const createOrderSchema = z.object({
  serviceId: z.number().int().positive('Pilih layanan'),
  servicePackageId: z.number().int().positive().optional(),
  locationId: z.number().int().positive().optional(),
  sessionId: z.string().optional(),
  promotionCode: z.string().optional(),
  items: z.array(orderItemInputSchema).optional(),
});

export type CreateOrderFormData = z.infer<typeof createOrderSchema>;

export const locationSchema = z.object({
  address: z.string().min(5, 'Alamat lengkap minimal 5 karakter'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;

export const uploadPaymentProofSchema = z.object({
  bankName: z.string().min(2, 'Nama bank pengirim wajib diisi'),
  accountNumber: z.string().min(4, 'Nomor rekening pengirim wajib diisi'),
  accountHolder: z.string().min(2, 'Nama pemilik rekening wajib diisi'),
  notes: z.string().optional(),
});

export type UploadPaymentProofFormData = z.infer<typeof uploadPaymentProofSchema>;
