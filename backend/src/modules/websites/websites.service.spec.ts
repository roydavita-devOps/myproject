import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ContentStatus, WebsiteStatus } from '@prisma/client';
import { WebsitesService } from './websites.service';

describe('WebsitesService', () => {
  const tenantId = 'tenant-1';
  const websiteId = 'website-1';

  function createPrismaMock() {
    return {
      website: {
        findFirst: jest.fn().mockResolvedValue({
          id: websiteId,
          tenantId,
          themeId: 'theme-1',
          status: WebsiteStatus.DRAFT,
          businessName: 'Original Business',
        }),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: websiteId, ...data })),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      theme: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn(),
      },
      gallery: {
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn().mockResolvedValue({
          id: 'gallery-1',
          tenantId,
          websiteId,
          imageUrl: '/api/v1/uploads/tenant-1/gallery/gallery.png',
          status: ContentStatus.ACTIVE,
        }),
        update: jest.fn().mockResolvedValue({ id: 'gallery-1', status: ContentStatus.ARCHIVED }),
      },
    };
  }

  function createUploadsMock() {
    return {
      deleteTenantAssetByUrl: jest.fn().mockResolvedValue({ deleted: true, reason: 'deleted' }),
    };
  }

  it('persists submitted website fields through Prisma', async () => {
    const prisma = createPrismaMock();
    const service = new WebsitesService(prisma as never, createUploadsMock() as never);

    await service.update(tenantId, websiteId, {
      businessName: 'Updated Business',
      tagline: 'Updated Tagline',
      description: 'Updated Description',
      address: 'Updated Address',
      phone: '+628123',
      whatsapp: '+628456',
      email: 'owner@example.com',
      mapsUrl: 'https://maps.example.com/updated',
      socialMedia: { instagram: '@updated' },
      openingHours: { monday: '08:00-17:00' },
    });

    expect(prisma.website.update).toHaveBeenCalledWith({
      where: { id: websiteId },
      data: {
        businessName: 'Updated Business',
        tagline: 'Updated Tagline',
        description: 'Updated Description',
        address: 'Updated Address',
        phone: '+628123',
        whatsapp: '+628456',
        email: 'owner@example.com',
        mapsUrl: 'https://maps.example.com/updated',
        socialMedia: { instagram: '@updated' },
        openingHours: { monday: '08:00-17:00' },
      },
    });
  });

  it('rejects empty website update payloads instead of returning a no-op success', async () => {
    const prisma = createPrismaMock();
    const service = new WebsitesService(prisma as never, createUploadsMock() as never);

    await expect(service.update(tenantId, websiteId, {})).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.website.update).not.toHaveBeenCalled();
  });

  it('persists submitted theme asset fields through Prisma', async () => {
    const prisma = createPrismaMock();
    const service = new WebsitesService(prisma as never, createUploadsMock() as never);

    await service.updateThemeAssets(tenantId, websiteId, {
      logoUrl: '/api/v1/uploads/tenant-1/logo/logo.png',
      heroImageUrl: '/api/v1/uploads/tenant-1/hero/hero.png',
    });

    expect(prisma.theme.updateMany).toHaveBeenCalledWith({
      where: { id: 'theme-1', tenantId },
      data: {
        logoUrl: '/api/v1/uploads/tenant-1/logo/logo.png',
        heroImageUrl: '/api/v1/uploads/tenant-1/hero/hero.png',
      },
    });
    expect(prisma.website.findFirst).toHaveBeenLastCalledWith({
      where: { id: websiteId, tenantId, status: { not: WebsiteStatus.ARCHIVED } },
      include: {
        tenant: { select: { slug: true } },
        template: true,
        theme: true,
        categories: { orderBy: { sortOrder: 'asc' } },
        menus: { where: { status: ContentStatus.ACTIVE }, orderBy: { sortOrder: 'asc' } },
        galleries: { where: { status: ContentStatus.ACTIVE }, orderBy: { sortOrder: 'asc' } },
        reviews: true,
      },
    });
  });

  it('rejects empty theme asset payloads instead of returning a no-op success', async () => {
    const prisma = createPrismaMock();
    const service = new WebsitesService(prisma as never, createUploadsMock() as never);

    await expect(service.updateThemeAssets(tenantId, websiteId, {})).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.theme.updateMany).not.toHaveBeenCalled();
  });

  it('clears a logo theme asset and deletes the owned upload', async () => {
    const prisma = createPrismaMock();
    prisma.website.findFirst.mockResolvedValue({
      id: websiteId,
      tenantId,
      themeId: 'theme-1',
      theme: { logoUrl: '/api/v1/uploads/tenant-1/logo/logo.png', heroImageUrl: null },
    });
    const uploads = createUploadsMock();
    const service = new WebsitesService(prisma as never, uploads as never);

    await service.deleteThemeAsset(tenantId, websiteId, 'logo');

    expect(uploads.deleteTenantAssetByUrl).toHaveBeenCalledWith(tenantId, '/api/v1/uploads/tenant-1/logo/logo.png', 'logo');
    expect(prisma.theme.updateMany).toHaveBeenCalledWith({
      where: { id: 'theme-1', tenantId },
      data: { logoUrl: null },
    });
  });

  it('clears a logo theme asset even when the uploaded file is already missing', async () => {
    const prisma = createPrismaMock();
    prisma.website.findFirst.mockResolvedValue({
      id: websiteId,
      tenantId,
      themeId: 'theme-1',
      theme: { logoUrl: '/api/v1/uploads/tenant-1/logo/missing.png', heroImageUrl: null },
    });
    const uploads = {
      deleteTenantAssetByUrl: jest.fn().mockRejectedValue(new NotFoundException('Asset not found')),
    };
    const service = new WebsitesService(prisma as never, uploads as never);

    await service.deleteThemeAsset(tenantId, websiteId, 'logo');

    expect(prisma.theme.updateMany).toHaveBeenCalledWith({
      where: { id: 'theme-1', tenantId },
      data: { logoUrl: null },
    });
  });

  it('archives a gallery item and deletes the owned upload', async () => {
    const prisma = createPrismaMock();
    const uploads = createUploadsMock();
    const service = new WebsitesService(prisma as never, uploads as never);

    await service.deleteGalleryItem(tenantId, websiteId, 'gallery-1');

    expect(prisma.gallery.findFirst).toHaveBeenCalledWith({
      where: { id: 'gallery-1', tenantId, websiteId, status: ContentStatus.ACTIVE },
    });
    expect(uploads.deleteTenantAssetByUrl).toHaveBeenCalledWith(tenantId, '/api/v1/uploads/tenant-1/gallery/gallery.png', 'gallery');
    expect(prisma.gallery.update).toHaveBeenCalledWith({
      where: { id: 'gallery-1' },
      data: { status: ContentStatus.ARCHIVED },
    });
  });

  it('archives a gallery item even when the uploaded file is already missing', async () => {
    const prisma = createPrismaMock();
    const uploads = {
      deleteTenantAssetByUrl: jest.fn().mockRejectedValue(new NotFoundException('Asset not found')),
    };
    const service = new WebsitesService(prisma as never, uploads as never);

    await service.deleteGalleryItem(tenantId, websiteId, 'gallery-1');

    expect(prisma.gallery.update).toHaveBeenCalledWith({
      where: { id: 'gallery-1' },
      data: { status: ContentStatus.ARCHIVED },
    });
  });
});
