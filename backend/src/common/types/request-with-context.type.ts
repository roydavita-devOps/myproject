import { Request } from 'express';
import { AuthenticatedUser } from './authenticated-user.type';
import { TenantContext } from './tenant-context.type';

export type RequestWithContext = Request & {
  user?: AuthenticatedUser;
  tenant?: TenantContext;
};
