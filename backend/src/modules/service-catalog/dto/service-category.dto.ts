import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { GeneralStatus } from '../../../database/entities/enums';

export class CreateServiceCategoryDto {
  @ApiProperty({ example: 'AC', description: 'Nama kategori layanan' })
  @IsNotEmpty({ message: 'Nama kategori tidak boleh kosong' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Layanan perbaikan, pemasangan, dan pemeliharaan AC',
    description: 'Deskripsi lengkap kategori',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://beresin.id/images/cat_ac.png',
    description: 'URL gambar/icon kategori',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    enum: GeneralStatus,
    example: GeneralStatus.ACTIVE,
    description: 'Status kategori layanan',
    required: false,
  })
  @IsOptional()
  @IsEnum(GeneralStatus)
  status?: GeneralStatus;
}

export class UpdateServiceCategoryDto extends PartialType(CreateServiceCategoryDto) {}
