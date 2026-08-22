import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, OrderItemType } from '../../../database/entities/enums';

export class OrderItemInputDto {
  @ApiProperty({
    enum: OrderItemType,
    example: OrderItemType.PRODUCT,
    description: 'Tipe item: PRODUCT, ACCESSORY, SERVICE',
  })
  @IsNotEmpty()
  @IsEnum(OrderItemType)
  itemType: OrderItemType;

  @ApiProperty({ example: 1, description: 'ID referensi (variantId atau servicePackageId)' })
  @IsNotEmpty()
  @IsNumber()
  referenceId: number;

  @ApiProperty({ example: 1, description: 'Jumlah kuantitas', default: 1 })
  @IsNotEmpty()
  @IsNumber()
  qty: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID layanan yang dipesan (e.g. Pasang AC Baru)' })
  @IsNotEmpty({ message: 'Service ID tidak boleh kosong' })
  @IsNumber()
  serviceId: number;

  @ApiProperty({
    example: 1,
    description: 'ID paket jasa yang dipilih (e.g. Basic Installation)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  servicePackageId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID alamat / lokasi pengerjaan customer',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  locationId?: number;

  @ApiProperty({
    example: 'guest-session-123',
    description: 'Session ID cart jika checkout dari keranjang guest',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({
    example: 'DISKONBARU50K',
    description: 'Kode voucher promosi (opsional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  promotionCode?: string;

  @ApiProperty({
    type: [OrderItemInputDto],
    description: 'Daftar item produk & aksesoris tambahan (opsional jika checkout dari cart)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items?: OrderItemInputDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.ASSIGNED,
    description: 'Status baru pesanan',
  })
  @IsNotEmpty({ message: 'Status order tidak boleh kosong' })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
