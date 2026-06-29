import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DomainStatus, DomainType, SubscriptionPlan, SubscriptionStatus, TenantStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tenant.findMany({
      where: { status: { not: TenantStatus.DELETED } },
      include: { subscriptions: true, domains: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateTenantDto) {
    const exists = await this.prisma.tenant.findUnique({ where: { slug: dto.slug } });
    if (exists) throw new BadRequestException('Tenant slug is already used');

    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        status: TenantStatus.TRIAL,
        subscriptions: {
          create: { plan: SubscriptionPlan.FREE, status: SubscriptionStatus.TRIALING, monthlyPrice: 0 },
        },
        domains: {
          create: { domain: dto.slug, type: DomainType.SUBDOMAIN, status: DomainStatus.PENDING },
        },
      },
      include: { subscriptions: true, domains: true },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { subscriptions: true, domains: true, websites: true },
    });
    if (!tenant || tenant.status === TenantStatus.DELETED) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    await this.assertSlugAvailable(id, dto.slug);
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async updateOwnTenant(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    const data = {
      ...dto,
      slug: dto.slug ? dto.slug.toLowerCase() : undefined,
    };
    await this.assertSlugAvailable(id, data.slug);

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.update({ where: { id }, data });
      if (data.slug) {
        await tx.domain.updateMany({
          where: { tenantId: id, type: DomainType.SUBDOMAIN },
          data: { domain: data.slug, status: DomainStatus.PENDING },
        });
      }
      return tenant;
    });
  }

  async suspend(id: string) {
    await this.findOne(id);
    await this.prisma.refreshToken.updateMany({
      where: { user: { tenantId: id }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return this.prisma.tenant.update({ where: { id }, data: { status: TenantStatus.SUSPENDED } });
  }

  async activate(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: { status: TenantStatus.ACTIVE } });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    await this.prisma.refreshToken.updateMany({
      where: { user: { tenantId: id }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return this.prisma.tenant.update({
      where: { id },
      data: { status: TenantStatus.DELETED, deletedAt: new Date() },
    });
  }

  private async assertSlugAvailable(currentTenantId: string, slug?: string) {
    if (!slug) return;
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing && existing.id !== currentTenantId) throw new BadRequestException('Tenant slug is already used');
  }
}
