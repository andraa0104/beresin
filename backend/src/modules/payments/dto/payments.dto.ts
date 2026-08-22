import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { PaymentStatus } from '../../../database/entities/enums';

export enum ManualPaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
}

export class CreatePaymentRecordDto {
  @ApiProperty({ example: 1, description: 'ID pesanan yang akan dibayar' })
  @IsNotEmpty({ message: 'Order ID tidak boleh kosong' })
  @IsNumber()
  orderId: number;

  @ApiProperty({
    enum: ManualPaymentMethod,
    example: ManualPaymentMethod.TRANSFER,
    description: 'Metode pembayaran manual: CASH atau TRANSFER',
  })
  @IsNotEmpty({ message: 'Metode pembayaran tidak boleh kosong' })
  @IsEnum(ManualPaymentMethod)
  paymentMethod: ManualPaymentMethod;

  @ApiProperty({
    example: 'BCA',
    description: 'Pilihan rekening bank Beresin jika metode TRANSFER (e.g. BCA, MANDIRI, BRI)',
    required: false,
    default: 'BCA',
  })
  @IsOptional()
  @IsString()
  bankName?: string;
}

export class UploadPaymentProofDto {
  @ApiProperty({
    example: 'https://beresin.id/uploads/payments/proof_transfer_123.jpg',
    description: 'URL foto struk/bukti transfer bank dari customer',
  })
  @IsNotEmpty({ message: 'URL bukti transfer wajib diisi' })
  @IsString()
  proofUrl: string;

  @ApiProperty({
    example: 'Transfer dari rekening BCA a.n. Budi Santoso',
    description: 'Catatan pengirim transfer',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class TechnicianSubmitCashDto {
  @ApiProperty({
    example: 'https://beresin.id/uploads/payments/cash_receipt_123.jpg',
    description: 'Foto bukti serah terima uang tunai dari customer di lokasi',
    required: false,
  })
  @IsOptional()
  @IsString()
  proofUrl?: string;

  @ApiProperty({
    example: 'Uang pas Rp 3.170.000 telah diterima tunai di tempat oleh teknisi',
    description: 'Catatan serah terima uang tunai',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({
    example: 'Dana transfer telah masuk dan mutasi bank telah diverifikasi valid',
    description: 'Catatan verifikasi dari Admin / Marketing',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectPaymentDto {
  @ApiProperty({
    example: 'Nominal transfer tidak sesuai / mutasi rekening tidak ditemukan',
    description: 'Alasan penolakan bukti pembayaran',
  })
  @IsNotEmpty({ message: 'Alasan penolakan wajib diisi' })
  @IsString()
  reason: string;
}
