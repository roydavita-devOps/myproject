import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  findCategories(tenantId: string, websiteId?: string) {
    return this.prisma.menuCategory.findMany({
      where: { tenantId, ...(websiteId ? { websiteId } : {}) },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createCategory(tenantId: string, dto: CreateMenuCategoryDto) {
    await this.assertWebsiteOwnership(tenantId, dto.websiteId);
    return this.prisma.menuCategory.create({
      data: {
        tenantId,
        websiteId: dto.websiteId,
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateCategory(tenantId: string, id: string, dto: UpdateMenuCategoryDto) {
    await this.assertCategoryOwnership(tenantId, id);
    return this.prisma.menuCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(tenantId: string, id: string) {
    await this.assertCategoryOwnership(tenantId, id);
    await this.prisma.menu.updateMany({ where: { tenantId, categoryId: id }, data: { categoryId: null } });
    return this.prisma.menuCategory.delete({ where: { id } });
  }

  findMenus(tenantId: string, websiteId?: string) {
    return this.prisma.menu.findMany({
      where: { tenantId, status: ContentStatus.ACTIVE, ...(websiteId ? { websiteId } : {}) },
      include: { category: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createMenu(tenantId: string, dto: CreateMenuDto) {
    await this.assertWebsiteOwnership(tenantId, dto.websiteId);
    if (dto.categoryId) await this.assertCategoryOwnership(tenantId, dto.categoryId);

    return this.prisma.menu.create({
      data: {
        tenantId,
        websiteId: dto.websiteId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price === undefined ? undefined : new Prisma.Decimal(dto.price),
        imageUrl: dto.imageUrl,
        isFeatured: dto.isFeatured ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateMenu(tenantId: string, id: string, dto: UpdateMenuDto) {
    await this.assertMenuOwnership(tenantId, id);
    if (dto.categoryId) await this.assertCategoryOwnership(tenantId, dto.categoryId);

    return this.prisma.menu.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price === undefined ? undefined : new Prisma.Decimal(dto.price),
        imageUrl: dto.imageUrl,
        isFeatured: dto.isFeatured,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async reorderMenus(tenantId: string, dto: ReorderMenuDto) {
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.menu.updateMany({
          where: { id: item.id, tenantId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    return { success: true };
  }

  async deleteMenu(tenantId: string, id: string) {
    await this.assertMenuOwnership(tenantId, id);
    return this.prisma.menu.update({
      where: { id },
      data: { status: ContentStatus.ARCHIVED },
    });
  }

  private async assertWebsiteOwnership(tenantId: string, websiteId: string) {
    const website = await this.prisma.website.findFirst({ where: { id: websiteId, tenantId } });
    if (!website) throw new NotFoundException('Website not found');
  }

  private async assertCategoryOwnership(tenantId: string, id: string) {
    const category = await this.prisma.menuCategory.findFirst({ where: { id, tenantId } });
    if (!category) throw new NotFoundException('Menu category not found');
  }

  private async assertMenuOwnership(tenantId: string, id: string) {
    const menu = await this.prisma.menu.findFirst({ where: { id, tenantId } });
    if (!menu) throw new NotFoundException('Menu not found');
  }
}
