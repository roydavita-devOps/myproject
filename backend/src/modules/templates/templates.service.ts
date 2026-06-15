import { BadRequestException, Injectable } from '@nestjs/common';
import { BusinessType, Prisma, TemplateStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TemplateCatalogItem, templateCatalog } from './template-catalog';

@Injectable()
export class TemplatesService {
  private readonly catalog = templateCatalog;

  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.catalog.map((item) => ({
      templateKey: item.templateKey,
      displayName: item.displayName,
      description: item.description,
      industry: item.industry,
      category: item.category,
      tier: item.tier,
      previewImage: item.previewImage,
      recommendedBusinessTypes: item.recommendedBusinessTypes,
    }));
  }

  findActive(templateKey: string) {
    const template = this.catalog.find((item) => item.templateKey === templateKey);
    if (!template) throw new BadRequestException('Template is not registered');
    if (template.status !== 'active') throw new BadRequestException('Template is not active');
    return template;
  }

  async findOrCreateDatabaseTemplate(templateKey: string) {
    const metadata = this.findActive(templateKey);
    const name = metadata.templateKey;
    const businessType = metadata.recommendedBusinessTypes[0] ?? BusinessType.LOCAL_SERVICE;

    return this.prisma.template.upsert({
      where: {
        name_businessType: {
          name,
          businessType,
        },
      },
      update: {
        status: TemplateStatus.ACTIVE,
        schema: templateSchemaFor(metadata),
      },
      create: {
        name,
        businessType,
        status: TemplateStatus.ACTIVE,
        schema: templateSchemaFor(metadata),
      },
    });
  }
}

function templateSchemaFor(metadata: TemplateCatalogItem): Prisma.InputJsonValue {
  return {
    templateKey: metadata.templateKey,
    rendererKey: metadata.rendererKey,
    source: 'template-selection-foundation',
  };
}
