import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class MapServiceProductDto {
  @ApiProperty({ example: 1, description: 'ID layanan' })
  @IsNotEmpty({ message: 'Service ID tidak boleh kosong' })
  @IsNumber()
  serviceId: number;

  @ApiProperty({ example: 1, description: 'ID produk utama yang dihubungkan' })
  @IsNotEmpty({ message: 'Product ID tidak boleh kosong' })
  @IsNumber()
  productId: number;

  @ApiProperty({
    example: true,
    description: 'Tandai apakah produk ini direkomendasikan untuk layanan tersebut',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecommended?: boolean;
}

export class MapServiceAccessoryDto {
  @ApiProperty({ example: 1, description: 'ID layanan' })
  @IsNotEmpty({ message: 'Service ID tidak boleh kosong' })
  @IsNumber()
  serviceId: number;

  @ApiProperty({ example: 2, description: 'ID produk aksesoris yang dihubungkan' })
  @IsNotEmpty({ message: 'Product ID tidak boleh kosong' })
  @IsNumber()
  productId: number;
}
