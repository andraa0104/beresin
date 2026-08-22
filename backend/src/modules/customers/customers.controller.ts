import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SERVICE', 'MARKETING')
  @ApiOperation({ summary: 'Daftar semua customer dan klasifikasinya (Admin/CS/Marketing)' })
  async findAll() {
    return this.customersService.findAll();
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Dapatkan profil customer saya' })
  async getMyProfile(@Req() req: any) {
    return this.customersService.findByUserId(req.user.userId);
  }

  @Post('locations')
  @ApiOperation({ summary: 'Tambah lokasi GPS alamat customer' })
  async addLocation(
    @Req() req: any,
    @Body() dto: { address: string; latitude?: number; longitude?: number; notes?: string },
  ) {
    return this.customersService.addLocation(req.user.userId, dto);
  }
}
