import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { RequestWithContext } from '../types/request-with-context.type';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    if (!request.user) return true;
    if (request.user.role === RoleName.SUPER_ADMIN) return true;

    const tenantId = request.user.tenantId ?? request.tenant?.tenantId;
    if (!tenantId) throw new ForbiddenException('Tenant context is required');
    request.tenant = {
      tenantId,
      slug: request.tenant?.slug ?? '',
      domain: request.tenant?.domain,
    };
    return true;
  }
}
