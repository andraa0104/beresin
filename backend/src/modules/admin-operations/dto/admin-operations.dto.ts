import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../../database/entities/enums';

export class AssignTechnicianDto {
  @ApiProperty({ example: 1, description: 'ID pesanan yang akan ditugaskan' })
  @IsNotEmpty({ message: 'Order ID tidak boleh kosong' })
  @IsNumber()
  orderId: number;

  @ApiProperty({ example: 1, description: 'ID Mitra / Teknisi yang ditugaskan' })
  @IsNotEmpty({ message: 'Mitra ID tidak boleh kosong' })
  @IsNumber()
  mitraId: number;

  @ApiProperty({
    example: 'Harap bawa tangga 3 meter dan tangga lipat',
    description: 'Catatan operasional penugasan dari Admin ke Teknisi',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderStatusOperationDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.IN_PROGRESS,
    description: 'Status baru pesanan operasional',
  })
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    example: 'Teknisi telah menyelesaikan pekerjaan dan AC dingin maksimal',
    description: 'Alasan / catatan perubahan status oleh Admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
