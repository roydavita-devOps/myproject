import { MenusService } from './menus.service';

describe('MenusService', () => {
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
    const service = new MenusService(prisma as never);

    await service.deleteCategory('tenant-1', 'category-1');

    expect(prisma.menu.updateMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', categoryId: 'category-1' },
      data: { categoryId: null },
    });
    expect(prisma.menuCategory.delete).toHaveBeenCalledWith({ where: { id: 'category-1' } });
  });
});
