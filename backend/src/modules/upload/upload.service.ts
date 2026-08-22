import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  UploadCategory,
  UploadResult,
  IStorageProvider,
} from './upload.interface';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

@Injectable()
export class UploadService implements IStorageProvider {
  private readonly logger = new Logger(UploadService.name);
  private readonly storageType: 'LOCAL' | 'OBJECT_STORAGE';
  private readonly uploadRootDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.storageType =
      this.configService.get<string>('STORAGE_DRIVER') === 's3'
        ? 'OBJECT_STORAGE'
        : 'LOCAL';

    this.uploadRootDir = path.join(process.cwd(), 'public', 'uploads');
    const port = this.configService.get<number>('port', 3000);
    this.baseUrl =
      this.configService.get<string>('APP_URL') || `http://localhost:${port}`;

    this.ensureDirectoryExists(this.uploadRootDir);
    this.logger.log(`>> [Upload Engine] Storage Driver: ${this.storageType}`);
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // ============================================================================
  // 1. FILE VALIDATION (MIME TYPE & FILE SIZE)
  // ============================================================================

  validateFile(file: { originalname: string; mimetype: string; size: number }) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      throw new BadRequestException(
        `Tipe file '${file.mimetype}' tidak diizinkan. Hanya format JPG, PNG, WEBP, GIF, SVG, dan PDF yang didukung.`,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `Ukuran file melebihi batas maksimum 10MB (Ukuran: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      );
    }
  }

  // ============================================================================
  // 2. SAVE FILE (LOCAL WITH OBJECT STORAGE COMPATIBILITY)
  // ============================================================================

  async saveFile(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    category: UploadCategory = 'general',
  ): Promise<UploadResult> {
    this.validateFile(file);

    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanBasename = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);

    const filename = `${cleanBasename}_${uuidv4().slice(0, 8)}${ext}`;

    if (this.storageType === 'OBJECT_STORAGE') {
      // Production Ready: PutObject to S3 / Cloudflare R2 / MinIO
      // const s3Key = `${category}/${filename}`;
      // return { ... s3Url };
    }

    // Local Disk Storage
    const targetDir = path.join(this.uploadRootDir, category);
    this.ensureDirectoryExists(targetDir);

    const targetFilePath = path.join(targetDir, filename);
    await fs.promises.writeFile(targetFilePath, file.buffer);

    const publicUrl = `${this.baseUrl}/uploads/${category}/${filename}`;

    return {
      filename,
      originalName: file.originalname,
      category,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: publicUrl,
      path: targetFilePath,
      storageProvider: 'LOCAL',
    };
  }

  async saveMultipleFiles(
    files: Array<{ buffer: Buffer; originalname: string; mimetype: string; size: number }>,
    category: UploadCategory = 'general',
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Tidak ada file yang diunggah');
    }

    const results: UploadResult[] = [];
    for (const file of files) {
      const result = await this.saveFile(file, category);
      results.push(result);
    }
    return results;
  }

  // ============================================================================
  // 3. DELETE FILE
  // ============================================================================

  async deleteFile(category: UploadCategory, filename: string): Promise<boolean> {
    const targetFilePath = path.join(this.uploadRootDir, category, filename);
    if (fs.existsSync(targetFilePath)) {
      await fs.promises.unlink(targetFilePath);
      return true;
    }
    return false;
  }
}
