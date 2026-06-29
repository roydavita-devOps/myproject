import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma, WebsiteStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TemplatesService } from '../templates/templates.service';
import { UploadsService } from '../uploads/uploads.service';
import { AddGalleryItemDto } from './dto/add-gallery-item.dto';
import { AssignTemplateDto } from './dto/assign-template.dto';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateThemeAssetsDto } from './dto/update-theme-assets.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';

@Injectable()
export class WebsitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
    private readonly templates: TemplatesService,
  ) {}

  findAll(tenantId: string) {
    return this.prisma.website.findMany({
      where: { tenantId, status: { not: WebsiteStatus.ARCHIVED } },
      include: {
        tenant: { select: { slug: true } },
        template: true,
        theme: true,
        menus: { where: { status: ContentStatus.ACTIVE }, orderBy: { sortOrder: 'asc' } },
        galleries: { where: { status: ContentStatus.ACTIVE }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(tenantId: string, dto: CreateWebsiteDto) {
    return this.prisma.website.create({
      data: {
        tenantId,
        templateId: dto.templateId,
        themeId: dto.themeId,
        businessName: dto.businessName,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const website = await this.prisma.website.findFirst({
      where: { id, tenantId, status: { not: WebsiteStatus.ARCHIVED } },
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
    if (!website) throw new NotFoundException('Website not found');
    return website;
  }

  async update(tenantId: string, id: string, dto: UpdateWebsiteDto) {
    await this.findOne(tenantId, id);
    validateOpeningHours(dto.openingHours);
    const data = stripUndefined({
      businessName: dto.businessName,
      tagline: dto.tagline,
      description: dto.description,
      address: dto.address,
      phone: dto.phone,
      whatsapp: dto.whatsapp,
      email: dto.email,
      socialMedia: dto.socialMedia as Prisma.InputJsonValue,
      mapsUrl: dto.mapsUrl,
      openingHours: dto.openingHours as Prisma.InputJsonValue,
    });
    if (Object.keys(data).length === 0) throw new BadRequestException('At least one website field is required');

    return this.prisma.website.update({
      where: { id },
      data,
    });
  }

  async assignTemplate(tenantId: string, id: string, dto: AssignTemplateDto) {
    await this.findOne(tenantId, id);
    const template = await this.templates.findOrCreateDatabaseTemplate(dto.templateKey);

    await this.prisma.website.update({
      where: { id },
      data: { templateId: template.id },
    });

    return this.findOne(tenantId, id);
  }

  async updateThemeAssets(tenantId: string, id: string, dto: UpdateThemeAssetsDto) {
    const website = await this.findOne(tenantId, id);
    const data = {
      ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
      ...(dto.heroImageUrl !== undefined ? { heroImageUrl: dto.heroImageUrl } : {}),
      ...(dto.primaryColor !== undefined ? { primaryColor: dto.primaryColor } : {}),
      ...(dto.secondaryColor !== undefined ? { secondaryColor: dto.secondaryColor } : {}),
      ...(dto.accentColor !== undefined ? { accentColor: dto.accentColor } : {}),
      ...(dto.premiumColorPreset !== undefined ? { typography: themeTypographyWithPreset(website.theme?.typography, dto.premiumColorPreset) } : {}),
    };
    if (Object.keys(data).length === 0) throw new BadRequestException('At least one theme asset is required');

    if (website.themeId) {
      await this.prisma.theme.updateMany({
        where: { id: website.themeId, tenantId },
        data,
      });
    } else {
      const theme = await this.prisma.theme.create({
        data: {
          tenantId,
          name: 'Default Theme',
          primaryColor: '#0f766e',
          secondaryColor: '#f59e0b',
          accentColor: '#2563eb',
          typography: dto.premiumColorPreset ? themeTypographyWithPreset(undefined, dto.premiumColorPreset) : { heading: 'Inter', body: 'Inter' },
          ...data,
        },
      });
      await this.prisma.website.update({ where: { id }, data: { themeId: theme.id } });
    }

    return this.findOne(tenantId, id);
  }

  async deleteThemeAsset(tenantId: string, id: string, assetType: 'logo' | 'hero') {
    const website = await this.findOne(tenantId, id);
    if (!website.themeId || !website.theme) throw new NotFoundException('Theme asset not found');

    const field = assetType === 'logo' ? 'logoUrl' : 'heroImageUrl';
    const url = website.theme[field];
    if (!url) throw new NotFoundException('Theme asset not found');

    await this.deleteUploadIfPresent(tenantId, url, assetType);
    await this.prisma.theme.updateMany({
      where: { id: website.themeId, tenantId },
      data: { [field]: null },
    });

    return this.findOne(tenantId, id);
  }

  async addGalleryItem(tenantId: string, id: string, dto: AddGalleryItemDto) {
    await this.findOne(tenantId, id);
    const count = await this.prisma.gallery.count({ where: { tenantId, websiteId: id } });
    await this.prisma.gallery.create({
      data: {
        tenantId,
        websiteId: id,
        imageUrl: dto.imageUrl,
        category: dto.category,
        altText: dto.altText,
        sortOrder: count + 1,
      },
    });

    return this.findOne(tenantId, id);
  }

  async deleteGalleryItem(tenantId: string, id: string, galleryId: string) {
    await this.findOne(tenantId, id);
    const gallery = await this.prisma.gallery.findFirst({
      where: { id: galleryId, tenantId, websiteId: id, status: ContentStatus.ACTIVE },
    });
    if (!gallery) throw new NotFoundException('Gallery image not found');

    await this.deleteUploadIfPresent(tenantId, gallery.imageUrl, 'gallery');
    await this.prisma.gallery.update({
      where: { id: galleryId },
      data: { status: ContentStatus.ARCHIVED },
    });

    return this.findOne(tenantId, id);
  }

  async publish(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.website.update({
      where: { id },
      data: { status: WebsiteStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async unpublish(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.website.update({
      where: { id },
      data: { status: WebsiteStatus.UNPUBLISHED },
    });
  }

  preview(tenantId: string, id: string) {
    return this.findOne(tenantId, id);
  }

  async archive(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.website.update({
      where: { id },
      data: { status: WebsiteStatus.ARCHIVED },
    });
  }

  async publicSite(tenantId: string) {
    const website = await this.prisma.website.findFirst({
      where: { tenantId, status: WebsiteStatus.PUBLISHED },
      include: {
        tenant: { select: { slug: true } },
        template: true,
        theme: true,
        categories: { orderBy: { sortOrder: 'asc' } },
        menus: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
        galleries: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
        reviews: { where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!website) throw new NotFoundException('Published site not found');
    return website;
  }

  async publicSiteBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Published site not found');
    return this.publicSite(tenant.id);
  }

  private async deleteUploadIfPresent(tenantId: string, url: string, assetType: 'logo' | 'hero' | 'gallery') {
    try {
      await this.uploads.deleteTenantAssetByUrl(tenantId, url, assetType);
    } catch (error) {
      if (error instanceof NotFoundException) return;
      throw error;
    }
  }
}

function stripUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function validateOpeningHours(openingHours?: Record<string, unknown>) {
  if (!openingHours || openingHours.mode !== 'daily') return;

  const openTime = openingHours.openTime;
  const closeTime = openingHours.closeTime;
  if (typeof openTime !== 'string' || typeof closeTime !== 'string') {
    throw new BadRequestException('Opening hours require open and close time');
  }
  if (!/^\d{2}:\d{2}$/.test(openTime) || !/^\d{2}:\d{2}$/.test(closeTime) || closeTime <= openTime) {
    throw new BadRequestException('Close time must be after open time');
  }
}

function themeTypographyWithPreset(current: unknown, premiumColorPreset: string) {
  const base = current && typeof current === 'object' && !Array.isArray(current)
    ? current as Record<string, unknown>
    : { heading: 'Inter', body: 'Inter' };

  return {
    ...base,
    heading: typeof base.heading === 'string' ? base.heading : 'Inter',
    body: typeof base.body === 'string' ? base.body : 'Inter',
    premiumColorPreset,
  } as Prisma.InputJsonValue;
}
