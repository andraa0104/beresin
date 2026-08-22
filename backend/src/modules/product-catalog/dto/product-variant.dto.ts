import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({ example: 1, description: 'ID produk utama terkait' })
  @IsNotEmpty({ message: 'Product ID tidak boleh kosong' })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 'SHARP-AH-A5SAY-05PK', description: 'Kode unik SKU barang' })
  @IsNotEmpty({ message: 'SKU tidak boleh kosong' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 2850000, description: 'Harga jual produk / varian (IDR)' })
  @IsNotEmpty({ message: 'Harga tidak boleh kosong' })
  @IsNumber()
  @Min(0, { message: 'Harga minimal 0' })
  price: number;

  @ApiProperty({ example: 25, description: 'Jumlah stok tersedia', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({
    example: {
      capacity: '0.5 PK',
      power_watt: 350,
      refrigerant: 'R32',
      color: 'White',
      warranty_compressor_years: 10,
    },
    description: 'Spesifikasi teknis produk dalam format JSON fleksibel',
    required: false,
  })
  @IsOptional()
  specification?: Record<string, any>;
}

export class UpdateProductVariantDto extends PartialType(CreateProductVariantDto) {}
