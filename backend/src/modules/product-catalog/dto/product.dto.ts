import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ProductType, GeneralStatus } from '../../../database/entities/enums';

export class CreateProductDto {
  @ApiProperty({ example: 1, description: 'ID kategori produk' })
  @IsNotEmpty({ message: 'Category ID tidak boleh kosong' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 'Sharp AC Split Standar 1/2 PK', description: 'Nama produk' })
  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Sharp', description: 'Merk / Brand produk', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    enum: ProductType,
    example: ProductType.MAIN_PRODUCT,
    description: 'Tipe produk: MAIN_PRODUCT, ACCESSORY, MATERIAL, SPAREPART',
    default: ProductType.MAIN_PRODUCT,
  })
  @IsNotEmpty({ message: 'Tipe produk tidak boleh kosong' })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiProperty({
    example: 'AC hemat daya dengan teknologi Turbo Cooling dan Refrigerant R32 ramah lingkungan',
    description: 'Deskripsi detail spesifikasi produk',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://beresin.id/images/products/sharp_ac_half_pk.png',
    description: 'URL gambar produk utama',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    enum: GeneralStatus,
    example: GeneralStatus.ACTIVE,
    description: 'Status produk',
    required: false,
  })
  @IsOptional()
  @IsEnum(GeneralStatus)
  status?: GeneralStatus;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
