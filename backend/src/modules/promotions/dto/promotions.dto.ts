import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import {
  DiscountType,
  TargetUser,
  PromotionStatus,
} from '../../../database/entities/enums';

export class CreatePromotionDto {
  @ApiProperty({ example: 'DISKONBARU50K', description: 'Kode / Nama promosi' })
  @IsNotEmpty({ message: 'Nama/Kode promosi tidak boleh kosong' })
  @IsString()
  name: string;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.FIXED,
    description: 'Tipe potongan harga (PERCENTAGE atau FIXED)',
  })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 50000, description: 'Nilai diskon (Persentase 0-100 atau Nominal Rupiah)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({
    enum: TargetUser,
    example: TargetUser.NEW_USER,
    description: 'Target pengguna: NEW_USER, EXISTING_USER, ALL_USER',
    default: TargetUser.ALL_USER,
  })
  @IsOptional()
  @IsEnum(TargetUser)
  targetUser?: TargetUser;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Tanggal mulai berlaku' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', description: 'Tanggal berakhir' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    enum: PromotionStatus,
    example: PromotionStatus.ACTIVE,
    description: 'Status promosi (ACTIVE, INACTIVE, EXPIRED)',
    required: false,
  })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}

export class ValidatePromotionDto {
  @ApiProperty({ example: 'DISKONBARU50K', description: 'Kode promo yang dimasukkan pengguna' })
  @IsNotEmpty({ message: 'Kode promo tidak boleh kosong' })
  @IsString()
  promoCode: string;

  @ApiProperty({ example: 250000, description: 'Total subtotal belanja saat ini (IDR)' })
  @IsNotEmpty({ message: 'Subtotal tidak boleh kosong' })
  @IsNumber()
  @Min(0)
  subtotal: number;
}
