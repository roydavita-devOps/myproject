import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
export class SupabaseUploadStorageAdapter implements UploadStorageAdapter {
  readonly driver = 'supabase';
  private client?: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    if (!input.buffer?.length) throw new BadRequestException('Cannot upload empty asset');
    this.validatePathSegment(input.tenantId, 'tenant id');
    this.validatePathSegment(input.assetType, 'asset type');
    this.validatePathSegment(input.fileName, 'file name');

    const objectKey = this.objectKey(input);
    const { error } = await this.supabase()
      .storage
      .from(this.bucket())
      .upload(objectKey, input.buffer, {
        contentType: input.contentType,
        upsert: false,
        cacheControl: '31536000',
      });

    if (error) throw new ServiceUnavailableException(`Supabase upload failed: ${error.message}`);

    return {
      fileName: input.fileName,
      objectKey,
      url: this.publicUrl(objectKey),
    };
  }

  async readObject(_input: ReadObjectInput): Promise<ReadObject> {
    throw new ServiceUnavailableException('Supabase assets are served from public object storage URLs');
  }

  async deleteObject(input: DeleteObjectInput): Promise<void> {
    const objectKey = input.objectKey;
    if (!objectKey) throw new BadRequestException('Supabase object key is required for deletion');
    this.validateObjectKey(objectKey);

    const { error } = await this.supabase().storage.from(this.bucket()).remove([objectKey]);
    if (error) throw new ServiceUnavailableException(`Supabase delete failed: ${error.message}`);
  }

  parseUrl(url: string): ParsedStoredObject | null {
    const objectKey = this.extractObjectKey(url);
    if (!objectKey) return null;

    const match = objectKey.match(
      /^tenants\/([^/]+)\/websites\/([^/]+)\/([^/]+)\/([^/]+)\/(original\.(?:jpg|png|webp)|thumb\.webp|medium\.webp|large\.webp)$/i,
    );
    if (!match) return null;

    const [, tenantId, , assetType, , fileName] = match;
    return { tenantId, assetType, fileName, objectKey };
  }

  async health() {
    return {
      driver: this.driver,
      bucket: this.bucket(),
      publicBaseUrl: this.config.get<string>('SUPABASE_STORAGE_PUBLIC_BASE_URL') || 'supabase-sdk-public-url',
    };
  }

  private objectKey(input: PutObjectInput) {
    const websiteId = input.websiteId ? this.safeSegment(input.websiteId, 'website id') : 'unassigned';
    const assetId = input.assetId ? this.safeSegment(input.assetId, 'asset id') : this.assetIdFromFileName(input.fileName);
    const objectName = this.objectName(input.fileName, assetId);
    return `tenants/${input.tenantId}/websites/${websiteId}/${input.assetType}/${assetId}/${objectName}`;
  }

  private objectName(fileName: string, assetId: string) {
    const escapedAssetId = assetId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const originalMatch = fileName.match(new RegExp(`^${escapedAssetId}-original\\.(jpg|png|webp)$`, 'i'));
    if (originalMatch) return `original.${originalMatch[1].toLowerCase()}`;
    if (new RegExp(`^${escapedAssetId}-thumb\\.webp$`, 'i').test(fileName)) return 'thumb.webp';
    if (new RegExp(`^${escapedAssetId}-medium\\.webp$`, 'i').test(fileName)) return 'medium.webp';
    if (new RegExp(`^${escapedAssetId}-large\\.webp$`, 'i').test(fileName)) return 'large.webp';
    return fileName;
  }

  private assetIdFromFileName(fileName: string) {
    const match = fileName.match(/^(.+)-(?:original|thumb|medium|large)\.(?:jpg|png|webp)$/i);
    return this.safeSegment(match?.[1] ?? fileName.replace(/\.[^.]+$/, ''), 'asset id');
  }

  private publicUrl(objectKey: string) {
    const publicBaseUrl = this.config.get<string>('SUPABASE_STORAGE_PUBLIC_BASE_URL', '').replace(/\/$/, '');
    if (publicBaseUrl) return `${publicBaseUrl}/${objectKey}`;

    const { data } = this.supabase().storage.from(this.bucket()).getPublicUrl(objectKey);
    return data.publicUrl;
  }

  private extractObjectKey(url: string) {
    const publicBaseUrl = this.config.get<string>('SUPABASE_STORAGE_PUBLIC_BASE_URL', '').replace(/\/$/, '');
    if (publicBaseUrl && url.startsWith(`${publicBaseUrl}/`)) {
      return decodeURIComponent(url.slice(publicBaseUrl.length + 1));
    }

    try {
      const path = new URL(url).pathname;
      const marker = `/storage/v1/object/public/${this.bucket()}/`;
      const index = path.indexOf(marker);
      if (index === -1) return null;
      return decodeURIComponent(path.slice(index + marker.length));
    } catch {
      return null;
    }
  }

  private supabase() {
    if (!this.client) {
      const url = this.requiredConfig('SUPABASE_URL');
      const serviceRoleKey = this.requiredConfig('SUPABASE_SERVICE_ROLE_KEY');
      this.client = createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return this.client;
  }

  private bucket() {
    return this.config.get<string>('SUPABASE_STORAGE_BUCKET', 'tenant-assets');
  }

  private requiredConfig(name: string) {
    const value = this.config.get<string>(name, '').trim();
    if (!value) throw new ServiceUnavailableException(`${name} is required when STORAGE_DRIVER=supabase`);
    return value;
  }

  private validatePathSegment(value: string, label: string) {
    this.safeSegment(value, label);
  }

  private safeSegment(value: string, label: string) {
    if (!/^[a-zA-Z0-9._-]+$/.test(value) || value.includes('..')) {
      throw new BadRequestException(`Invalid ${label}`);
    }
    return value;
  }

  private validateObjectKey(objectKey: string) {
    if (!/^tenants\/[a-zA-Z0-9._-]+\/websites\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\//.test(objectKey)) {
      throw new BadRequestException('Invalid Supabase object key');
    }
    if (objectKey.includes('..') || objectKey.includes('//')) throw new BadRequestException('Invalid Supabase object key');
  }
}
