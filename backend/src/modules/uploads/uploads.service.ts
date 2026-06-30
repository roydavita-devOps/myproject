import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import sharp from 'sharp';
import { extensionForMimeType, isUploadAssetType, StoredUpload, UploadAssetType, UPLOAD_POLICIES } from './upload-policy';
import { UploadedFile } from './uploaded-file.type';
import { MalwareScannerService } from './malware-scanner.service';
import { UploadStorageService } from './storage/upload-storage.service';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly storage: UploadStorageService,
    private readonly scanner: MalwareScannerService,
  ) {}

  async store(tenantId: string, assetType: UploadAssetType, file?: UploadedFile, websiteId?: string): Promise<StoredUpload> {
    if (!file) throw new BadRequestException('File is required');

    const policy = UPLOAD_POLICIES[assetType];
    this.validateFile(file, policy.maxSize);
    const scan = this.scanner.scan(file.buffer);

    const extension = extensionForMimeType(file.mimetype);
    if (!extension) throw new BadRequestException('Unsupported file type');

    const processed = await this.processImage(file);
    const imageId = `${Date.now()}-${randomUUID()}`;
    const originalFileName = `${imageId}-original.${extension}`;
    const thumbnailFileName = `${imageId}-thumb.webp`;
    const mediumFileName = `${imageId}-medium.webp`;
    const largeFileName = `${imageId}-large.webp`;

    const original = await this.storage.adapter().putObject({
      tenantId,
      websiteId,
      assetType,
      assetId: imageId,
      directory: policy.directory,
      fileName: originalFileName,
      contentType: file.mimetype,
      buffer: file.buffer,
    });
    const thumbnail = await this.storage.adapter().putObject({
      tenantId,
      websiteId,
      assetType,
      assetId: imageId,
      directory: policy.directory,
      fileName: thumbnailFileName,
      contentType: 'image/webp',
      buffer: processed.thumbnail,
    });
    const medium = await this.storage.adapter().putObject({
      tenantId,
      websiteId,
      assetType,
      assetId: imageId,
      directory: policy.directory,
      fileName: mediumFileName,
      contentType: 'image/webp',
      buffer: processed.medium,
    });
    const large = await this.storage.adapter().putObject({
      tenantId,
      websiteId,
      assetType,
      assetId: imageId,
      directory: policy.directory,
      fileName: largeFileName,
      contentType: 'image/webp',
      buffer: processed.large,
    });
    const primary = this.primaryUploadForAssetType(assetType, { thumbnail, medium, large });

    return {
      tenantId,
      assetType,
      originalName: file.originalname,
      fileName: primary.fileName,
      mimeType: 'image/webp',
      size: primary.fileName === medium.fileName ? processed.medium.length : processed.large.length,
      url: primary.url,
      originalUrl: original.url,
      thumbnailUrl: thumbnail.url,
      mediumUrl: medium.url,
      largeUrl: large.url,
      width: processed.width,
      height: processed.height,
      scan,
    };
  }

  async readPublicFile(tenantId: string, assetType: string, fileName: string) {
    if (!isUploadAssetType(assetType)) throw new NotFoundException('Asset not found');
    const policy = UPLOAD_POLICIES[assetType];
    return this.storage.localAdapter().readObject({ tenantId, assetType, directory: policy.directory, fileName });
  }

  async deleteTenantAssetByUrl(tenantId: string, url?: string | null, expectedAssetType?: UploadAssetType) {
    if (!url) return { deleted: false, reason: 'empty_url' };

    const parsed = this.storage.parseUrl(url);
    if (!parsed) return { deleted: false, reason: 'external_url' };
    if (!isUploadAssetType(parsed.assetType)) return { deleted: false, reason: 'external_url' };
    if (parsed.tenantId !== tenantId) throw new ForbiddenException('Asset does not belong to tenant');
    if (expectedAssetType && parsed.assetType !== expectedAssetType) throw new BadRequestException('Asset type does not match');

    const policy = UPLOAD_POLICIES[parsed.assetType];
    await this.deleteKnownVariants(parsed.tenantId, parsed.assetType, policy.directory, parsed.fileName, parsed.objectKey);

    return { deleted: true, reason: 'deleted' };
  }

  private async processImage(file: UploadedFile) {
    try {
      const image = sharp(file.buffer, { failOn: 'error' }).rotate();
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height) throw new Error('Missing image dimensions');

      const toWebp = (width: number) =>
        sharp(file.buffer, { failOn: 'error' })
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();

      const [thumbnail, medium, large] = await Promise.all([toWebp(320), toWebp(800), toWebp(1400)]);
      return {
        thumbnail,
        medium,
        large,
        width: metadata.width,
        height: metadata.height,
      };
    } catch {
      throw new BadRequestException('The uploaded image could not be processed.');
    }
  }

  private primaryUploadForAssetType<T extends { fileName: string; url: string }>(
    assetType: UploadAssetType,
    uploads: { thumbnail: T; medium: T; large: T },
  ) {
    if (assetType === 'logo') return uploads.medium;
    if (assetType === 'menu') return uploads.medium;
    return uploads.large;
  }

  private async deleteKnownVariants(tenantId: string, assetType: UploadAssetType, directory: string, fileName: string, objectKey?: string) {
    const imageId = fileName.replace(/-(original|thumb|medium|large)\.(jpg|png|webp)$/i, '');
    const candidates = objectKey
      ? this.supabaseVariantCandidates(objectKey)
      : [
          { fileName, objectKey: undefined },
          { fileName: `${imageId}-thumb.webp`, objectKey: undefined },
          { fileName: `${imageId}-medium.webp`, objectKey: undefined },
          { fileName: `${imageId}-large.webp`, objectKey: undefined },
          { fileName: `${imageId}-original.jpg`, objectKey: undefined },
          { fileName: `${imageId}-original.png`, objectKey: undefined },
          { fileName: `${imageId}-original.webp`, objectKey: undefined },
        ];

    let deleted = false;
    let cleanupFailed = false;
    const uniqueCandidates = [...new Map(candidates.map((candidate) => [candidate.objectKey ?? candidate.fileName, candidate])).values()];
    for (const candidate of uniqueCandidates) {
      try {
        await this.storage.adapter().deleteObject({ tenantId, assetType, directory, fileName: candidate.fileName, objectKey: candidate.objectKey });
        deleted = true;
      } catch (error) {
        if (error instanceof NotFoundException) continue;
        cleanupFailed = true;
        this.logger.warn(`Upload cleanup failed for ${candidate.objectKey ?? candidate.fileName}: ${error instanceof Error ? error.message : 'unknown error'}`);
      }
    }
    if (cleanupFailed) return;
    if (!deleted) throw new NotFoundException('Asset not found');
  }

  private supabaseVariantCandidates(objectKey: string) {
    const directory = objectKey.slice(0, objectKey.lastIndexOf('/') + 1);
    return ['thumb.webp', 'medium.webp', 'large.webp', 'original.jpg', 'original.png', 'original.webp'].map((fileName) => ({
      fileName,
      objectKey: `${directory}${fileName}`,
    }));
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

    if (!this.hasValidImageSignature(file.mimetype, file.buffer)) {
      throw new BadRequestException('File content does not match MIME type');
    }
  }

  private hasValidImageSignature(mimeType: string, buffer: Buffer) {
    if (mimeType === 'image/jpeg') {
      return (
        buffer.length > 4 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff &&
        buffer[buffer.length - 2] === 0xff &&
        buffer[buffer.length - 1] === 0xd9
      );
    }
    if (mimeType === 'image/png') {
      return (
        buffer.length > 24 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a &&
        buffer.includes(Buffer.from('IEND'))
      );
    }
    if (mimeType === 'image/webp') {
      if (buffer.length <= 12) return false;
      const declaredSize = buffer.readUInt32LE(4) + 8;
      return (
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP' &&
        declaredSize <= buffer.length
      );
    }
    return false;
  }

}
