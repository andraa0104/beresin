import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEmail, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

export class RegisterDto {
  @ApiProperty({ example: 'Budi Santoso', description: 'Nama lengkap pengguna' })
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @IsString()
  name: string;

  @ApiProperty({ example: '081234567890', description: 'Nomor telepon / WhatsApp aktif' })
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'budi@example.com', description: 'Email pengguna', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @ApiProperty({ example: 'password123', description: 'Password akun (minimal 6 karakter)' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;
}

export class LoginDto {
  @ApiProperty({
    example: '081234567890',
    description: 'Nomor telepon atau email terdaftar (bisa gunakan key phoneOrEmail atau phone)',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneOrEmail?: string;

  @ApiProperty({ example: '081234567890', description: 'Nomor telepon alternatif', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'budi@example.com', description: 'Email alternatif', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'password123', description: 'Password akun' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString()
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register customer baru' })
  @ApiResponse({ status: 201, description: 'Registrasi berhasil' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user dengan email/phone & password' })
  @ApiResponse({ status: 200, description: 'Login berhasil dan menerima JWT' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
