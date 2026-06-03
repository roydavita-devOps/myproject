import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithContext } from '../types/request-with-context.type';

export const TenantContext = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithContext>();
  return request.tenant;
});
