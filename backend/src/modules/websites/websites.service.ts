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
    const heroMedia = dto.heroMedia !== undefined ? validateHeroMedia(dto.heroMedia) : undefined;
    const data = {
      ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
      ...(dto.heroImageUrl !== undefined ? { heroImageUrl: dto.heroImageUrl } : {}),
      ...(dto.heroMedia !== undefined ? { heroMedia } : {}),
      ...(dto.primaryColor !== undefined ? { primaryColor: dto.primaryColor } : {}),
      ...(dto.secondaryColor !== undefined ? { secondaryColor: dto.secondaryColor } : {}),
      ...(dto.accentColor !== undefined ? { accentColor: dto.accentColor } : {}),
      ...(dto.premiumColorPreset !== undefined ? { typography: themeTypographyWithPreset(website.theme?.typography, dto.premiumColorPreset) } : {}),
    };
    if (Object.keys(data).length === 0) throw new BadRequestException('At least one theme asset is required');

    if (dto.heroMedia !== undefined && website.theme) {
      const protectedUrls = new Set([website.theme.heroImageUrl, dto.heroImageUrl].filter((url): url is string => typeof url === 'string' && url.length > 0));
      const previousUrls = extractHeroMediaUrls(website.theme.heroMedia);
      const nextUrls = extractHeroMediaUrls(heroMedia);
      const removedUrls = previousUrls.filter((url) => !nextUrls.includes(url) && !protectedUrls.has(url));
      for (const url of removedUrls) {
        await this.deleteUploadIfPresent(tenantId, url, 'hero');
      }
    }

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
  if (!openingHours) return;
  const mode = openingHours.mode;
  if (mode !== 'daily' && mode !== 'weekdays' && mode !== 'weekends' && mode !== 'custom') return;

  const openTime = openingHours.openTime;
  const closeTime = openingHours.closeTime;
  if (typeof openTime !== 'string' || typeof closeTime !== 'string') {
    throw new BadRequestException('Opening hours require open and close time');
  }
  if (!/^\d{2}:\d{2}$/.test(openTime) || !/^\d{2}:\d{2}$/.test(closeTime) || closeTime <= openTime) {
    throw new BadRequestException('Close time must be after open time');
  }
  if (mode === 'custom') {
    const days = openingHours.days;
    const allowedDays = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
    if (!Array.isArray(days) || days.length === 0 || !days.every((day) => typeof day === 'string' && allowedDays.has(day))) {
      throw new BadRequestException('Select at least one valid opening day');
    }
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

const assetUrlPattern = /^(\/api\/v1\/uploads\/|https?:\/\/).+/;
const allowedHeroMediaTypes = new Set(['image', 'slideshow']);

function validateHeroMedia(heroMedia: unknown): Prisma.InputJsonValue {
  if (!heroMedia || typeof heroMedia !== 'object' || Array.isArray(heroMedia)) {
    throw new BadRequestException('Hero media must be an object');
  }

  const candidate = heroMedia as Record<string, unknown>;
  if (!allowedHeroMediaTypes.has(String(candidate.heroMediaType))) {
    throw new BadRequestException('Hero media type must be image or slideshow');
  }

  const rawImages = candidate.heroImages;
  if (!Array.isArray(rawImages)) {
    throw new BadRequestException('Hero media images must be an array');
  }
  if (rawImages.length > 5) {
    throw new BadRequestException('Hero slideshow supports up to 5 images');
  }

  const heroImages = rawImages.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new BadRequestException('Hero media image must be an object');
    }
    const image = item as Record<string, unknown>;
    const url = requiredAssetUrl(image.url, 'Hero media image URL is invalid');
    return stripUndefined({
      url,
      thumbnailUrl: optionalAssetUrl(image.thumbnailUrl, 'Hero media thumbnail URL is invalid'),
      mediumUrl: optionalAssetUrl(image.mediumUrl, 'Hero media medium URL is invalid'),
      largeUrl: optionalAssetUrl(image.largeUrl, 'Hero media large URL is invalid'),
      alt: typeof image.alt === 'string' ? image.alt.slice(0, 160) : undefined,
    });
  });

  return {
    heroMediaType: String(candidate.heroMediaType),
    heroImages,
  } as Prisma.InputJsonValue;
}

function requiredAssetUrl(value: unknown, message: string) {
  if (typeof value !== 'string' || !assetUrlPattern.test(value)) throw new BadRequestException(message);
  return value;
}

function optionalAssetUrl(value: unknown, message: string) {
  if (value === undefined || value === null || value === '') return undefined;
  return requiredAssetUrl(value, message);
}

function extractHeroMediaUrls(heroMedia: unknown) {
  if (!heroMedia || typeof heroMedia !== 'object' || Array.isArray(heroMedia)) return [];
  const images = (heroMedia as Record<string, unknown>).heroImages;
  if (!Array.isArray(images)) return [];
  const urls = new Set<string>();
  for (const item of images) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const image = item as Record<string, unknown>;
    for (const key of ['url', 'thumbnailUrl', 'mediumUrl', 'largeUrl']) {
      const url = image[key];
      if (typeof url === 'string' && assetUrlPattern.test(url)) urls.add(url);
    }
  }
  return [...urls];
}
