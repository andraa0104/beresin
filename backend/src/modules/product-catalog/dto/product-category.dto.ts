import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductCategoryDto {
  @ApiProperty({ example: 'Air Conditioner Unit', description: 'Nama kategori produk' })
  @IsNotEmpty({ message: 'Nama kategori tidak boleh kosong' })
  @IsString()
  name: string;
}

export class UpdateProductCategoryDto extends PartialType(CreateProductCategoryDto) {}
