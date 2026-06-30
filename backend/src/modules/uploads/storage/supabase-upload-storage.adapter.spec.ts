import { ConfigService } from '@nestjs/config';
import { LocalUploadStorageAdapter } from './local-upload-storage.adapter';
import { SupabaseUploadStorageAdapter } from './supabase-upload-storage.adapter';
import { UploadStorageService } from './upload-storage.service';

const uploadMock = jest.fn();
const removeMock = jest.fn();
const getPublicUrlMock = jest.fn();
const fromMock = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: fromMock,
    },
  })),
}));

function config(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string, defaultValue?: string) => values[key] ?? defaultValue),
  } as unknown as ConfigService;
}

describe('SupabaseUploadStorageAdapter', () => {
  beforeEach(() => {
    uploadMock.mockReset().mockResolvedValue({ error: null });
    removeMock.mockReset().mockResolvedValue({ error: null });
    getPublicUrlMock.mockReset().mockImplementation((key: string) => ({
      data: { publicUrl: `https://project.supabase.co/storage/v1/object/public/tenant-assets/${key}` },
    }));
    fromMock.mockReset().mockReturnValue({
      upload: uploadMock,
      remove: removeMock,
      getPublicUrl: getPublicUrlMock,
    });
  });

  it('uploads processed variants to tenant and website scoped Supabase paths', async () => {
    const adapter = new SupabaseUploadStorageAdapter(config({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      SUPABASE_STORAGE_BUCKET: 'tenant-assets',
    }));

    const stored = await adapter.putObject({
      tenantId: 'tenant-1',
      websiteId: 'website-1',
      assetType: 'menu',
      assetId: 'asset-1',
      directory: 'menus',
      fileName: 'asset-1-medium.webp',
      contentType: 'image/webp',
      buffer: Buffer.from('webp'),
    });

    expect(stored).toMatchObject({
      fileName: 'asset-1-medium.webp',
      objectKey: 'tenants/tenant-1/websites/website-1/menu/asset-1/medium.webp',
      url: 'https://project.supabase.co/storage/v1/object/public/tenant-assets/tenants/tenant-1/websites/website-1/menu/asset-1/medium.webp',
    });
    expect(fromMock).toHaveBeenCalledWith('tenant-assets');
    expect(uploadMock).toHaveBeenCalledWith(
      'tenants/tenant-1/websites/website-1/menu/asset-1/medium.webp',
      Buffer.from('webp'),
      expect.objectContaining({ contentType: 'image/webp', upsert: false }),
    );
  });

  it('uses configured public base URL when provided', async () => {
    const adapter = new SupabaseUploadStorageAdapter(config({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      SUPABASE_STORAGE_BUCKET: 'tenant-assets',
      SUPABASE_STORAGE_PUBLIC_BASE_URL: 'https://cdn.example.com/tenant-assets',
    }));

    const stored = await adapter.putObject({
      tenantId: 'tenant-1',
      websiteId: 'website-1',
      assetType: 'hero',
      assetId: 'asset-1',
      directory: 'heroes',
      fileName: 'asset-1-large.webp',
      contentType: 'image/webp',
      buffer: Buffer.from('webp'),
    });

    expect(stored.url).toBe('https://cdn.example.com/tenant-assets/tenants/tenant-1/websites/website-1/hero/asset-1/large.webp');
  });

  it('parses public Supabase URLs for delete operations', () => {
    const adapter = new SupabaseUploadStorageAdapter(config({ SUPABASE_STORAGE_BUCKET: 'tenant-assets' }));

    expect(adapter.parseUrl('https://project.supabase.co/storage/v1/object/public/tenant-assets/tenants/tenant-1/websites/website-1/gallery/asset-1/large.webp')).toEqual({
      tenantId: 'tenant-1',
      assetType: 'gallery',
      fileName: 'large.webp',
      objectKey: 'tenants/tenant-1/websites/website-1/gallery/asset-1/large.webp',
    });
  });

  it('deletes Supabase objects by object key', async () => {
    const adapter = new SupabaseUploadStorageAdapter(config({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      SUPABASE_STORAGE_BUCKET: 'tenant-assets',
    }));

    await adapter.deleteObject({
      tenantId: 'tenant-1',
      assetType: 'menu',
      directory: 'menus',
      fileName: 'medium.webp',
      objectKey: 'tenants/tenant-1/websites/website-1/menu/asset-1/medium.webp',
    });

    expect(removeMock).toHaveBeenCalledWith(['tenants/tenant-1/websites/website-1/menu/asset-1/medium.webp']);
  });
});

describe('UploadStorageService driver selection', () => {
  it('uses local adapter when STORAGE_DRIVER=local', () => {
    const cfg = config({ STORAGE_DRIVER: 'local' });
    const local = new LocalUploadStorageAdapter(cfg);
    const supabase = new SupabaseUploadStorageAdapter(cfg);

    expect(new UploadStorageService(cfg, local, supabase).adapter()).toBe(local);
  });

  it('uses Supabase adapter when STORAGE_DRIVER=supabase', () => {
    const cfg = config({ STORAGE_DRIVER: 'supabase' });
    const local = new LocalUploadStorageAdapter(cfg);
    const supabase = new SupabaseUploadStorageAdapter(cfg);

    expect(new UploadStorageService(cfg, local, supabase).adapter()).toBe(supabase);
  });
});
