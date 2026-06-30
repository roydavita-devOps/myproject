import { ConfigService } from '@nestjs/config';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';
import { MalwareScannerService } from './malware-scanner.service';
import { LocalUploadStorageAdapter } from './storage/local-upload-storage.adapter';
import { SupabaseUploadStorageAdapter } from './storage/supabase-upload-storage.adapter';
import { UploadStorageService } from './storage/upload-storage.service';
import { UploadsService } from './uploads.service';

const truncatedPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);

describe('UploadsService', () => {
  let storagePath: string;
  let service: UploadsService;
  let pngBuffer: Buffer;
  let jpegBuffer: Buffer;
  let webpBuffer: Buffer;

  beforeAll(async () => {
    pngBuffer = await sharp({ create: { width: 24, height: 24, channels: 4, background: '#2563eb' } }).png().toBuffer();
    jpegBuffer = await sharp({ create: { width: 24, height: 24, channels: 3, background: '#0f766e' } }).jpeg().toBuffer();
    webpBuffer = await sharp({ create: { width: 24, height: 24, channels: 4, background: '#f97316' } }).webp().toBuffer();
  });

  beforeEach(async () => {
    storagePath = await mkdtemp(join(tmpdir(), 'umkm-upload-test-'));
    const config = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'UPLOAD_STORAGE_PATH') return storagePath;
        if (key === 'MALWARE_SCAN_ENABLED') return 'false';
        return defaultValue;
      }),
    } as unknown as ConfigService;

    service = new UploadsService(
      new UploadStorageService(config, new LocalUploadStorageAdapter(config), new SupabaseUploadStorageAdapter(config)),
      new MalwareScannerService(config),
    );
  });

  afterEach(async () => {
    await rm(storagePath, { recursive: true, force: true });
  });

  it('processes a PNG upload to WebP variants with a tenant scoped URL', async () => {
    const result = await service.store('tenant-1', 'logo', {
      originalname: 'logo.png',
      mimetype: 'image/png',
      size: pngBuffer.length,
      buffer: pngBuffer,
    });

    expect(result).toMatchObject({
      tenantId: 'tenant-1',
      assetType: 'logo',
      mimeType: 'image/webp',
      url: expect.stringContaining('/api/v1/uploads/tenant-1/logo/'),
      originalUrl: expect.stringContaining('-original.png'),
      thumbnailUrl: expect.stringContaining('-thumb.webp'),
      mediumUrl: expect.stringContaining('-medium.webp'),
      largeUrl: expect.stringContaining('-large.webp'),
      scan: { status: 'skipped', provider: 'disabled' },
    });
    expect(result.url).toBe(result.mediumUrl);

    const stored = await service.readPublicFile('tenant-1', 'logo', result.fileName);
    expect(stored.contentType).toBe('image/webp');
  });

  it('processes JPG uploads to WebP', async () => {
    const result = await service.store('tenant-1', 'menu', {
      originalname: 'menu.jpg',
      mimetype: 'image/jpeg',
      size: jpegBuffer.length,
      buffer: jpegBuffer,
    });

    expect(result.mimeType).toBe('image/webp');
    expect(result.url).toBe(result.mediumUrl);
    expect(result.fileName).toContain('-medium.webp');
  });

  it('re-optimizes WEBP uploads to WebP variants', async () => {
    const result = await service.store('tenant-1', 'gallery', {
      originalname: 'gallery.webp',
      mimetype: 'image/webp',
      size: webpBuffer.length,
      buffer: webpBuffer,
    });

    expect(result.mimeType).toBe('image/webp');
    expect(result.url).toBe(result.largeUrl);
    expect(result.thumbnailUrl).toContain('-thumb.webp');
  });

  it('deletes a tenant scoped uploaded asset from storage', async () => {
    const result = await service.store('tenant-1', 'logo', {
      originalname: 'logo.png',
      mimetype: 'image/png',
      size: pngBuffer.length,
      buffer: pngBuffer,
    });

    await expect(service.deleteTenantAssetByUrl('tenant-1', result.url, 'logo')).resolves.toMatchObject({
      deleted: true,
      reason: 'deleted',
    });
    await expect(service.readPublicFile('tenant-1', 'logo', result.fileName)).rejects.toThrow('Asset not found');
    await expect(service.readPublicFile('tenant-1', 'logo', result.originalUrl.split('/').pop() ?? '')).rejects.toThrow('Asset not found');
  });

  it('rejects deletion when the asset URL belongs to another tenant', async () => {
    const result = await service.store('tenant-1', 'logo', {
      originalname: 'logo.png',
      mimetype: 'image/png',
      size: pngBuffer.length,
      buffer: pngBuffer,
    });

    await expect(service.deleteTenantAssetByUrl('tenant-2', result.url, 'logo')).rejects.toThrow('Asset does not belong to tenant');
  });

  it('deletes all Supabase variants parsed from a public object URL', async () => {
    const deleteObject = jest.fn().mockResolvedValue(undefined);
    const storage = {
      parseUrl: jest.fn().mockReturnValue({
        tenantId: 'tenant-1',
        assetType: 'gallery',
        fileName: 'large.webp',
        objectKey: 'tenants/tenant-1/websites/website-1/gallery/asset-1/large.webp',
      }),
      adapter: jest.fn().mockReturnValue({ deleteObject }),
    } as unknown as UploadStorageService;
    const supabaseDeleteService = new UploadsService(storage, { scan: jest.fn() } as unknown as MalwareScannerService);

    await expect(supabaseDeleteService.deleteTenantAssetByUrl('tenant-1', 'https://cdn.example.com/large.webp', 'gallery')).resolves.toMatchObject({
      deleted: true,
      reason: 'deleted',
    });

    expect(deleteObject).toHaveBeenCalledTimes(6);
    expect(deleteObject).toHaveBeenCalledWith(expect.objectContaining({
      objectKey: 'tenants/tenant-1/websites/website-1/gallery/asset-1/thumb.webp',
    }));
    expect(deleteObject).toHaveBeenCalledWith(expect.objectContaining({
      objectKey: 'tenants/tenant-1/websites/website-1/gallery/asset-1/original.jpg',
    }));
  });

  it('rejects content that does not match the declared MIME type', async () => {
    await expect(
      service.store('tenant-1', 'gallery', {
        originalname: 'fake.png',
        mimetype: 'image/png',
        size: 5,
        buffer: Buffer.from('hello'),
      }),
    ).rejects.toThrow('File content does not match MIME type');
  });

  it('rejects unsupported image formats', async () => {
    await expect(
      service.store('tenant-1', 'gallery', {
        originalname: 'image.gif',
        mimetype: 'image/gif',
        size: 10,
        buffer: Buffer.from('GIF89a----'),
      }),
    ).rejects.toThrow('Unsupported file type');
  });

  it('rejects truncated images that cannot be rendered by browsers', async () => {
    await expect(
      service.store('tenant-1', 'gallery', {
        originalname: 'truncated.png',
        mimetype: 'image/png',
        size: truncatedPngBuffer.length,
        buffer: truncatedPngBuffer,
      }),
    ).rejects.toThrow('File content does not match MIME type');
  });

  it('rejects files larger than the asset policy allows', async () => {
    await expect(
      service.store('tenant-1', 'logo', {
        originalname: 'logo.png',
        mimetype: 'image/png',
        size: 1024 * 1024 + 1,
        buffer: Buffer.concat([pngBuffer, Buffer.alloc(1024 * 1024 + 1)]),
      }),
    ).rejects.toThrow('File exceeds');
  });
});
