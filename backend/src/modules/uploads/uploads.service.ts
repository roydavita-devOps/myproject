import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { extensionForMimeType, isUploadAssetType, StoredUpload, UploadAssetType, UPLOAD_POLICIES } from './upload-policy';
import { UploadedFile } from './uploaded-file.type';
import { MalwareScannerService } from './malware-scanner.service';
import { UploadStorageService } from './storage/upload-storage.service';

@Injectable()
export class UploadsService {
  constructor(
    private readonly storage: UploadStorageService,
    private readonly scanner: MalwareScannerService,
  ) {}

  async store(tenantId: string, assetType: UploadAssetType, file?: UploadedFile): Promise<StoredUpload> {
    if (!file) throw new BadRequestException('File is required');

    const policy = UPLOAD_POLICIES[assetType];
    this.validateFile(file, policy.maxSize);
    const scan = this.scanner.scan(file.buffer);

    const extension = extensionForMimeType(file.mimetype);
    if (!extension) throw new BadRequestException('Unsupported file type');

    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const stored = await this.storage.adapter().putObject({
      tenantId,
      assetType,
      directory: policy.directory,
      fileName,
      buffer: file.buffer,
    });

    return {
      tenantId,
      assetType,
      originalName: file.originalname,
      fileName: stored.fileName,
      mimeType: file.mimetype,
      size: file.size,
      url: stored.url,
      scan,
    };
  }

  async readPublicFile(tenantId: string, assetType: string, fileName: string) {
    if (!isUploadAssetType(assetType)) throw new NotFoundException('Asset not found');
    const policy = UPLOAD_POLICIES[assetType];
    return this.storage.adapter().readObject({ tenantId, assetType, directory: policy.directory, fileName });
  }

  async deleteTenantAssetByUrl(tenantId: string, url?: string | null, expectedAssetType?: UploadAssetType) {
    if (!url) return { deleted: false, reason: 'empty_url' };

    const parsed = this.parseUploadedAssetUrl(url);
    if (!parsed) return { deleted: false, reason: 'external_url' };
    if (parsed.tenantId !== tenantId) throw new ForbiddenException('Asset does not belong to tenant');
    if (expectedAssetType && parsed.assetType !== expectedAssetType) throw new BadRequestException('Asset type does not match');

    const policy = UPLOAD_POLICIES[parsed.assetType];
    await this.storage.adapter().deleteObject({
      tenantId: parsed.tenantId,
      assetType: parsed.assetType,
      directory: policy.directory,
      fileName: parsed.fileName,
    });

    return { deleted: true, reason: 'deleted' };
  }

  private validateFile(file: UploadedFile, maxSize: number) {
    if (!file.buffer?.length) throw new BadRequestException('File is empty');
    if (file.size > maxSize) throw new BadRequestException(`File exceeds ${maxSize} bytes`);

    const extension = extensionForMimeType(file.mimetype);
    if (!extension) throw new BadRequestException('Unsupported file type');

    const originalExtension = extname(file.originalname).toLowerCase().replace('.', '');
    if (originalExtension && originalExtension !== 'jpeg' && originalExtension !== extension) {
      throw new BadRequestException('File extension does not match MIME type');
    }

    if (!this.matchesMagicBytes(file.mimetype, file.buffer)) {
      throw new BadRequestException('File content does not match MIME type');
    }
  }

  private matchesMagicBytes(mimeType: string, buffer: Buffer) {
    if (mimeType === 'image/jpeg') return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    if (mimeType === 'image/png') {
      return (
        buffer.length > 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    }
    if (mimeType === 'image/webp') {
      return (
        buffer.length > 12 &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
      );
    }
    return false;
  }

  private parseUploadedAssetUrl(url: string) {
    const path = this.extractPath(url);
    const match = path.match(/^\/api\/v1\/uploads\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (!match) return null;

    const [, tenantId, assetType, fileName] = match;
    if (!isUploadAssetType(assetType)) return null;

    return { tenantId, assetType, fileName };
  }

  private extractPath(url: string) {
    if (url.startsWith('/')) return url;
    try {
      return new URL(url).pathname;
    } catch {
      return '';
    }
  }
}
