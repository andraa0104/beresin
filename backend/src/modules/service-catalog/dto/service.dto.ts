import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { GeneralStatus } from '../../../database/entities/enums';

export class CreateServiceDto {
  @ApiProperty({ example: 1, description: 'ID kategori layanan terkait' })
  @IsNotEmpty({ message: 'Category ID tidak boleh kosong' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 'Pasang AC Baru', description: 'Nama layanan spesifik' })
  @IsNotEmpty({ message: 'Nama layanan tidak boleh kosong' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Layanan instalasi unit indoor & outdoor AC standar komprehensif',
    description: 'Deskripsi lengkap layanan',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://beresin.id/images/service_pasang_ac.png',
    description: 'URL gambar thumbnail layanan',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    enum: GeneralStatus,
    example: GeneralStatus.ACTIVE,
    description: 'Status layanan',
    required: false,
  })
  @IsOptional()
  @IsEnum(GeneralStatus)
  status?: GeneralStatus;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
