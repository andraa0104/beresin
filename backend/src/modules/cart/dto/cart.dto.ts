import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum, Min, IsOptional, IsString } from 'class-validator';
import { OrderItemType } from '../../../database/entities/enums';

export class AddCartItemDto {
  @ApiProperty({
    enum: OrderItemType,
    example: OrderItemType.SERVICE,
    description: 'Tipe item: PRODUCT, ACCESSORY, SERVICE',
  })
  @IsNotEmpty({ message: 'Tipe item tidak boleh kosong' })
  @IsEnum(OrderItemType)
  itemType: OrderItemType;

  @ApiProperty({
    example: 1,
    description: 'ID referensi (servicePackageId jika SERVICE, variantId jika PRODUCT/ACCESSORY)',
  })
  @IsNotEmpty({ message: 'Reference ID tidak boleh kosong' })
  @IsNumber()
  referenceId: number;

  @ApiProperty({ example: 1, description: 'Jumlah kuantitas item', default: 1 })
  @IsNotEmpty({ message: 'Qty tidak boleh kosong' })
  @IsNumber()
  @Min(1, { message: 'Qty minimal 1' })
  qty: number;

  @ApiProperty({
    example: 'cart-session-abc-123',
    description: 'Session ID untuk guest / unauthenticated user (opsional jika sudah login)',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({
    enum: OrderItemType,
    example: OrderItemType.PRODUCT,
    description: 'Tipe item',
  })
  @IsNotEmpty()
  @IsEnum(OrderItemType)
  itemType: OrderItemType;

  @ApiProperty({ example: 1, description: 'ID referensi item' })
  @IsNotEmpty()
  @IsNumber()
  referenceId: number;

  @ApiProperty({ example: 2, description: 'Jumlah kuantitas baru (0 untuk menghapus item)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  qty: number;

  @ApiProperty({
    example: 'cart-session-abc-123',
    description: 'Session ID untuk guest (opsional jika sudah login)',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class RemoveCartItemDto {
  @ApiProperty({
    enum: OrderItemType,
    example: OrderItemType.ACCESSORY,
    description: 'Tipe item',
  })
  @IsNotEmpty()
  @IsEnum(OrderItemType)
  itemType: OrderItemType;

  @ApiProperty({ example: 2, description: 'ID referensi item' })
  @IsNotEmpty()
  @IsNumber()
  referenceId: number;

  @ApiProperty({
    example: 'cart-session-abc-123',
    description: 'Session ID untuk guest (opsional jika sudah login)',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class CalculateCartDirectDto {
  @ApiProperty({ example: 1, description: 'ID layanan utama' })
  @IsNotEmpty()
  @IsNumber()
  serviceId: number;

  @ApiProperty({ example: 1, description: 'ID paket jasa yang dipilih', required: false })
  @IsOptional()
  @IsNumber()
  servicePackageId?: number;

  @ApiProperty({
    example: [
      { itemType: 'PRODUCT', referenceId: 1, qty: 1 },
      { itemType: 'ACCESSORY', referenceId: 2, qty: 1 },
    ],
    description: 'Daftar item produk & aksesoris tambahan',
    required: false,
  })
  @IsOptional()
  items?: Array<{ itemType: OrderItemType; referenceId: number; qty: number }>;
}
