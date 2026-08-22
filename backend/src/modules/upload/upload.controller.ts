import {
  Controller,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadCategory } from './upload.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Upload & File Management')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ============================================================================
  // 1. UPLOAD SINGLE FILE
  // ============================================================================

  @Post('single')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Upload 1 file (Product image, Service image, Work photo, Customer attachment)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'category',
    enum: ['products', 'services', 'evidence', 'attachments', 'payments', 'general'],
    required: false,
    description: 'Kategori folder penyimpanan',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File gambar (JPG, PNG, WEBP, GIF, SVG) atau Dokumen (PDF) max 10MB',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 201, description: 'File berhasil diunggah' })
  async uploadSingle(
    @UploadedFile() file: any,
    @Query('category') category: UploadCategory = 'general',
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan dalam request multipart');
    }
    return this.uploadService.saveFile(file, category);
  }

  // ============================================================================
  // 2. UPLOAD MULTIPLE FILES
  // ============================================================================

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload beberapa file sekaligus (Maksimal 10 file per request)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'category',
    enum: ['products', 'services', 'evidence', 'attachments', 'payments', 'general'],
    required: false,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Daftar file yang diunggah',
        },
      },
      required: ['files'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiResponse({ status: 201, description: 'Daftar file berhasil diunggah' })
  async uploadMultiple(
    @UploadedFiles() files: any[],
    @Query('category') category: UploadCategory = 'general',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Tidak ada file yang diunggah dalam request');
    }
    return this.uploadService.saveMultipleFiles(files, category);
  }

  // ============================================================================
  // 3. DELETE FILE
  // ============================================================================

  @Delete(':category/:filename')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus file dari storage' })
  @ApiParam({ name: 'category', example: 'products' })
  @ApiParam({ name: 'filename', example: 'ac_sharp_123.jpg' })
  async deleteFile(
    @Param('category') category: UploadCategory,
    @Param('filename') filename: string,
  ) {
    const deleted = await this.uploadService.deleteFile(category, filename);
    if (!deleted) {
      throw new BadRequestException('File tidak ditemukan atau gagal dihapus');
    }
    return { message: `File '${filename}' berhasil dihapus` };
  }
}
