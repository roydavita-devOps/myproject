import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { DomainStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestWithContext } from '../types/request-with-context.type';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: RequestWithContext, _: Response, next: NextFunction) {
    const host = req.hostname?.toLowerCase();
    if (!host) return next();

    const domain = await this.prisma.domain.findFirst({
      where: { domain: host, status: DomainStatus.VERIFIED },
      include: { tenant: true },
    });

    if (domain?.tenant) {
      req.tenant = {
        tenantId: domain.tenantId,
        slug: domain.tenant.slug,
        domain: domain.domain,
      };
    }

    next();
  }
}
