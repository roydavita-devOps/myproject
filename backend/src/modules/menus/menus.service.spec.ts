import { MenusService } from './menus.service';
import { NotFoundException } from '@nestjs/common';

describe('MenusService', () => {
  function createUploadsMock() {
    return {
      deleteTenantAssetByUrl: jest.fn().mockResolvedValue({ deleted: true, reason: 'deleted' }),
    };
  }

  it('moves menu items to No category before deleting a category', async () => {
    const prisma = {
      menuCategory: {
        findFirst: jest.fn().mockResolvedValue({ id: 'category-1', tenantId: 'tenant-1' }),
        delete: jest.fn().mockResolvedValue({ id: 'category-1' }),
      },
      menu: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const service = new MenusService(prisma as never, createUploadsMock() as never);

    await service.deleteCategory('tenant-1', 'category-1');

    expect(prisma.menu.updateMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', categoryId: 'category-1' },
      data: { categoryId: null },
    });
    expect(prisma.menuCategory.delete).toHaveBeenCalledWith({ where: { id: 'category-1' } });
  });

  it('clears a menu image without deleting the menu item', async () => {
    const prisma = {
      menu: {
        findFirst: jest.fn().mockResolvedValue({ id: 'menu-1', tenantId: 'tenant-1', imageUrl: '/api/v1/uploads/tenant-1/menu/menu-medium.webp' }),
        update: jest.fn().mockResolvedValue({ id: 'menu-1', imageUrl: null, status: 'ACTIVE' }),
      },
    };
    const uploads = createUploadsMock();
    const service = new MenusService(prisma as never, uploads as never);

    await service.deleteMenuImage('tenant-1', 'menu-1');

    expect(uploads.deleteTenantAssetByUrl).toHaveBeenCalledWith('tenant-1', '/api/v1/uploads/tenant-1/menu/menu-medium.webp', 'menu');
    expect(prisma.menu.update).toHaveBeenCalledWith({
      where: { id: 'menu-1' },
      data: { imageUrl: null },
    });
  });

  it('clears a legacy menu image even when the file is already missing', async () => {
    const prisma = {
      menu: {
        findFirst: jest.fn().mockResolvedValue({ id: 'menu-1', tenantId: 'tenant-1', imageUrl: '/uploads/legacy-menu.webp' }),
        update: jest.fn().mockResolvedValue({ id: 'menu-1', imageUrl: null, status: 'ACTIVE' }),
      },
    };
    const uploads = {
      deleteTenantAssetByUrl: jest.fn().mockRejectedValue(new NotFoundException('Asset not found')),
    };
    const service = new MenusService(prisma as never, uploads as never);

    await service.deleteMenuImage('tenant-1', 'menu-1');

    expect(prisma.menu.update).toHaveBeenCalledWith({
      where: { id: 'menu-1' },
      data: { imageUrl: null },
    });
  });
});
