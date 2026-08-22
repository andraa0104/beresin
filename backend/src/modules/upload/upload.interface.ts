export type UploadCategory =
  | 'products'
  | 'services'
  | 'evidence'
  | 'attachments'
  | 'payments'
  | 'general';

export interface UploadResult {
  filename: string;
  originalName: string;
  category: UploadCategory;
  mimeType: string;
  sizeBytes: number;
  url: string;
  path: string;
  storageProvider: 'LOCAL' | 'OBJECT_STORAGE';
}

export interface IStorageProvider {
  saveFile(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    category: UploadCategory,
  ): Promise<UploadResult>;
  deleteFile(category: UploadCategory, filename: string): Promise<boolean>;
}
