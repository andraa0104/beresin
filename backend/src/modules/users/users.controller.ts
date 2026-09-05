import { Controller, Get, Param, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Dapatkan seluruh daftar user (Admin)' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Dapatkan detail user berdasarkan ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Buat user baru dan tetapkan role (Khusus Super Admin)' })
  async create(
    @Body()
    dto: {
      name: string;
      phone: string;
      email?: string;
      password?: string;
      role?: string;
    },
  ) {
    return this.usersService.createUser(dto);
  }

  @Post(':id/roles')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Assign role ke user' })
  async assignRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.assignRole(+id, role);
  }

  @Post(':id/roles/sync')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Atur ulang seluruh role user (Super Admin)' })
  async updateRoles(@Param('id') id: string, @Body('roles') roles: string[]) {
    return this.usersService.updateRoles(+id, roles || []);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Soft delete user' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
