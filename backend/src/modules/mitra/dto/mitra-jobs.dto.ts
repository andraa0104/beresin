import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, AssignmentStatus, OrderItemType } from '../../../database/entities/enums';

export class RejectJobDto {
  @ApiProperty({
    example: 'Jarak terlalu jauh atau jadwal teknisi bentrok dengan servis darurat',
    description: 'Alasan penolakan penugasan oleh teknisi',
  })
  @IsNotEmpty({ message: 'Alasan penolakan wajib diisi' })
  @IsString()
  reason: string;
}

export class UpdateJobStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.ON_THE_WAY,
    description: 'Status progres pekerjaan: ON_THE_WAY, ARRIVED, IN_PROGRESS, WAITING_APPROVAL, COMPLETED',
  })
  @IsNotEmpty({ message: 'Status pekerjaan tidak boleh kosong' })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    example: 'Sedang menuju lokasi customer, estimasi sampai 15 menit',
    description: 'Catatan progres dari teknisi',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UploadWorkPhotoDto {
  @ApiProperty({
    example: 'AFTER_WORK',
    description: 'Tipe dokumentasi foto: BEFORE_WORK, IN_PROGRESS, AFTER_WORK, SERIAL_NUMBER, PROOF_COMPLETION',
    default: 'AFTER_WORK',
  })
  @IsNotEmpty({ message: 'Kategori foto tidak boleh kosong' })
  @IsString()
  photoType: string;

  @ApiProperty({
    example: [
      'https://beresin.id/uploads/evidence/ac_before_clean.jpg',
      'https://beresin.id/uploads/evidence/ac_after_clean.jpg',
    ],
    description: 'Daftar URL foto dokumentasi pengerjaan',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Minimal sertakan 1 URL foto' })
  photoUrls: string[];

  @ApiProperty({
    example: 'Evaporator AC telah dicuci bersih dan freon dicek normal 75 psi',
    description: 'Keterangan kondisi hasil pengerjaan',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdditionalItemInputDto {
  @ApiProperty({
    enum: OrderItemType,
    example: OrderItemType.ACCESSORY,
    description: 'Tipe item tambahan (PRODUCT, ACCESSORY, MATERIAL, SERVICE)',
  })
  @IsNotEmpty()
  @IsEnum(OrderItemType)
  itemType: OrderItemType;

  @ApiProperty({ example: 2, description: 'ID referensi produk variant / jasa' })
  @IsNotEmpty()
  @IsNumber()
  referenceId: number;

  @ApiProperty({ example: 1, description: 'Jumlah kuantitas' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  qty: number;
}

export class AddAdditionalItemRequestDto {
  @ApiProperty({
    type: [AdditionalItemInputDto],
    description: 'Daftar item / suku cadang / jasa tambahan yang dibutuhkan di lapangan',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Minimal sertakan 1 item tambahan' })
  @ValidateNested({ each: true })
  @Type(() => AdditionalItemInputDto)
  items: AdditionalItemInputDto[];

  @ApiProperty({
    example: 'Pipa tembaga lama bocor dan butuh penggantian selang 2 meter serta isi freon R32',
    description: 'Alasan teknis penambahan item/pekerjaan yang diajukan ke customer',
  })
  @IsNotEmpty({ message: 'Alasan penambahan item wajib diisi' })
  @IsString()
  reason: string;
}

export class CompleteJobDto {
  @ApiProperty({
    example: 'Pekerjaan selesai 100%, AC dingin dan unit bekerja normal',
    description: 'Laporan penyelesaian pekerjaan teknisi',
    required: false,
  })
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @ApiProperty({
    example: ['https://beresin.id/uploads/evidence/ac_final_work.jpg'],
    description: 'Foto bukti pekerjaan selesai',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  evidencePhotos?: string[];
}
