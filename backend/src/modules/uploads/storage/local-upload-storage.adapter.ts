import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { constants } from 'fs';
import { access, mkdir, stat, unlink, writeFile } from 'fs/promises';
import { basename, extname, join, resolve } from 'path';
import {
  DeleteObjectInput,
  ParsedStoredObject,
  PutObjectInput,
  ReadObjectInput,
  ReadObject,
  StoredObject,
  UploadStorageAdapter,
} from './upload-storage-adapter';

@Injectable()
export class LocalUploadStorageAdapter implements UploadStorageAdapter {
  readonly driver = 'local';

  constructor(private readonly config: ConfigService) {}

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    this.validatePathSegment(input.tenantId, 'tenant id');
    this.validatePathSegment(input.fileName, 'file name');

    const directory = join(this.storageRoot(), input.tenantId, input.directory);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, input.fileName), input.buffer, { flag: 'wx' });

    return {
      fileName: input.fileName,
      url: this.publicUrl(input.tenantId, input.assetType, input.fileName),
    };
  }

  async readObject(input: ReadObjectInput): Promise<ReadObject> {
    this.validatePathSegment(input.tenantId, 'tenant id');
    this.validatePathSegment(input.fileName, 'file name');

    const root = resolve(this.storageRoot(), input.tenantId, input.directory);
    const filePath = resolve(root, input.fileName);
    if (!filePath.startsWith(root)) throw new NotFoundException('Asset not found');

    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) throw new NotFoundException('Asset not found');
    } catch {
      throw new NotFoundException('Asset not found');
    }

    return {
      stream: createReadStream(filePath),
      contentType: this.mimeTypeForExtension(extname(input.fileName).toLowerCase()),
    };
  }

  async deleteObject(input: DeleteObjectInput): Promise<void> {
    this.validatePathSegment(input.tenantId, 'tenant id');
    this.validatePathSegment(input.fileName, 'file name');

    const root = resolve(this.storageRoot(), input.tenantId, input.directory);
    const filePath = resolve(root, input.fileName);
    if (!filePath.startsWith(root)) throw new NotFoundException('Asset not found');

    try {
      await unlink(filePath);
    } catch {
      throw new NotFoundException('Asset not found');
    }
  }

  async health() {
    const path = this.storageRoot();
    await mkdir(path, { recursive: true });
    await access(path, constants.R_OK | constants.W_OK);
    return { driver: this.driver, path };
  }

  parseUrl(url: string): ParsedStoredObject | null {
    const path = this.extractPath(url);
    const match = path.match(/^\/api\/v1\/uploads\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (!match) return null;

    const [, tenantId, assetType, fileName] = match;
    return { tenantId, assetType, fileName };
  }

  private publicUrl(tenantId: string, assetType: string, fileName: string) {
    const baseUrl = this.config.get<string>('UPLOAD_PUBLIC_BASE_URL', '');
    const path = `/api/v1/uploads/${tenantId}/${assetType}/${fileName}`;
    return baseUrl ? `${baseUrl.replace(/\/$/, '')}${path}` : path;
  }

  private storageRoot() {
    return resolve(this.config.get<string>('UPLOAD_STORAGE_PATH', '/app/uploads'));
  }

  private validatePathSegment(value: string, label: string) {
    if (value !== basename(value) || value.includes('..') || !/^[a-zA-Z0-9._-]+$/.test(value)) {
      throw new BadRequestException(`Invalid ${label}`);
    }
  }

  private extractPath(url: string) {
    if (url.startsWith('/')) return url;
    try {
      return new URL(url).pathname;
    } catch {
      return '';
    }
  }

  private mimeTypeForExtension(extension: string) {
    if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
    if (extension === '.png') return 'image/png';
    if (extension === '.webp') return 'image/webp';
    return 'application/octet-stream';
  }
}
