import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WebsiteStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';

@Injectable()
export class WebsitesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.website.findMany({
      where: { tenantId, status: { not: WebsiteStatus.ARCHIVED } },
      include: { template: true, theme: true },
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
      include: { template: true, theme: true, categories: true, menus: true, galleries: true, reviews: true },
    });
    if (!website) throw new NotFoundException('Website not found');
    return website;
  }

  async update(tenantId: string, id: string, dto: UpdateWebsiteDto) {
    await this.findOne(tenantId, id);
    return this.prisma.website.update({
      where: { id },
      data: {
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
      },
    });
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
}
