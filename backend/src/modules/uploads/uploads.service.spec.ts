import { ConfigService } from '@nestjs/config';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { MalwareScannerService } from './malware-scanner.service';
import { UploadsService } from './uploads.service';

const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);

describe('UploadsService', () => {
  let storagePath: string;
  let service: UploadsService;

  beforeEach(async () => {
    storagePath = await mkdtemp(join(tmpdir(), 'umkm-upload-test-'));
    const config = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'UPLOAD_STORAGE_PATH') return storagePath;
        if (key === 'MALWARE_SCAN_ENABLED') return 'false';
        return defaultValue;
      }),
    } as unknown as ConfigService;

    service = new UploadsService(config, new MalwareScannerService(config));
  });

  afterEach(async () => {
    await rm(storagePath, { recursive: true, force: true });
  });

  it('stores a valid image with a tenant scoped URL', async () => {
    const result = await service.store('tenant-1', 'logo', {
      originalname: 'logo.png',
      mimetype: 'image/png',
      size: pngBuffer.length,
      buffer: pngBuffer,
    });

    expect(result).toMatchObject({
      tenantId: 'tenant-1',
      assetType: 'logo',
      mimeType: 'image/png',
      url: expect.stringContaining('/api/v1/uploads/tenant-1/logo/'),
      scan: { status: 'skipped', provider: 'disabled' },
    });
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
