import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { GeneralStatus } from '../../../database/entities/enums';

export class CreateServicePackageDto {
  @ApiProperty({ example: 1, description: 'ID layanan terkait' })
  @IsNotEmpty({ message: 'Service ID tidak boleh kosong' })
  @IsNumber()
  serviceId: number;

  @ApiProperty({ example: 'Premium Installation (Include Vakum)', description: 'Nama paket jasa' })
  @IsNotEmpty({ message: 'Nama paket jasa tidak boleh kosong' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Pemasangan rapi include bobok 1 titik dan proses vakum pipa standar pabrik',
    description: 'Deskripsi detail cakupan paket pekerjaan',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 250000, description: 'Harga dasar paket jasa (IDR)' })
  @IsNotEmpty({ message: 'Harga paket jasa tidak boleh kosong' })
  @IsNumber()
  @Min(0, { message: 'Harga minimal 0' })
  price: number;

  @ApiProperty({
    example: 90,
    description: 'Estimasi durasi pengerjaan dalam menit',
    required: false,
    default: 60,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMinutes?: number;

  @ApiProperty({
    enum: GeneralStatus,
    example: GeneralStatus.ACTIVE,
    description: 'Status paket jasa',
    required: false,
  })
  @IsOptional()
  @IsEnum(GeneralStatus)
  status?: GeneralStatus;
}

export class UpdateServicePackageDto extends PartialType(CreateServicePackageDto) {}
