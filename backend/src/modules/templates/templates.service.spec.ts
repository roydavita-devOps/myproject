import { BadRequestException } from '@nestjs/common';
import { TemplatesService } from './templates.service';

describe('TemplatesService', () => {
  function createPrismaMock() {
    return {
      template: {
        upsert: jest.fn().mockResolvedValue({ id: 'template-1', name: 'restaurant_premium' }),
      },
    };
  }

  it('lists active templates for customer selection', () => {
    const service = new TemplatesService(createPrismaMock() as never);
    const templates = service.findAll();

    expect(templates.length).toBeGreaterThan(0);
    expect(templates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ templateKey: 'restaurant_premium', tier: 'premium' }),
        expect.objectContaining({ templateKey: 'cafe_premium', tier: 'premium' }),
      ]),
    );
    expect(templates[0]).toEqual(
      expect.objectContaining({
        templateKey: expect.any(String),
        displayName: expect.any(String),
        description: expect.any(String),
        industry: expect.any(String),
        category: expect.any(String),
        tier: expect.any(String),
        previewImage: expect.any(String),
        recommendedBusinessTypes: expect.any(Array),
      }),
    );
  });

  it('creates or reuses a database template with explicit renderer metadata', async () => {
    const prisma = createPrismaMock();
    const service = new TemplatesService(prisma as never);

    await service.findOrCreateDatabaseTemplate('cafe_premium');

    expect(prisma.template.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          name_businessType: {
            name: 'cafe_premium',
            businessType: 'CAFE',
          },
        },
        update: expect.objectContaining({
          schema: expect.objectContaining({ templateKey: 'cafe_premium', rendererKey: 'cafe_premium' }),
        }),
      }),
    );
  });

  it('rejects unknown template keys', () => {
    const service = new TemplatesService(createPrismaMock() as never);

    expect(() => service.findActive('unknown_template')).toThrow(BadRequestException);
  });
});
